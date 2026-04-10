"use client";

import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export default function RootClientLayout({ children }) {
  return (
    <AuthProvider>
      <div className="app-bg">
        <Navbar />
        {children}
      </div>
    </AuthProvider>
  );
}
