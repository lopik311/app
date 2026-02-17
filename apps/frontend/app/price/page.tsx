"use client";

import { useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PriceRow = {
  id: number;
  direction: string;
  tariff_per_kg: number;
  tariff_per_m3: number;
};

const initialRows: PriceRow[] = [
  { id: 1, direction: "Москва -> Санкт-Петербург", tariff_per_kg: 12, tariff_per_m3: 4200 },
  { id: 2, direction: "Москва -> Казань", tariff_per_kg: 10, tariff_per_m3: 3900 },
];

export default function PricePage() {
  const [rows] = useState<PriceRow[]>(initialRows);

  return (
    <div className="grid">
      <h3 style={{ margin: 0 }}>Прайс</h3>
      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Направление</TableHead>
              <TableHead>Тариф за кг</TableHead>
              <TableHead>Тариф за м3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.direction}</TableCell>
                <TableCell>{r.tariff_per_kg}</TableCell>
                <TableCell>{r.tariff_per_m3}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
