"use client";
import dynamic from "next/dynamic";

const SatelliteTracker2D = dynamic(
  () => import("@/components/SatelliteTracker2D"),
  { ssr: false }
);

export default function SatelliteTracker2DClient() {
  return <SatelliteTracker2D />;
}
