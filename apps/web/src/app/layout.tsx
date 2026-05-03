import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkU",
  description: "校园滑卡匹配平台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
