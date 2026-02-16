import React from "react";

export function Dialog({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "grid", placeItems: "center" }}>
      <div className="card" style={{ width: "min(760px, 92vw)", maxHeight: "90vh", overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
