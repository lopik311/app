"use client";

import { useEffect, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiSend } from "@/lib/api";

type Client = {
  id: number;
  username: string | null;
  telegram_id: number;
};

type Organization = {
  id: number;
  client_id: number;
  contact_person: string | null;
  name: string;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  address: string | null;
  settlement_account: string | null;
  bik: string | null;
  correspondent_account: string | null;
  bank: string | null;
  director: string | null;
  contract: string | null;
};

type FormState = {
  client_id: string;
  name: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  settlement_account: string;
  bik: string;
  correspondent_account: string;
  bank: string;
  director: string;
  contract: string;
};

const emptyForm: FormState = {
  client_id: "",
  name: "",
  inn: "",
  kpp: "",
  ogrn: "",
  address: "",
  settlement_account: "",
  bik: "",
  correspondent_account: "",
  bank: "",
  director: "",
  contract: "",
};

export default function OrganizationsPage() {
  const [rows, setRows] = useState<Organization[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const [orgData, clientsData] = await Promise.all([
        apiGet("/api/admin/organizations", { credentials: "include" }),
        apiGet("/api/admin/clients", { credentials: "include" }),
      ]);
      setRows(orgData);
      setClients(clientsData);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveOrganization() {
    try {
      if (!form.client_id || !form.name.trim()) {
        setError("Выберите контактное лицо и заполните наименование.");
        return;
      }
      setError("");
      const payload = {
        client_id: Number(form.client_id),
        name: form.name.trim(),
        inn: form.inn || null,
        kpp: form.kpp || null,
        ogrn: form.ogrn || null,
        address: form.address || null,
        settlement_account: form.settlement_account || null,
        bik: form.bik || null,
        correspondent_account: form.correspondent_account || null,
        bank: form.bank || null,
        director: form.director || null,
        contract: form.contract || null,
      };
      if (editingId) {
        await apiSend(`/api/admin/organizations/${editingId}`, "PATCH", payload, { credentials: "include" });
      } else {
        await apiSend("/api/admin/organizations", "POST", payload, { credentials: "include" });
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  function startEdit(row: Organization) {
    setEditingId(row.id);
    setForm({
      client_id: String(row.client_id),
      name: row.name || "",
      inn: row.inn || "",
      kpp: row.kpp || "",
      ogrn: row.ogrn || "",
      address: row.address || "",
      settlement_account: row.settlement_account || "",
      bik: row.bik || "",
      correspondent_account: row.correspondent_account || "",
      bank: row.bank || "",
      director: row.director || "",
      contract: row.contract || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div className="grid">
      <h3 style={{ margin: 0 }}>Организации</h3>
      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}

      <div className="card grid">
        <h4 style={{ margin: 0 }}>Добавить организацию</h4>
        <div className="grid grid-2">
          <div>
            <label>Контактное лицо (клиент)</label>
            <select className="select" value={form.client_id} onChange={(e) => setField("client_id", e.target.value)}>
              <option value="">Выберите</option>
              {clients.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  ID {c.id} / @{c.username || "-"} / {c.telegram_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Наименование</label>
            <input className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div>
            <label>ИНН</label>
            <input className="input" value={form.inn} onChange={(e) => setField("inn", e.target.value)} />
          </div>
          <div>
            <label>КПП</label>
            <input className="input" value={form.kpp} onChange={(e) => setField("kpp", e.target.value)} />
          </div>
          <div>
            <label>ОГРН</label>
            <input className="input" value={form.ogrn} onChange={(e) => setField("ogrn", e.target.value)} />
          </div>
          <div>
            <label>Адрес</label>
            <input className="input" value={form.address} onChange={(e) => setField("address", e.target.value)} />
          </div>
          <div>
            <label>Р/счёт</label>
            <input className="input" value={form.settlement_account} onChange={(e) => setField("settlement_account", e.target.value)} />
          </div>
          <div>
            <label>БИК</label>
            <input className="input" value={form.bik} onChange={(e) => setField("bik", e.target.value)} />
          </div>
          <div>
            <label>Корсчет</label>
            <input className="input" value={form.correspondent_account} onChange={(e) => setField("correspondent_account", e.target.value)} />
          </div>
          <div>
            <label>Банк</label>
            <input className="input" value={form.bank} onChange={(e) => setField("bank", e.target.value)} />
          </div>
          <div>
            <label>Директор</label>
            <input className="input" value={form.director} onChange={(e) => setField("director", e.target.value)} />
          </div>
          <div>
            <label>Договор</label>
            <input className="input" value={form.contract} onChange={(e) => setField("contract", e.target.value)} />
          </div>
        </div>
        <div className="row">
          <button className="btn" onClick={saveOrganization}>{editingId ? "Сохранить изменения" : "Добавить"}</button>
          {editingId ? <button className="btn secondary" onClick={cancelEdit}>Отмена</button> : null}
        </div>
      </div>

      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Контактное лицо</TableHead>
              <TableHead>Наименование</TableHead>
              <TableHead>ИНН</TableHead>
              <TableHead>КПП</TableHead>
              <TableHead>ОГРН</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Р/счёт</TableHead>
              <TableHead>БИК</TableHead>
              <TableHead>Корсчет</TableHead>
              <TableHead>Банк</TableHead>
              <TableHead>Директор</TableHead>
              <TableHead>Договор</TableHead>
              <TableHead>Изменить</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>@{r.contact_person || "-"}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.inn || "-"}</TableCell>
                <TableCell>{r.kpp || "-"}</TableCell>
                <TableCell>{r.ogrn || "-"}</TableCell>
                <TableCell>{r.address || "-"}</TableCell>
                <TableCell>{r.settlement_account || "-"}</TableCell>
                <TableCell>{r.bik || "-"}</TableCell>
                <TableCell>{r.correspondent_account || "-"}</TableCell>
                <TableCell>{r.bank || "-"}</TableCell>
                <TableCell>{r.director || "-"}</TableCell>
                <TableCell>{r.contract || "-"}</TableCell>
                <TableCell>
                  <button className="btn secondary" onClick={() => startEdit(r)}>Изменить</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
