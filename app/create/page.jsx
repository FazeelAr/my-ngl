"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api-client";

function CreateContent() {
  const router = useRouter();
  const { token } = useAuth();
  const [question, setQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.createNGL(question, isAnonymous, token);
      alert(`NGL Created! ID: ${data.ngl_id}`);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create NGL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="card">
        <h2 className="heading">Create NGL</h2>
        {error ? <p className="error">{error}</p> : null}

        <textarea
          placeholder="Enter your question..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="textarea"
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
          />
          <span>Allow Anonymous Responses</span>
        </label>

        <p className="muted" style={{ fontSize: ".86rem", marginBottom: 14 }}>
          {isAnonymous
            ? "Responders can answer without providing their name"
            : "Responders must provide their name"}
        </p>

        <button onClick={handleCreate} disabled={loading} className="btn btn-purple" style={{ width: "100%" }}>
          {loading ? "Creating..." : "Create NGL"}
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          style={{ width: "100%", marginTop: 10, border: 0, background: "transparent", color: "#7c3aed", fontWeight: 700, cursor: "pointer" }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <RequireAuth>
      <CreateContent />
    </RequireAuth>
  );
}
