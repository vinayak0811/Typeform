import type { Metadata } from "next";
import * as React from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formly — Beautiful forms, effortlessly",
  description: "Create conversational forms and surveys in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
        />
      </head>
      <body className="dark antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
