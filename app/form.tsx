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
import {  useAccount , useDisconnect } from 'wagmi'

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

const sendTranstaction = async (address: string, amount: string) => {
    const result = await sendTransaction(config, {
        to: `0x${address}`,
        value: parseEther(amount),
    })
}

type PayoutState = {
    newPayout: Payout;
    updatedPayout?: Payout;
    pending: boolean;
    voted?: boolean;
};

type Props = {
    fId: string;
}
declare let window: any;
export function PayoutCreateForm({ fId }: Props) {

    let formRef = useRef<HTMLFormElement>(null);
    let [state, mutate] = useOptimistic(
        { pending: false },
        function createReducer(state, newPayout: PayoutState) {
            if (newPayout.newPayout) {
                return {
                    pending: newPayout.pending,
                };
            } else {
                return {
                    pending: newPayout.pending,
                };
            }
        },
    );

    let payoutStub = {
        id: uuidv4(),
        created_at: new Date().getTime(),
        title: "",
        user1: "",
        user2: "",
        user3: "",
        user4: "",
        amount1: 0,
        amount2: 0,
        amount3: 0,
        amount4: 0,
        token: "",
        totalAmount: 0,
    };

    let saveWithNewPayout = savePayout.bind(null, payoutStub);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let [isPending, startTransition] = useTransition();
    const [userFollow, setUserFollow] = useState([]);
    const [selectedUser1, setSelectedUser1] = useState("");
    const [selectedUser2, setSelectedUser2] = useState("");
    const [selectedUser3, setSelectedUser3] = useState("");
    const [selectedUser4, setSelectedUser4] = useState("");
    const [selectedToken, setSelectedToken] = useState("");
    useEffect(() => {
        fetch(`/api/userflow?fid=${fId}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data.result);
                setUserFollow(data.result);
            });
    }, []);
    return (
        <>
            <div className="mx-8 w-full">
                <form
                    className="relative my-8"
                    ref={formRef}
                    action={saveWithNewPayout}
                    onSubmit={(event) => {
                        event.preventDefault();
                        let formData = new FormData(event.currentTarget);
                        let newPayout = {
                            ...payoutStub,
                            title: formData.get("title") as string,
                            user1: formData.get("user1") as string,
                            user2: formData.get("user2") as string,
                            user3: formData.get("user3") as string,
                            user4: formData.get("user4") as string,
                            amount1: 0,
                            amount2: 0,
                            amount3: 0,
                            amount4: 0,
                            token: formData.get("token") as string,
                            totalAmount: parseInt(formData.get("totalAmount") as string),
                        };

                        formRef.current?.reset();
                        startTransition(async () => {
                            mutate({
                                newPayout,
                                pending: true,
                            });

                            await savePayout(newPayout, formData);
                        });
                    }}
                >

                    <input
                        aria-label="Payout Title"
                        className="pl-3 mb-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                        maxLength={150}
                        placeholder="Title..."
                        required
                        type="text"
                        name="title"
                    />
                    <select
                        id="user1"
                        name="user1"
                        aria-label="User 1"
                        className="block mb-3 w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={e => setSelectedUser1(e.target.value)}
                    >
                        {userFollow && userFollow.map((user: any) => (
                            <option value={`${user.username}-${user.fid}-${user.custodyAddress}`}>
                                <img src={user.pfp.url}></img>
                                {user.displayName}
                            </option>
                        ))}
                    </select>
                    <select
                        id="user2"
                        name="user2"
                        className="block mb-3 w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        defaultValue={0}

                        onChange={e => setSelectedUser2(e.target.value)}
                    >
                        {userFollow && userFollow.map((user: any) => (
                            <option value={`${user.username}-${user.fid}-${user.custodyAddress}`}>
                                {user.displayName}
                            </option>
                        ))}
                    </select>
                    <select
                        id="user3"
                        name="user3"
                        className="block mb-3 w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        defaultValue={0}

                        onChange={e => setSelectedUser3(e.target.value)}
                    >
                        {userFollow && userFollow.map((user: any) => (
                            <option value={`${user.username}-${user.fid}-${user.custodyAddress}`}>
                                {user.displayName}
                            </option>
                        ))}
                    </select>
                    <select
                        id="user4"
                        name="user4"
                        className="block mb-3 w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        defaultValue={0}

                        onChange={e => setSelectedUser4(e.target.value)}
                    >
                        {userFollow && userFollow.map((user: any) => (
                            <option value={`${user.username}-${user.fid}-${user.custodyAddress}`}>
                                {user.displayName}
                            </option>
                        ))}
                    </select>
                    <select
                        id="token"
                        name="token"
                        className="block mb-3 w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        defaultValue={0}

                        onChange={e => setSelectedToken(e.target.value)}
                    >
                        <option value="ethereum">
                            Ethereum
                        </option>
                    </select>
                    <input
                        aria-label="Total Amount"
                        className="pl-3 mb-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                        maxLength={150}
                        placeholder="Total Amount..."
                        required
                        type="number"
                        name="totalAmount"
                    />

                    <div className={"pt-2 flex justify-end"}>
                        <button
                            className={clsx(
                                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                                state.pending && "bg-gray-700 cursor-not-allowed",
                            )}
                            type="submit"
                            disabled={state.pending}
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
            <div className="w-full">
            </div>
        </>
    );
}

function PayoutOptions({ payout, onChange }: { payout: Payout, onChange: (index: number) => void }) {
    return (
        <div className="mb-4 text-left">
            {[payout.user1, payout.user2, payout.user3, payout.user4].filter(e => e !== "").map((user, index) => (
                <label key={index} className="block">
                    <input
                        type="radio"
                        name="payout"
                        value={user}
                        onChange={() => onChange(index + 1)}
                        className="mr-2"
                    />
                    {user}
                </label>
            ))}
        </div>
    );
}

function PayoutResults({ payout }: { payout: Payout }) {
    return (
        <div className="mb-4">
            <img src={`/api/image?id=${payout.id}&results=true&date=${Date.now()}`} alt='payout results' />
        </div>
    );
}

export function PayoutVoteForm({ payout, viewResults }: { payout: Payout, viewResults?: boolean }) {
    const [selectedOption, setSelectedOption] = useState(-1);
    const router = useRouter();
    const searchParams = useSearchParams();
    viewResults = true;     // Only allow voting via the api
    let formRef = useRef<HTMLFormElement>(null);
    let voteOnPayout = votePayout.bind(null, payout);
    let [isPending, startTransition] = useTransition();
    let [state, mutate] = useOptimistic(
        { showResults: viewResults },
        function createReducer({ showResults }, state: PayoutState) {
            if (state.voted || viewResults) {
                return {
                    showResults: true,
                };
            } else {
                return {
                    showResults: false,
                };
            }
        },
    );

    const handleVote = (index: number) => {
        setSelectedOption(index)
    };
    const { address } = useAccount()
    const { disconnect } = useDisconnect()
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 m-4">
            <div className="font-bold text-xl mb-2">{payout.title}</div>
            <form
                className="relative my-8"
                ref={formRef}
                action={() => voteOnPayout(selectedOption)}
                onSubmit={(event) => {
                    event.preventDefault();
                    let formData = new FormData(event.currentTarget);
                    let newPayout = {
                        ...payout,
                    };

                    // @ts-ignore
                    newPayout[`votes${selectedOption}`] += 1;


                    formRef.current?.reset();
                    startTransition(async () => {
                        mutate({
                            newPayout,
                            pending: false,
                            voted: true,
                        });

                        await redirectToPayouts();
                        // await votePayout(newPayout, selectedOption);
                    });
                }}
            >
                {state.showResults ? <PayoutResults payout={payout} /> : <PayoutOptions payout={payout} onChange={handleVote} />}
                {state.showResults ? <>
                    <button
                        className="bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                    >Back
                    </button>

                    <a
                        className="bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        href={` https://warpcast.com/~/compose?text="👤💸 followers.fund quadratically airdrop your followers with the most clout Make the sign in button in Center and the footer 
❤️ by 🫕 Potlock"&embeds[]=${process.env['HOST']}/api/payout?id=${payout.id}`}> Share Cast</a>
                    <div className="flex flex-col space-y-4 pt-4">
                    {address ? <>
                        <div>  <button type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => sendTranstaction(payout.user1.split("-")[2].replace('0x',''), payout.amount1.toString())}
                        >Payout User 1
                        </button>
                        </div>
                        <div> <button type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => sendTranstaction(payout.user1.split("-")[2].replace('0x',''), payout.amount2.toString())}
                        >Payout User 2
                        </button></div>
                        <div><button type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => sendTranstaction(payout.user1.split("-")[2].replace('0x',''), payout.amount3.toString())}
                        >Payout User 3
                        </button></div>
                        <div> <button type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => sendTranstaction(payout.user1.split("-")[2].replace('0x',''), payout.amount4.toString())}
                        >Payout User 4
                        </button>
                        
                        </div>
                        <div><button onClick={() => disconnect()}  className="bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Disconnect</button></div>
                    </>:<ConnectWallet /> }
                       
                    </div>





                </>
                    :
                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" + (selectedOption < 1 ? " cursor-not-allowed" : "")}
                        type="submit"
                        disabled={selectedOption < 1}
                    >
                        Vote
                    </button>
                }
            </form>
        </div>
    );
}