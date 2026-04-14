import { NextResponse } from "next/server";

export async function GET() {
  const bucket = process.env.GCS_RESUME_BUCKET;
  if (!bucket) {
    return NextResponse.json({ error: "GCS_RESUME_BUCKET not configured" }, { status: 500 });
  }

  // List all objects in the bucket via the GCS JSON API (requires the bucket to be public)
  const listUrl = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o`;
  const res = await fetch(listUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to list bucket objects" }, { status: 502 });
  }

  const data = await res.json();
  const items: { name: string; updated: string }[] = data.items ?? [];

  // Filter to PDFs and pick the one most recently updated
  const pdfs = items.filter((item) => item.name.toLowerCase().endsWith(".pdf"));
  if (pdfs.length === 0) {
    return NextResponse.json({ error: "No PDF found in bucket" }, { status: 404 });
  }

  pdfs.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  const latest = pdfs[0];

  const downloadUrl = `https://storage.googleapis.com/${encodeURIComponent(bucket)}/${latest.name}`;
  return NextResponse.json({ url: downloadUrl });
}
