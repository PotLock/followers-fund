import {kv} from "@vercel/kv";
import {Payout} from "@/app/types";
import { PayoutDetail } from "@/app/detail"
import Head from "next/head";
import {Metadata, ResolvingMetadata} from "next";

const  getPayout = async(id: string) => {

    try {
        let payout: any | null = await kv.hgetall(`payout:${id}`);
        console.log(payout)
        if (!payout) {
            return null;
        }

        return payout;
    } catch (error) {
        console.error(error);
        return null;
    }
}

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = params.id
    const payout = await getPayout(id)

    const fcMetadata: Record<string, string> = {
        "fc:frame": "vNext",
        "fc:frame:post_url": `${process.env['HOST']}/api/payout?id=${id}`,
        "fc:frame:image": `${process.env['HOST']}/api/image?id=${id}`,
    };
    payout.user.filter((o:any) => o !== "").map((user:any, index:any) => {
        fcMetadata[`fc:frame:button:${index + 1}`] = user.username;
    })


    return {
        title: payout.title,
        openGraph: {
            title: payout.title,
            images: [`/api/image?id=${id}`],
        },
        other: {
            ...fcMetadata,
        },
        metadataBase: new URL(process.env['HOST'] || '')
    }
}

function getMeta(
    payout: Payout
) {
    // This didn't work for some reason
    return (
        <Head>
            <meta property="og:image" content="" key="test"></meta>
            <meta property="og:title" content="My page title" key="title"/>
        </Head>
    );
}


export default async function Page({params}: { params: {id: string}}) {
    const payout = await getPayout(params.id);

    return(
        <>
            <div className="flex flex-col items-center min-h-screen py-2">
                <main className="flex flex-col flex-1 px-4 sm:px-20">
                    <PayoutDetail payout={payout}/>
                </main>
            </div>
        </>
    );

}