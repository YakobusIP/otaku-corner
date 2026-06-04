import React from "react";

import { Toaster } from "@/components/ui/sonner";

import { queryClient } from "@/lib/query-client";

import { router } from "@/routes/routes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./index.css";

document.documentElement.classList.add("dark");

const DevtoolsWithBoundary = import.meta.env.DEV ? (
  <ReactQueryDevtools initialIsOpen={false} />
) : null;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      {DevtoolsWithBoundary}
    </QueryClientProvider>
  </React.StrictMode>
);
