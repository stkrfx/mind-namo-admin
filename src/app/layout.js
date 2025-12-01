import { Inter } from "next/font/google";
import { Providers } from "@/components/providers"; // Import the client wrapper
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
        {/* Use the client-side wrapper here */}
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}