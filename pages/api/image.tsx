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


const fetchAllFollowing = async (fid: number) => {
    let cursor: string | null = "";
    let users: unknown[] = [];
    do {
        const result = await client.fetchUserFollowing(fid , {
            limit: 150,
            cursor,
        });
        users = users.concat(result.result.users);
        cursor = result.result.next.cursor;
        console.log(cursor);
    } while (cursor !== "" && cursor !== null);

    return users;
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const payoutId = req.query['id']
        // const fid = parseInt(req.query['fid']?.toString() || '')
        if (!payoutId) {
            return res.status(400).send('Missing payout ID');
        }

        let payout: Payout | null = await kv.hgetall(`payout:${payoutId}`);

        console.log(payout)
        if (!payout) {
            return res.status(400).send('Missing payout ID');
        }
        const amountUser1 = await fetchAllFollowing(parseInt(payout.user1.split("-")[1]));
        const amountUser2 = await fetchAllFollowing(parseInt(payout.user2.split("-")[1]));
        const amountUser3 = await fetchAllFollowing(parseInt(payout.user3.split("-")[1]));
        const amountUser4 = await fetchAllFollowing(parseInt(payout.user4.split("-")[1]));
        const totalAmount = payout.totalAmount;
        const token = payout.token;
        payout.amount1 = amountUser1.length;
        payout.amount2 = amountUser2.length;
        payout.amount3 = amountUser3.length;
        payout.amount4 = amountUser4.length;
        const showResults = req.query['results'] === 'true'
        // let votedOption: number | null = null
        // if (showResults && fid > 0) {
        //     votedOption = await kv.hget(`payout:${payoutId}:amount`, `${fid}`) as number
        // }

        const payoutOptions = [payout.user1, payout.user2, payout.user3, payout.user4]
            .filter((user) => user !== '');
            
            console.log(payoutOptions)
        const totalVotes = payoutOptions
            // @ts-ignore
            .map((user, index) => parseInt(payout[`amount${index + 1}`]))
            .reduce((a, b) => a + b, 0);

            
        const payoutData = {
            question: showResults ? `Results for ${payout.title}` : payout.title,
            users: payoutOptions
                .map((user, index) => {
                    // @ts-ignore
                    const amount = payout[`amount${index + 1}`]
              
                    const percentOfTotal = totalVotes ? Math.round(amount / totalVotes * 100) : 0;
                    let text = showResults ? `${percentOfTotal}%: ${user.split("-")[0]} (${amount} Followers) ${(totalAmount  *percentOfTotal)/100} ${token}` : `${index + 1}. ${user.split("-")[0]}-(${amount} Followers) ${(totalAmount  *percentOfTotal)/100} ${token}`
                    return { user, amount, text, percentOfTotal }
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
                    <h2 style={{ textAlign: 'center', color: 'lightgray' }}>{payout.title}</h2>
                    {
                        payoutData.users.map((opt, index) => {
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