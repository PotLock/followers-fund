import "./globals.css";
import { GeistSans } from "geist/font/sans";
import SessionProvider from "../components/SessionProvider";
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { config } from './config'
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    config,
    headers().get('cookie')
  )
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <Providers initialState={initialState}> 
        <SessionProvider>
          {children}
        </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
