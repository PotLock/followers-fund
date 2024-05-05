"use client";
import "@farcaster/auth-kit/styles.css";

import Head from "next/head";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import {
  SignInButton,
  AuthKitProvider,
  StatusAPIResponse,
} from "@farcaster/auth-kit";
import { PayoutCreateForm } from "./form";
import { useCallback, useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { Account } from './account'
import { WalletOptions } from './wallet-options'
import { config } from './config'


const queryClient = new QueryClient()

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

const configFarcaster = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "https://www.followers.fund/",
  domain: "https://www.followers.fund/",
};

export default function Home() {
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
              <AuthKitProvider config={configFarcaster}>
                <Content />
              </AuthKitProvider>
            </main>
          </div>
        </QueryClientProvider>
      </WagmiProvider>

    </>
  );
}

function Content() {
  const [error, setError] = useState(false);

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
  const { data: session } = useSession();
  return (
    <div>
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


      <div>

        <Profile />
      </div>

    </div>
  );
}

function Profile() {
  const { data: session } = useSession();

  return session ? (
    <div style={{ fontFamily: "sans-serif" }}>
      <p>Signed in as {session.user?.name} </p>
      <h2>Create payout</h2>
      <div className="flex flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
        <PayoutCreateForm fId={session.user?.name as string} />
      </div>
    </div>
  ) : (
    <p>
      Click the &quot;Sign in with Farcaster&quote; button above, then scan the QR code to
      sign in.
    </p>
  );
}