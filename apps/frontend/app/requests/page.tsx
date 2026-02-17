"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiSend } from "@/lib/api";

type RequestRow = {
  id: number;
  request_number: number;
  username: string;
  organization?: string | null;
  direction: string;
  delivery_date: string;
  boxes_count: number;
  volume_m3: number;
  weight_kg: number;
  status: string;
};

type RequestDetail = {
  id: number;
  request_number: number;
  direction_id: number;
  delivery_slot_id: number;
  boxes_count: number;
  weight_kg: number;
  volume_m3: number;
  comment?: string;
  status: string;
  history: Array<{ event_type: string; from_status?: string; to_status?: string; comment?: string; created_at: string }>;
};

const statusOptions = [
  { value: "NEW", label: "Новая" },
  { value: "WAREHOUSE", label: "Склад" },
  { value: "SHIPPED", label: "Отгружена" },
  { value: "DELIVERED", label: "Доставлена" },
  { value: "PAID", label: "Оплачено" },
];

function statusLabel(status: string) {
  return statusOptions.find((s) => s.value === status)?.label || status;
}

export default function StaffRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RequestDetail | null>(null);

  async function load() {
    try {
      setError("");
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (status) p.set("status", status);
      const data = await apiGet(`/api/admin/requests?${p.toString()}`, { credentials: "include" });
      setRows(data);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDialog(id: number) {
    try {
      const data = await apiGet(`/api/admin/requests/${id}`, { credentials: "include" });
      setSelected(data);
      setOpen(true);
    } catch (e) {
      setError(String(e));
    }
  }

  async function save() {
    if (!selected) return;
    try {
      await apiSend(`/api/admin/requests/${selected.id}`, "PATCH", selected, { credentials: "include" });
      setOpen(false);
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="grid">
      <h3 style={{ margin: 0 }}>Заявки</h3>
      <div className="card row">
        <input className="input" style={{ maxWidth: 280 }} placeholder="telegram_id или @username" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" style={{ maxWidth: 220 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button className="btn" onClick={load}>
          Применить
        </button>
      </div>

      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}

      <div className="card table-wrap requests-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><div style={{ textAlign: "center" }}>Номер</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Организация</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Клиент</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Направление</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Дата выгрузки</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Количество</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Объем</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Вес</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Статус</div></TableHead>
              <TableHead><div style={{ textAlign: "center" }}>Действие</div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell><div style={{ textAlign: "center" }}>{r.request_number}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>{r.organization || "-"}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>@{r.username || "-"}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>{r.direction}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>{r.delivery_date}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>{r.boxes_count}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>{r.volume_m3}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>{r.weight_kg}</div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}><Badge>{statusLabel(r.status)}</Badge></div></TableCell>
                <TableCell><div style={{ textAlign: "center" }}>
                  <button className="btn secondary" onClick={() => openDialog(r.id)}>Открыть</button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open}>
        {selected ? (
          <div className="grid">
            <h3 style={{ margin: 0 }}>Заявка #{selected.request_number}</h3>
            <div className="grid grid-2">
              <div>
                <label>Кол-во</label>
                <input className="input" value={selected.boxes_count} onChange={(e) => setSelected({ ...selected, boxes_count: Number(e.target.value) })} />
              </div>
              <div>
                <label>Вес</label>
                <input className="input" value={selected.weight_kg} onChange={(e) => setSelected({ ...selected, weight_kg: Number(e.target.value) })} />
              </div>
              <div>
                <label>Объем</label>
                <input className="input" value={selected.volume_m3} onChange={(e) => setSelected({ ...selected, volume_m3: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <label>Комментарий</label>
              <textarea className="input" rows={3} value={selected.comment || ""} onChange={(e) => setSelected({ ...selected, comment: e.target.value })} />
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row">
                <label>Статус</label>
                <select className="select" style={{ width: 220 }} value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value })}>
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button className="btn" onClick={save}>Сохранить</button>
              </div>
              <button className="btn secondary" onClick={() => setOpen(false)}>Закрыть</button>
            </div>

            <div className="card">
              <h4 style={{ marginTop: 0 }}>История</h4>
              {selected.history.map((h, i) => (
                <div key={i} style={{ borderBottom: "1px solid var(--border)", padding: "8px 0", fontSize: "11px" }}>
                  <b>{h.event_type}</b> {h.from_status ? `${h.from_status} -> ${h.to_status}` : ""}
                  <div>{h.comment || ""}</div>
                  <small>{new Date(h.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
