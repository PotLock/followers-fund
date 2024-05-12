
"use client";

import { useState, useCallback } from "react";
import { sendTransaction, writeContract } from '@wagmi/core'
import { parseEther } from 'viem'
import { config } from './config'
import { Account } from './account'
import { WalletOptions } from './wallet-options'
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt ,type BaseError} from 'wagmi'
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import {
    SignInButton,
    AuthKitProvider,
    StatusAPIResponse,
} from "@farcaster/auth-kit";
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


const ConnectWallet = () => {
    const { isConnected } = useAccount()
    if (isConnected) return <Account />
    return <WalletOptions />
}

export function PayoutDetail({ payout }: { payout: any }) {
    const { data: session } = useSession();
    const { address } = useAccount()
    const { disconnect } = useDisconnect()
    const [error, setError] = useState(false);
    const { data: hash, isPending, writeContract, error: err } = useWriteContract()

    const getNonce = useCallback(async () => {
        const nonce = await getCsrfToken();
        if (!nonce) throw new Error("Unable to generate nonce");
        return nonce;
    }, []);

    const handleSuccess = useCallback(
        (res: StatusAPIResponse) => {
            signIn("credentials", {
                message: res.message,
                signature: res.signature,
                name: res.fid,
                pfp: res.pfpUrl,
                redirect: false,
            });
        },
        []
    );
    const abi = [{ "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "address[]", "name": "_addresses", "type": "address[]" }, { "internalType": "uint256[]", "name": "_amounts", "type": "uint256[]" }, { "internalType": "uint256", "name": "_totalAmount", "type": "uint256" }], "name": "airdropERC20", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_nft", "type": "address" }, { "internalType": "address[]", "name": "_addresses", "type": "address[]" }, { "internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]" }], "name": "airdropERC721", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_addresses", "type": "address[]" }, { "internalType": "uint256[]", "name": "_amounts", "type": "uint256[]" }], "name": "airdropETH", "outputs": [], "stateMutability": "payable", "type": "function" }]
    const sendTranstaction = async (user: any, totalAmount: any) => {
        const address = user.map((obj: any) => obj.custodyAddress)
        const allocations = user.map((obj: any) => parseEther(obj.allocations))
        console.log(address, allocations)
        const contractAddress = '0x09350F89e2D7B6e96bA730783c2d76137B045FEF'
        writeContract({
            address: contractAddress,
            abi,
            functionName: 'airdropETH',
            args: [address, allocations],
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })
    return (
        <div className="">
            <div style={{ position: "fixed", top: "12px", right: "12px" }}>
                {session ? (
                    <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => signOut()}
                    >
                        Sign out
                    </button>
                ) : (
                    <SignInButton
                        nonce={getNonce}
                        onSuccess={handleSuccess}
                        onError={() => setError(true)}
                        onSignOut={() => signOut()}
                    />
                )}
                {error && <div>Unable to sign in at this time.</div>}
            </div>
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
                    <>
                        <Button onClick={() => sendTranstaction(payout.user, payout.amount)} isDisabled={isPending}>Payout</Button>
                        <Button onClick={() => disconnect()} >Disconnect</Button>
                        {err && (
                            <div className="max-w-[400px]">Error: {(err as BaseError).shortMessage || err.message}</div>
                        )}
                    </>

                </> : <ConnectWallet />
                }
            </div>
        </div>
    );
}