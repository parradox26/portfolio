"use client";
import dynamic from "next/dynamic";

const CityIoTMap = dynamic(() => import("./CityIoTMap"), { ssr: false });

export default function CityIoTMapClient() {
  return <CityIoTMap />;
}
