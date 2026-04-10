"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [accessId, setAccessId] = useState("");

  const handleAccessNGL = () => {
    if (accessId.trim()) {
      router.push(`/ngl/${accessId.trim()}`);
    }
  };

  return (
    <div className="form-wrap">
      <div className="card">
        <h2 className="heading" style={{ fontSize: "2rem", textAlign: "center" }}>
          Ask Anything Anonymously
        </h2>

        <p className="muted" style={{ textAlign: "center", marginBottom: 20 }}>
          Share feedback without revealing your identity. Create your own or join an existing one.
        </p>

        <button onClick={() => router.push("/signup")} className="btn btn-purple" style={{ width: "100%", marginBottom: 10 }}>
          Create NGL (Sign Up)
        </button>

        <button onClick={() => router.push("/login")} className="btn" style={{ width: "100%", marginBottom: 18, background: "linear-gradient(135deg, #0ea5a4, #0f766e)" }}>
          Login
        </button>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 18 }}>
          <p className="muted" style={{ fontSize: ".92rem", marginBottom: 10 }}>
            Or respond to an existing NGL:
          </p>
          <input
            type="text"
            placeholder="Enter NGL ID"
            value={accessId}
            onChange={(event) => setAccessId(event.target.value)}
            className="input"
          />
          <button onClick={handleAccessNGL} className="btn btn-pink" style={{ width: "100%" }}>
            Access NGL
          </button>
        </div>
      </div>
    </div>
  );
}
