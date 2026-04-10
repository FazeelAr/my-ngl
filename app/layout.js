import "./globals.css";
import { Manrope, Sora } from "next/font/google";
import RootClientLayout from "@/components/RootClientLayout";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-main",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  title: "MyNGL",
  description: "Anonymous question and response app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable}`}>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
