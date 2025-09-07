import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Budget Manager - Personal Finance Management",
  description: "Modern personal finance management application with automated transaction tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
