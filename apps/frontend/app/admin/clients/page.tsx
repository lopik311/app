"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet } from "@/lib/api";

type ClientRow = {
  id: number;
  telegram_id: number;
  username: string;
  consent_accepted_at: string | null;
  requests_count: number;
};

export default function AdminClientsPage() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/api/admin/clients", { credentials: "include" }).then(setRows).catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Клиенты</h3>
        <Link href="/admin/requests">Назад к заявкам</Link>
      </div>
      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>telegram_id</TableHead>
              <TableHead>@username</TableHead>
              <TableHead>Согласие ПДн</TableHead>
              <TableHead>Заявок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.telegram_id}</TableCell>
                <TableCell>@{r.username}</TableCell>
                <TableCell>{r.consent_accepted_at ? new Date(r.consent_accepted_at).toLocaleString() : "-"}</TableCell>
                <TableCell>{r.requests_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
