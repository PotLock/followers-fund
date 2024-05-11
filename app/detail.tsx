
"use client";

import clsx from "clsx";
import { useOptimistic, useRef, useState, useTransition, useEffect } from "react";
import { redirectToPayouts, savePayout, votePayout } from "./actions";
import { v4 as uuidv4 } from "uuid";
import { Payout } from "./types";
import { useRouter, useSearchParams } from "next/navigation";
import { sendTransaction } from '@wagmi/core'
import { parseEther } from 'viem'
import { config } from './config'
import { Account } from './account'
import { WalletOptions } from './wallet-options'
import { useAccount, useDisconnect } from 'wagmi'
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Link,
    Image,
    Button,
    Avatar
} from "@nextui-org/react";

const sendTranstaction = async (address: string, amount: string) => {
    const result = await sendTransaction(config, {
        to: `0x${address}`,
        value: parseEther(amount),
    })
}
const ConnectWallet = () => {
    const { isConnected } = useAccount()
    if (isConnected) return <Account />
    return <WalletOptions />
}

export function PayoutDetail({ payout }: { payout: any }) {
    const [selectedOption, setSelectedOption] = useState(-1);

    const { address } = useAccount()
    const { disconnect } = useDisconnect()
    return (
        <div className="">
            <Button
                href="/"
                as={Link}
                color="primary"
                variant="solid"
            >
                Back
            </Button>
            <Card className="max-w-[400px] mt-2">
                <CardHeader className="flex gap-3">
                    <Image
                        height={40}
                        radius="sm"
                        src={payout.user_created.user.pfp_url}
                        width={40}
                    />
                    <div className="flex flex-col">
                        <p className="text-md">{payout.user_created.user.display_name}</p>
                        <p className="text-small text-default-500">{payout.user_created.user.custody_address}</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <p>{payout.title}</p>
                    <Image
                        alt="Woman listing to music"
                        className="object-cover"
                        src={`http://localhost:3000/api/image?id=${payout.id}`}
                    />
                </CardBody>
                <Divider />
                <CardFooter>
                    <Link
                        isExternal
                        showAnchorIcon
                        href={`https://warpcast.com/~/compose?text="👤💸 followers.fund quadratically airdrop your followers with the most clout Make the sign in button in Center and the footer 
                        ❤️ by 🫕 Potlock"&embeds[]=${process.env['HOST']}/api/payout?id=${payout.id}`}
                    >
                        Cast
                    </Link>
                </CardFooter>
            </Card>
            <div className="flex flex-col space-y-4 pt-4">
                {payout.user && payout.user.map((user: any) =>
                    <>
                        <Card className="max-w-[400px]">
                            <CardHeader className="flexjustify-between">
                                <div className="flex gap-5">
                                    <Avatar isBordered radius="full" size="md" src={user.pfp} />
                                    <div className="flex flex-col gap-1 items-start justify-center">
                                        <h4 className="text-small font-semibold leading-none text-default-600">{user.username} - Matched : {user.matched} - Allocations : {user.allocations}</h4>
                                        <h5 className="text-small tracking-tight text-default-400">{user.custodyAddress}</h5>
                                    </div>

                                </div>

                            </CardHeader>
                        </Card>
                    </>
                )}
                {address ? <>
                    <div>
                        <button onClick={() => disconnect()} className="bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Disconnect</button></div>
                </> : <ConnectWallet />}
            </div>
        </div>
    );
}