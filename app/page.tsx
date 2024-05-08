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
import { PayoutCreateForm1 } from "./createPayoutForm"
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
  domain: "followers.fund",
};

export default function Home() {
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <div className="flex h-full flex-col ">
            <main className="flex justify-center ">
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

    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
    <div className="md:flex">
      <div className="p-8">
      <PayoutCreateForm1 fid={session.user?.name as string} />
      </div>
    </div>
  </div>
  ) : (
    <p>
      Click the &quot;Sign in with Farcaster&quote; button above, then scan the QR code to
      sign in.
    </p>
  );
}