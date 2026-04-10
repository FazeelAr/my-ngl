"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.login(email, password);
      login(data.token, { id: data.user_id, email: data.email, username: data.username });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="card">
        <h2 className="heading">Login</h2>
        {error ? <p className="error">{error}</p> : null}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input"
        />

        <button onClick={handleLogin} disabled={loading} className="btn btn-purple" style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="muted" style={{ marginTop: 14, textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <button onClick={() => router.push("/signup")} style={{ border: 0, background: "transparent", color: "#7c3aed", cursor: "pointer", fontWeight: 700 }}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
