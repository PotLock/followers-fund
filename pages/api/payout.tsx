import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from "@vercel/kv";

const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            let payoutIds = await kv.zrange("payouts_by_date", Date.now(), Date.now() - SEVEN_DAYS_IN_MS, { byScore: true, rev: true, count: 100, offset: 0 });

            if (!payoutIds.length) {
                return [];
            }

            let multi = kv.multi();
            payoutIds.forEach((id) => {
                multi.hgetall(`payout:${id}`);
            });

            let items : any = await multi.exec();
            const result = items.map((item :any) => {
                return { ...item };
            });

            res.send({ result });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error request');
        }
    }else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}