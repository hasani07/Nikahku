"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";

export async function addRundown(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const activity = String(fd.get("activity") ?? "").trim();
  if (!activity) return;
  await supabase.from("rundown_items").insert({
    wedding_id: wedding.id,
    session: String(fd.get("session") || "akad"),
    start_time: String(fd.get("start_time") || "") || null,
    end_time: String(fd.get("end_time") || "") || null,
    activity,
    pic: String(fd.get("pic") || "") || null,
    location: String(fd.get("location") || "") || null,
  });
  revalidatePath("/rundown");
  revalidatePath("/hari-h");
}

export async function deleteRundown(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("rundown_items").delete().eq("id", id);
  revalidatePath("/rundown");
  revalidatePath("/hari-h");
}

/** Isi contoh rundown standar bila masih kosong */
export async function seedRundown() {
  const { supabase, wedding } = await requireWedding();
  const isIslam = wedding.religion === "islam";
  const rows: [string, string, string, string][] = [
    ["akad", "07:00", "07:30", "Persiapan & makeup pengantin selesai"],
    ["akad", "07:30", "08:00", "Kedatangan keluarga & tamu akad"],
    ["akad", "08:00", "08:15", isIslam ? "Pembukaan, pembacaan ayat suci Al-Qur'an" : "Pembukaan & doa"],
    ["akad", "08:15", "08:45", isIslam ? "Ijab kabul" : "Pemberkatan / upacara pernikahan"],
    ["akad", "08:45", "09:15", isIslam ? "Penandatanganan buku nikah, nasihat pernikahan & doa" : "Penandatanganan akta & doa"],
    ["akad", "09:15", "10:00", "Sungkeman & foto keluarga"],
    ["resepsi", "10:30", "11:00", "Ganti busana & touch up"],
    ["resepsi", "11:00", "11:15", "Kirab / prosesi masuk pengantin"],
    ["resepsi", "11:15", "11:30", "Sambutan keluarga & doa"],
    ["resepsi", "11:30", "13:30", "Ramah tamah, makan & salam-salaman tamu"],
    ["resepsi", "13:30", "14:00", "Foto bersama keluarga besar & penutupan"],
  ];
  await supabase.from("rundown_items").insert(
    rows.map(([session, start_time, end_time, activity]) => ({
      wedding_id: wedding.id, session, start_time, end_time, activity,
    }))
  );
  revalidatePath("/rundown");
}
