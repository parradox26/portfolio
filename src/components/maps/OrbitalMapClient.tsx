"use client";
import dynamic from "next/dynamic";

const OrbitalMap = dynamic(() => import("./OrbitalMap"), { ssr: false });

export default function OrbitalMapClient() {
  return <OrbitalMap />;
}
