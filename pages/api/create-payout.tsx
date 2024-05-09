import type { NextApiRequest, NextApiResponse } from 'next';
import { Payout, PAYOUT_EXPIRY } from "@/app/types";
import { kv } from "@vercel/kv";
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const HUB_URL = process.env['HUB_URL']
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        try {
            const payout : any = req.body

            if (!payout.id) {
                return res.status(400).send('Missing payout ID');
            }

            await kv.hset(`payout:${payout.id}`, payout);
            await kv.expire(`payout:${payout.id}`, PAYOUT_EXPIRY);
            await kv.zadd("payouts_by_date", {
                score: Number(payout.created_at),
                member: payout.id,
            });

            res.send({ status: "succesful" });

        } catch (error) {
            console.error(error);
            res.status(500).send('Error request');
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}