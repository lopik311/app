"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWebApp = pathname.startsWith("/webapp");

  if (isWebApp) {
    return <div className="container webapp-container">{children}</div>;
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Mini CRM</h2>
        <div className="topnav">
          <Link href="/">Вход</Link>
          <Link href="/requests">Заявки</Link>
          <Link href="/organizations">Организации</Link>
          <Link href="/price">Прайс</Link>
          <Link href="/directions">Направления</Link>
          <Link href="/payments">Оплаты</Link>
          <Link href="/webapp">WebApp</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
