"use client";

import { useEffect, useMemo, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiSend } from "@/lib/api";

type Direction = { id: number; name: string };
type Slot = {
  id: number;
  direction_id: number | null;
  date: string;
};

type SlotSort = "direction_asc" | "direction_desc" | "date_asc" | "date_desc";

export default function StaffDirectionsPage() {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const [slotDirectionId, setSlotDirectionId] = useState<string>("");
  const [slotDate, setSlotDate] = useState("");
  const [slotSort, setSlotSort] = useState<SlotSort>("date_desc");

  async function load() {
    try {
      setError("");
      const [dirData, slotData] = await Promise.all([
        apiGet("/api/admin/directions", { credentials: "include" }),
        apiGet("/api/admin/delivery-slots", { credentials: "include" }),
      ]);
      setDirections(dirData);
      setSlots(slotData);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!slotDirectionId && directions.length > 0) {
      setSlotDirectionId(String(directions[0].id));
    }
  }, [directions, slotDirectionId]);

  async function createDirection() {
    try {
      if (!name.trim()) {
        setError("Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ РЅР°РїСЂР°РІР»РµРЅРёСЏ.");
        return;
      }
      await apiSend("/api/admin/directions", "POST", { name: name.trim() }, { credentials: "include" });
      setName("");
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function createSlot() {
    try {
      if (!slotDirectionId) {
        setError("Выберите направление.");
        return;
      }
      if (!slotDate) {
        setError("Р’С‹Р±РµСЂРёС‚Рµ РґР°С‚Сѓ РґРѕСЃС‚Р°РІРєРё.");
        return;
      }
      setError("");
      await apiSend(
        "/api/admin/delivery-slots",
        "POST",
        {
          direction_id: slotDirectionId ? Number(slotDirectionId) : null,
          date: slotDate,
        },
        { credentials: "include" },
      );
      setSlotDate("");
      if (directions.length > 0) {
        setSlotDirectionId(String(directions[0].id));
      }
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function deleteSlot(slotId: number) {
    try {
      setError("");
      await apiSend(`/api/admin/delivery-slots/${slotId}`, "DELETE", undefined, { credentials: "include" });
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  const directionMap = useMemo(() => {
    return new Map<number, string>(directions.map((d) => [d.id, d.name]));
  }, [directions]);

  const sortedSlots = useMemo(() => {
    const arr = [...slots];
    arr.sort((a, b) => {
      const aDirection = a.direction_id ? directionMap.get(a.direction_id) || `ID ${a.direction_id}` : "Р‘РµР· РїСЂРёРІСЏР·РєРё";
      const bDirection = b.direction_id ? directionMap.get(b.direction_id) || `ID ${b.direction_id}` : "Р‘РµР· РїСЂРёРІСЏР·РєРё";
      if (slotSort === "direction_asc") return aDirection.localeCompare(bDirection, "ru");
      if (slotSort === "direction_desc") return bDirection.localeCompare(aDirection, "ru");
      if (slotSort === "date_asc") return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });
    return arr;
  }, [slots, slotSort, directionMap]);

  function toggleDirectionSort() {
    setSlotSort((prev) => (prev === "direction_asc" ? "direction_desc" : "direction_asc"));
  }

  function toggleDateSort() {
    setSlotSort((prev) => (prev === "date_asc" ? "date_desc" : "date_asc"));
  }

  const sortButtonStyle = {
    marginLeft: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: "14px",
  } as const;

  return (
    <div className="grid">
      <h3 style={{ margin: 0 }}>РЎРїСЂР°РІРѕС‡РЅРёРє РЅР°РїСЂРІР»РµРЅРёР№</h3>
      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}

      <div className="card grid">
        <h4 style={{ margin: 0 }}>Р”РѕР±Р°РІРёС‚СЊ СЃР»РѕС‚ РґРѕСЃС‚Р°РІРєРё</h4>
        <div className="row" style={{ width: "100%", alignItems: "end" }}>
          <div style={{ width: "40%" }}>
            <label>РќР°РїСЂР°РІР»РµРЅРёРµ</label>
            <select className="select" value={slotDirectionId} onChange={(e) => setSlotDirectionId(e.target.value)}>
              {directions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ width: "40%" }}>
            <label>Р”Р°С‚Р° РґРѕСЃС‚Р°РІРєРё (СЃР»РѕС‚)</label>
            <input className="input" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
          </div>
          <div style={{ width: "15%" }}>
            <button className="btn" style={{ width: "100%" }} onClick={createSlot}>Р”РѕР±Р°РІРёС‚СЊ СЃР»РѕС‚</button>
          </div>
        </div>
      </div>

      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>
                РќР°РїСЂР°РІР»РµРЅРёРµ
                <button style={sortButtonStyle} onClick={toggleDirectionSort}>в†“в†‘</button>
              </TableHead>
              <TableHead>
                Р”Р°С‚Р° РґРѕСЃС‚Р°РІРєРё
                <button style={sortButtonStyle} onClick={toggleDateSort}>в†“в†‘</button>
              </TableHead>
              <TableHead>РЈРґР°Р»РёС‚СЊ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSlots.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.direction_id ? directionMap.get(s.direction_id) || `ID ${s.direction_id}` : "Р‘РµР· РїСЂРёРІСЏР·РєРё"}</TableCell>
                <TableCell>{s.date}</TableCell>
                <TableCell>
                  <button className="btn secondary" onClick={() => deleteSlot(s.id)}>РЈРґР°Р»РёС‚СЊ</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="card grid">
        <h4 style={{ margin: 0 }}>Р”РѕР±Р°РІРёС‚СЊ РЅР°РїСЂР°РІР»РµРЅРёРµ</h4>
        <div className="row">
          <input className="input" style={{ maxWidth: 360 }} placeholder="РќРѕРІРѕРµ РЅР°РїСЂР°РІР»РµРЅРёРµ" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" onClick={createDirection}>Р”РѕР±Р°РІРёС‚СЊ</button>
        </div>
      </div>

      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>РќР°Р·РІР°РЅРёРµ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directions.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

