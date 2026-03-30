import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Pensieve",
  description: "Your personal mind companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary">
        <main className="mx-auto max-w-2xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
