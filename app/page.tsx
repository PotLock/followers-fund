"use client";
import "@farcaster/auth-kit/styles.css";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";

import {
  SignInButton,
  AuthKitProvider,
  StatusAPIResponse,
} from "@farcaster/auth-kit";
import { PayoutCreateForm1 } from "./createPayoutForm"
import { useCallback, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider} from 'wagmi'
import { config } from './config'

const queryClient = new QueryClient()

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
          <div className=" ">
            <main className="flex h-screen justify-center p-4">
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
  const [payouts, setPayouts] = useState([]);
  const getPayout = async () => {
    const res = await fetch(`/api/payout`);
    const data: any = await res.json();
    setPayouts(data.result);
  }
  useEffect(() => {
    getPayout();
  }, []);

  return session ? (

    <div className="flex min-h-dvh flex-col">
       <PayoutCreateForm1 fid={session.user?.name as string} />
      <div className="flex flex-col max-w-sm ">
        {payouts.map((payout: any) =>
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
              <Link href={`/payouts/${payout.id}`}>
              
              <Image
                alt="Woman listing to music"
                className="object-cover"
                src={`${process.env.NEXT_URL}/api/image?id=${payout.id}`}
              />
              </Link>
            </CardBody>
            <Divider />
            <CardFooter>
              <Link
                isExternal
                showAnchorIcon
                href="#"
              >
                Cast
              </Link>
            </CardFooter>
          </Card>
        )}
        <div className="p-8">
         
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