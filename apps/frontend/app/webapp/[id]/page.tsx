"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";

type Detail = {
  request_number: number;
  direction: string;
  delivery_slot: string;
  boxes_count: number;
  weight_kg: number;
  volume_m3: number;
  status: string;
  history: Array<{
    event_type: string;
    from_status?: string;
    to_status?: string;
    comment?: string;
    created_at: string;
  }>;
};

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    apiGet(`/api/webapp/requests/${params.id}`, { headers: { "X-Telegram-Init-Data": (window as any).Telegram?.WebApp?.initData || "" } })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [params]);

  if (error) return <div className="card" style={{ color: "var(--danger)" }}>{error}</div>;
  if (!data) return <div className="card">Загрузка...</div>;

  return (
    <div className="grid">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Заявка #{data.request_number}</h3>
        <p>Направление: {data.direction}</p>
        <p>Доставка: {data.delivery_slot}</p>
        <p>Короба: {data.boxes_count}</p>
        <p>Вес: {data.weight_kg} кг</p>
        <p>Объем: {data.volume_m3} м3</p>
        <p>
          Статус: <Badge>{data.status}</Badge>
        </p>
      </div>
      <div className="card">
        <h4 style={{ marginTop: 0 }}>История</h4>
        {data.history.map((h, idx) => (
          <div key={idx} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <b>{h.event_type}</b> {h.from_status ? `${h.from_status} -> ${h.to_status}` : ""}
            <div>{h.comment}</div>
            <small>{new Date(h.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
