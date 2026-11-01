import { NextResponse } from "next/server";
import { requireWedding } from "@/lib/wedding";
import type { Guest } from "@/lib/types";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const { supabase, wedding } = await requireWedding();
  const { data } = await supabase.from("guests").select("*").eq("wedding_id", wedding.id).order("group_name").order("name");
  const rows = (data ?? []) as Guest[];
  const header = ["Nama", "No HP", "Grup", "Jumlah", "RSVP", "Jumlah hadir", "Ucapan", "Check-in"];
  const csv = [
    header.map(esc).join(","),
    ...rows.map((g) =>
      [g.name, g.phone, g.group_name, g.pax, g.rsvp_status, g.rsvp_pax, g.message, g.checked_in_at ? "ya" : ""]
        .map(esc)
        .join(",")
    ),
  ].join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="daftar-tamu.csv"`,
    },
  });
}
