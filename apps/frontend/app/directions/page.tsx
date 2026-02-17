"use client";

import { useEffect, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiSend } from "@/lib/api";

type Direction = { id: number; name: string; active: boolean };

export default function StaffDirectionsPage() {
  const [rows, setRows] = useState<Direction[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const data = await apiGet("/api/admin/directions", { credentials: "include" });
      setRows(data);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createDirection() {
    try {
      await apiSend("/api/admin/directions", "POST", { name, active: true }, { credentials: "include" });
      setName("");
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function toggle(row: Direction) {
    try {
      await apiSend(`/api/admin/directions/${row.id}`, "PATCH", { name: row.name, active: !row.active }, { credentials: "include" });
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="grid">
      <h3 style={{ margin: 0 }}>Направления</h3>
      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}
      <div className="card row">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Новое направление" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" onClick={createDirection}>Добавить</button>
      </div>
      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Активно</TableHead>
              <TableHead>Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{String(r.active)}</TableCell>
                <TableCell><button className="btn secondary" onClick={() => toggle(r)}>Переключить</button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
