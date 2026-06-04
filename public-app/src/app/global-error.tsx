"use client";

import "@/app/globals.css";

import ErrorPage from "@/components/ErrorPage";

export default function GlobalError() {
  return (
    <html lang="en">
      <head>
        <title>Unexpected Error | Otaku Corner</title>
      </head>
      <body>
        <ErrorPage />
      </body>
    </html>
  );
}
