import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import { Payout } from "@/app/types";
import { kv } from "@vercel/kv";
import satori from "satori";
import { join } from 'path';
import * as fs from "fs";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const payoutId = req.query['id']
        // const fid = parseInt(req.query['fid']?.toString() || '')
        if (!payoutId) {
            return res.status(400).send('Missing payout ID');
        }

        let payout: any = await kv.hgetall(`payout:${payoutId}`);

        console.log(payout)
        if (!payout) {
            return res.status(400).send('Missing payout ID');
        }
        const showResults = req.query['results'] === 'true'
        // let votedOption: number | null = null
        // if (showResults && fid > 0) {
        //     votedOption = await kv.hget(`payout:${payoutId}:amount`, `${fid}`) as number
        // }

        const payoutOptions = payout.user.map((obj:any) => obj.fid);
            
        
        const totalMatched = payout.user.map((obj:any) => obj.matched) // Extract the 'number' property
        .reduce((acc:any, curr:any) => acc + curr, 0);

        

        const payoutData = {
            question: showResults ? `Results for ${payout.title}` : payout.title,
            users: payout.user
                .map((user:any, index:any) => {
                    // @ts-ignore
                    const matched = user.matched; 
                    const percentOfTotal = totalMatched ? Math.round(matched / totalMatched * 100) : 0;
                    let text = showResults ? `${percentOfTotal}%: ${user.username} (${matched} Matched) ${(parseFloat(payout.amount)  *percentOfTotal)/100} ${payout.token}` : `${index + 1}. ${user.username}-(${matched} Matched)-(${(parseFloat(payout.amount) *percentOfTotal)/100} ${payout.token})`
                    return { user, matched, text, percentOfTotal }
                })
        };

        const svg = await satori(
            <div style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: 'f4f4f4',
                padding: 50,
                lineHeight: 1.2,
                fontSize: 24,
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 20,
                }}>
                    <h2 style={{ textAlign: 'center', color: 'lightgray' }}>{payout.title || "Payout:"}</h2>
                    {
                        payoutData.users.map((opt:any, index:any) => {
                            return (
                                <div style={{
                                    backgroundColor: showResults ? '#007bff' : '',
                                    color: '#fff',
                                    padding: 10,
                                    marginBottom: 10,
                                    borderRadius: 4,
                                    width: `${showResults ? opt.percentOfTotal : 100}%`,
                                    whiteSpace: 'nowrap',
                                    overflow: 'visible',
                                }}>{opt.text}</div>
                            )
                        })
                    }
                    {/*{showResults ? <h3 style={{color: "darkgray"}}>Total amount: {totalVotes}</h3> : ''}*/}
                </div>
            </div>
            ,
            {
                width: 600, height: 400, fonts: [{
                    data: fontData,
                    name: 'Roboto',
                    style: 'normal',
                    weight: 400
                }]
            })

        // Convert SVG to PNG using Sharp
        const pngBuffer = await sharp(Buffer.from(svg))
            .toFormat('png')
            .toBuffer();

        // Set the content type to PNG and send the response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'max-age=10');
        res.send(pngBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
}