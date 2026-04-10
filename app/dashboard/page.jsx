"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api-client";

function DashboardContent() {
  const { token, user } = useAuth();
  const [ngls, setNgls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNGLs() {
      try {
        const data = await api.getUserNGLs(user.id, token);
        if (Array.isArray(data)) {
          setNgls(data);
        }
      } finally {
        setLoading(false);
      }
    }

    if (token && user?.id) {
      fetchNGLs();
    }
  }, [token, user]);

  const copyToClipboard = async (nglId) => {
    try {
      await navigator.clipboard.writeText(nglId);
      alert(`NGL ID copied: ${nglId}`);
    } catch {
      alert("Clipboard access failed");
    }
  };

  return (
    <div className="container">
      <h2 className="white-text" style={{ fontSize: "1.9rem", marginBottom: 12 }}>
        Your NGLs
      </h2>

      <Link href="/create" className="btn btn-green" style={{ marginBottom: 18 }}>
        + Create New NGL
      </Link>

      {loading ? (
        <p className="white-text">Loading...</p>
      ) : ngls.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p className="muted">You haven&apos;t created any NGLs yet.</p>
          <Link href="/create" className="btn btn-purple" style={{ marginTop: 12 }}>
            Create Your First NGL
          </Link>
        </div>
      ) : (
        <div className="space-y">
          {ngls.map((ngl) => (
            <div key={ngl.id} className="card">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0 }}>{ngl.question}</h3>
                  <p className="muted" style={{ marginTop: 8 }}>
                    {ngl.is_anonymous ? "Anonymous" : "Non-Anonymous"}
                  </p>
                </div>
                <button onClick={() => copyToClipboard(ngl.id)} className="btn btn-blue">
                  Copy ID
                </button>
              </div>
              <Link href={`/ngl/${ngl.id}`} className="btn btn-purple" style={{ marginTop: 12 }}>
                View Responses
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
