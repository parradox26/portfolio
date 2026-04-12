"use client";
import dynamic from "next/dynamic";

const SatelliteGlobe = dynamic(() => import("@/components/SatelliteGlobe"), { ssr: false });

export default function SatelliteGlobeClient({ compact }: { compact?: boolean }) {
  return <SatelliteGlobe compact={compact} />;
}
