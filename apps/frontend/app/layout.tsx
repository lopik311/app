import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Telegram WebApp mini-CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="container">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Mini CRM</h2>
            <div className="row">
              <Link href="/webapp">WebApp</Link>
              <Link href="/admin/requests">Admin</Link>
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
