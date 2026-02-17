import "./globals.css";
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Telegram WebApp mini-CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
