import NotFoundPage from "@/components/NotFoundPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 Not Found | Otaku Corner"
};

export default function NotFound() {
  return <NotFoundPage />;
}
