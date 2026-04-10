"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !username || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.signup(email, username, password);
      login(data.token, { id: data.user_id, email: data.email, username: data.username });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="card">
        <h2 className="heading">Create Account</h2>
        {error ? <p className="error">{error}</p> : null}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="input"
        />
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

        <button onClick={handleSignup} disabled={loading} className="btn btn-purple" style={{ width: "100%" }}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="muted" style={{ marginTop: 14, textAlign: "center" }}>
          Already have an account?{" "}
          <button onClick={() => router.push("/login")} style={{ border: 0, background: "transparent", color: "#7c3aed", cursor: "pointer", fontWeight: 700 }}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
