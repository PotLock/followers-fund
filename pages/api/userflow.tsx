import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import { error } from 'console';

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);


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
        const fid = req.query['fid']
        // const fid = parseInt(req.query['fid']?.toString() || '')
        if (!fid) {
            return res.status(400).send({ error: 'Missing fID' });
        }
       
        const rishFollowings = await fetchAllFollowing(parseInt(fid as string));
        res.send({ result: rishFollowings });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error:'Error fetch data '});
    }
}