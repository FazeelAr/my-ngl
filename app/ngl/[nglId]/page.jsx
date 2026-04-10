"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export default function RespondNGLPage() {
  const { nglId } = useParams();
  const router = useRouter();
  const [ngl, setNgl] = useState(null);
  const [responses, setResponses] = useState([]);
  const [message, setMessage] = useState("");
  const [responderName, setResponderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!message.trim()) {
      return false;
    }
    if (ngl && !ngl.is_anonymous && !responderName.trim()) {
      return false;
    }
    return true;
  }, [message, ngl, responderName]);

  const loadNglAndResponses = async () => {
    try {
      const nglData = await api.getNGL(nglId);
      const responseData = await api.getResponses(nglId);
      setNgl(nglData);
      setResponses(Array.isArray(responseData) ? responseData : []);
    } catch {
      setError("Failed to load NGL");
    } finally {
      setLoading(false);
    }
  };

  const loadResponsesOnly = async () => {
    setRefreshing(true);
    try {
      const responseData = await api.getResponses(nglId);
      setResponses(Array.isArray(responseData) ? responseData : []);
    } catch {
      setError("Failed to refresh responses");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (nglId) {
      loadNglAndResponses();
    }
  }, [nglId]);

  useEffect(() => {
    if (!nglId) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      loadResponsesOnly();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [nglId]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Please fill required fields before submitting");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await api.submitResponse(nglId, message, responderName || null);
      setMessage("");
      setResponderName("");
      setResponses((prev) => [
        {
          id: result.response_id,
          ngl_id: nglId,
          message: result.message,
          responder_name: result.responder_name,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container white-text">Loading...</div>;
  }

  if (!ngl) {
    return (
      <div className="container white-text">
        <p>NGL not found</p>
        <button onClick={() => router.push("/")} className="btn btn-purple" style={{ marginTop: 10 }}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => router.push("/")} className="btn btn-gray" style={{ marginBottom: 14 }}>
        Back
      </button>

      <div className="card" style={{ marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>{ngl.question}</h2>
        <p className="muted">{ngl.is_anonymous ? "Anonymous NGL" : "Non-Anonymous NGL"}</p>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Respond</h3>
        {error ? <p className="error">{error}</p> : null}

        {!ngl.is_anonymous && (
          <input
            type="text"
            placeholder="Your name"
            value={responderName}
            onChange={(event) => setResponderName(event.target.value)}
            className="input"
          />
        )}

        <textarea
          placeholder="Write your response..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="textarea"
        />

        <div className="row">
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-pink">
            {submitting ? "Submitting..." : "Submit Response"}
          </button>
          <button onClick={loadResponsesOnly} disabled={refreshing} className="btn btn-blue">
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <h3 className="white-text">Responses ({responses.length})</h3>
      {responses.length === 0 ? (
        <div className="card">
          <p className="muted">No responses yet. Be the first to respond!</p>
        </div>
      ) : (
        <div className="space-y">
          {responses.map((resp) => (
            <div key={resp.id} className="card">
              {resp.responder_name ? (
                <p style={{ margin: "0 0 8px 0", color: "#7c3aed", fontWeight: 700 }}>{resp.responder_name}</p>
              ) : null}
              <p style={{ margin: 0 }}>{resp.message}</p>
              <p className="muted" style={{ margin: "8px 0 0 0", fontSize: ".8rem" }}>
                {new Date(resp.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
