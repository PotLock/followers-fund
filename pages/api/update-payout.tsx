import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from "@vercel/kv";

export const PAYOUT_EXPIRY = 60 * 60 * 24 * 180;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        try {
            const receipt: any = req.body

            if (!receipt.payout_id) {
                return res.status(400).send('Missing payout ID');
            }

            await kv.hset(`payout:${receipt.payout_id}:receipt`, receipt);
            await kv.expire(`payout:${receipt.payout_id}:receipt`, PAYOUT_EXPIRY);
            
            res.send({ status: "succesful" });

        } catch (error) {
            console.error(error);
            res.status(500).send('Error request');
        }
    } 

    if (req.method === 'GET') {

        try {
            const payout_id: any = req.query['payout_id']

            if (!payout_id) {
                return res.status(400).send('Missing payout ID');
            }

            let result: any | null = await kv.hgetall(`payout:${payout_id}:receipt`);
            res.send({ result });

        } catch (error) {
            console.error(error);
            res.status(500).send('Error request');
        }
    }
}