import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MindAmo Admin",
  description: "Administrative Dashboard for MindAmo Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}