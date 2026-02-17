"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PaymentRow = {
  id: number;
  request_number: number;
  client: string;
  amount: number;
  status: "PENDING" | "PAID";
};

const initialRows: PaymentRow[] = [
  { id: 1, request_number: 1001, client: "@client_1", amount: 12500, status: "PENDING" },
  { id: 2, request_number: 1002, client: "@client_2", amount: 18200, status: "PAID" },
];

export default function PaymentsPage() {
  const [rows] = useState<PaymentRow[]>(initialRows);

  return (
    <div className="grid">
      <h3 style={{ margin: 0 }}>Оплаты</h3>
      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Заявка</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>#{r.request_number}</TableCell>
                <TableCell>{r.client}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell><Badge>{r.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
