"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiSend } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    try {
      setError("");
      await apiSend("/api/admin/auth/login", "POST", { email, password }, { credentials: "include" });
      router.push("/admin/requests");
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="card grid" style={{ maxWidth: 420 }}>
      <h3 style={{ margin: 0 }}>Вход менеджера</h3>
      {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
      <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn" onClick={submit}>
        Войти
      </button>
    </div>
  );
}
