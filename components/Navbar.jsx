"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="navbar">
      <Link href="/" className="brand">
        NGL
      </Link>

      <div className="nav-links">
        {token && user ? (
          <>
            <span className="nav-email">{user.email}</span>
            {pathname !== "/dashboard" && (
              <Link href="/dashboard" className="btn btn-purple">
                Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-red">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-purple">
              Login
            </Link>
            <Link href="/signup" className="btn btn-green">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
