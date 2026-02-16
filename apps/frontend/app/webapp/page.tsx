"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet } from "@/lib/api";

type Row = {
  id: number;
  request_number: number;
  direction: string;
  delivery_date: string;
  status: string;
  created_at: string;
};

export default function WebAppRequestsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/api/webapp/requests", { headers: { "X-Telegram-Init-Data": (window as any).Telegram?.WebApp?.initData || "" } })
      .then(setRows)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Мои заявки</h3>
        <Link href="/webapp/new" className="btn">
          Новая заявка
        </Link>
      </div>
      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Направление</TableHead>
              <TableHead>Дата доставки</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создано</TableHead>
              <TableHead>Открыть</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.request_number}</TableCell>
                <TableCell>{r.direction}</TableCell>
                <TableCell>{r.delivery_date}</TableCell>
                <TableCell><Badge>{r.status}</Badge></TableCell>
                <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Link href={`/webapp/${r.id}`}>Карточка</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
