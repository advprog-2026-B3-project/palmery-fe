import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Palmery - Palm Oil Plantation Management",
  description: "Enterprise field portal for palm oil plantation management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
