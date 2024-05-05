import {kv} from "@vercel/kv";
import {Payout} from "@/app/types";
import {PayoutVoteForm} from "@/app/form";
import Head from "next/head";
import {Metadata, ResolvingMetadata} from "next";

async function getPayout(id: string): Promise<Payout> {
    let nullPayout = {
        id: "",
        title: "No payout found",
        user1: "",
        user2: "",
        user3: "",
        user4: "",
        amount1: 0,
        amount2: 0,
        amount3: 0,
        amount4: 0,
        token:"",
        totalAmount:0,
        created_at: 0,
    };

    try {
        let payout: Payout | null = await kv.hgetall(`payout:${id}`);
        if (!payout) {
            return nullPayout;
        }

        return payout;
    } catch (error) {
        console.error(error);
        return nullPayout;
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
    [payout.user1, payout.user2, payout.user3, payout.user4].filter(o => o !== "").map((user, index) => {
        fcMetadata[`fc:frame:button:${index + 1}`] = user.split("-")[0];
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
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                    <PayoutVoteForm payout={payout}/>
                </main>
            </div>
        </>
    );

}