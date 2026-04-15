"use client";
import dynamic from "next/dynamic";

const LibraryDashboard = dynamic(
  () => import("@/components/LibraryDashboard"),
  { ssr: false }
);

export default function LibraryDashboardClient() {
  return <LibraryDashboard />;
}
