import './globals.css';
import React from "react";

export const metadata = {
  title: "Prospector",
  description: "Fire safety prospects tool"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
