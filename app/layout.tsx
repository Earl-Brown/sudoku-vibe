import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Killer Sudoku",
  description: "A fully offline Killer Sudoku web app."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
