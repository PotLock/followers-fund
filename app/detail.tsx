
"use client";

import { useState, useCallback, useEffect } from "react";
import { waitForTransactionReceipt, getChainId, switchChain, readContract } from '@wagmi/core'
import { erc20Abi, parseEther, parseGwei } from 'viem'
import { config } from './config'
import { Account } from './account'
import { WalletOptions } from './wallet-options'
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt, type BaseError, useReadContract } from 'wagmi'
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
    const abi = [{ "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "address[]", "name": "_addresses", "type": "address[]" }, { "internalType": "uint256[]", "name": "_amounts", "type": "uint256[]" }, { "internalType": "uint256", "name": "_totalAmount", "type": "uint256" }], "name": "airdropERC20", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_nft", "type": "address" }, { "internalType": "address[]", "name": "_addresses", "type": "address[]" }, { "internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]" }], "name": "airdropERC721", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_addresses", "type": "address[]" }, { "internalType": "uint256[]", "name": "_amounts", "type": "uint256[]" }], "name": "airdropETH", "outputs": [], "stateMutability": "payable", "type": "function" }]
    const abiErc20 = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }]
    const { data: hash, isPending, writeContractAsync, error: err } = useWriteContract()
    const chainId = getChainId(config)
    const [isAllowance, setIsAllowance] = useState(true);
    const [isPaid, setIsPaid] = useState(false);

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
        }, []);

    const checkAllowance = async () => {
        if (address && payout.token !== 'ethereum') {
            const contractAddress =
                payout.network == '1' ? '0x09350F89e2D7B6e96bA730783c2d76137B045FEF' :
                    payout.network == '11155111' ? '0x09350F89e2D7B6e96bA730783c2d76137B045FEF' :
                        payout.network == '8453' ? '0x09350F89e2D7B6e96bA730783c2d76137B045FEF' :
                            payout.network == '84532' ? '0xf6c3555139aeA30f4a2be73EBC46ba64BAB8ac12' :
                                '';
            console.log("contractAddress",contractAddress)
            const allowance = await readContract(config, {
                address: payout.tokenAddress,
                abi: abiErc20,
                functionName: "allowance",
                args: [`0x${address.slice(2)}`, `0x${contractAddress?.slice(2)}`],
            });

            if (allowance as any < parseEther(payout.amount)) {
                setIsAllowance(false)
            }

        }
        const getPaid: any = await fetch(`/api/update-payout?payout_id=${payout.id}`);
        const { result } = await getPaid.json();
        if (result) {
            setIsPaid(true)
        }
    }
    useEffect(() => {
        checkAllowance();

    }, [])



    const sendTranstaction = async (user: any, totalAmount: any) => {
        const userAddress = user.map((obj: any) => obj.custodyAddress)
        const allocations = user.map((obj: any) => parseEther(obj.allocations));

        if (chainId == payout.network) {
            const contractAddress =
                payout.network == '1' ? '0x09350F89e2D7B6e96bA730783c2d76137B045FEF' :
                    payout.network == '11155111' ? '0x09350F89e2D7B6e96bA730783c2d76137B045FEF' :
                        payout.network == '8453' ? '0x09350F89e2D7B6e96bA730783c2d76137B045FEF' :
                            payout.network == '84532' ? '0xf6c3555139aeA30f4a2be73EBC46ba64BAB8ac12' :
                                '';
            if (payout.token == 'ethereum') {
                const tx = await writeContractAsync({
                    address: `0x${contractAddress.slice(2)}`,
                    abi,
                    functionName: 'airdropETH',
                    args: [userAddress, allocations],
                    chainId: chainId,
                    value: parseEther(payout.amount),
                })
                const transactionReceipt = await waitForTransactionReceipt(config, {
                    chainId: chainId,
                    hash: tx,
                })
                if (transactionReceipt.status == 'success') {

                    const receipt: any = {
                        tx: tx,
                        payout_id: payout.id,
                        created_at: new Date().getTime(),
                    }
                    await fetch('/api/update-payout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(receipt),
                    });
                }
            } else {
                if (address) {
                    const allowance = await readContract(config, {
                        address: payout.tokenAddress,
                        abi: abiErc20,
                        functionName: "allowance",
                        args: [`0x${address.slice(2)}`, `0x${contractAddress?.slice(2)}`],
                    });

                    if (allowance as any >= parseEther(payout.amount)) {
                        const tx = await writeContractAsync({
                            address: `0x${contractAddress.slice(2)}`,
                            abi,
                            functionName: 'airdropERC20',
                            args: [payout.tokenAddress, userAddress, allocations, parseEther(payout.amount)],
                            chainId: chainId,
                        })
                        const transactionReceipt = await waitForTransactionReceipt(config, {
                            chainId: chainId,
                            hash: tx,
                        })
                        if (transactionReceipt.status == 'success') {
                            const receipt = {
                                tx: tx,
                                payout_id: payout.id,
                                created_at: new Date().getTime(),
                            }
                            await fetch('/api/update-payout', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(receipt), // Replace with your actual data
                            });
                        }
                    } else {
                        const tx = await writeContractAsync({
                            address: `0x${payout.tokenAddress.slice(2)}`,
                            abi: erc20Abi,
                            functionName: 'approve',
                            args: [`0x${contractAddress.slice(2)}`, parseEther(payout.amount)],
                            chainId: chainId,
                        })
                        const transactionReceipt = await waitForTransactionReceipt(config, {
                            chainId: chainId,
                            hash: tx,
                        })
                        if (transactionReceipt.status == 'success') {
                            setIsAllowance(true);
                        }
                    }
                }
            }
        } else {
            await switchChain(config, { chainId: parseInt(payout.network) as 1 | 11155111 | 8453 | 84532 | 81457 })
        }

    }


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
            <div className="py-2 grid justify-items-end">
                <Button
                    href="/"
                    as={Link}
                    color="primary"
                    variant="solid"
                >
                    Back
                </Button>
            </div>

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
                        src={`/api/image?id=${payout.id}`}
                    />
                </CardBody>
                <Divider />
                <CardFooter>
                    <Link
                        isExternal
                        showAnchorIcon
                        href={`https://warpcast.com/~/compose?text="👤💸 followers.fund quadratically airdrop your followers with the most clout Make the sign in button in Center and the footer 
                        ❤️ by 🫕 Potlock"&embeds[]=${process.env['HOST']}/payouts/${payout.id}`}
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
                {isPaid && (
                    <Button isDisabled={true}>Paid</Button>
                )}
                {address && isPaid == false &&
                    <>
                        <Button onClick={() => sendTranstaction(payout.user, payout.amount)} isDisabled={isPending}>{payout.network == chainId && isAllowance ? "Payout" : payout.network == chainId && isAllowance == false ? "Approve" : "Switch Chain"}</Button>
                        <Button onClick={() => disconnect()} >Disconnect</Button>
                        {err && (
                            <div className="max-w-[400px]">Error: {(err as BaseError).shortMessage || err.message}</div>
                        )}
                    </>
                }
                {!address &&
                    <ConnectWallet />
                }
            </div>
        </div>
    );
}