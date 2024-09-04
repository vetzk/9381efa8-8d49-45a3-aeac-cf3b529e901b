import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "../utils/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ambisius Test",
  description:
    "CRUD, filtering, sorting, validation, pagination, error handling and best practices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </QueryProvider>
  );
}
