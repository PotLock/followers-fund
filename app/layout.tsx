import "./globals.css";
import { GeistSans } from "geist/font/sans";
import SessionProvider from "../components/SessionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
