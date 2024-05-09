import type { NextApiRequest, NextApiResponse } from 'next';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const userFid: any = req.query['fid']
            if (!userFid) {
                return res.status(400).send('Missing payout ID');
            }
            const {users} = await client.fetchBulkUsers([parseInt(userFid)]);
            
            res.send({ user: users[0] });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error request');
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}