import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "RosyClass - Trung tâm Tiếng Anh Hàng Đầu",
  description: "Hệ thống quản lý và học tập tiếng Anh toàn diện",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
