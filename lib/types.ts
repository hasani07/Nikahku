export type Religion = "islam" | "kristen" | "katolik" | "hindu" | "buddha" | "konghucu";

export type Invitation = {
  published?: boolean;
  theme?: "rose" | "emerald" | "slate" | "amber";
  groom_full?: string;
  groom_parents?: string;
  bride_full?: string;
  bride_parents?: string;
  opening?: string;
  quote?: string;
  story?: string;
  akad_time?: string;
  akad_place?: string;
  akad_address?: string;
  resepsi_date?: string;
  resepsi_time?: string;
  resepsi_place?: string;
  resepsi_address?: string;
  maps_url?: string;
  cover_url?: string;
  gift_info?: string;
};

export type Wedding = {
  id: string;
  owner_id: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  city: string | null;
  religion: Religion;
  concept: string | null;
  estimated_guests: number | null;
  total_budget: number;
  slug: string | null;
  invitation: Invitation;
  created_at: string;
};

export type Member = {
  wedding_id: string;
  user_id: string;
  role: "owner" | "partner" | "family";
  email: string | null;
};

export type InviteLink = {
  token: string;
  wedding_id: string;
  role: "partner" | "family";
  used_by: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  wedding_id: string;
  title: string;
  phase: string;
  due_date: string | null;
  assignee: string | null;
  status: "todo" | "done";
  sort_order: number;
};

export type BudgetCategory = {
  id: string;
  wedding_id: string;
  name: string;
  planned_amount: number;
  sort_order: number;
};

export type Expense = {
  id: string;
  wedding_id: string;
  category_id: string | null;
  vendor_id: string | null;
  title: string;
  amount: number;
  type: "dp" | "termin" | "lunas";
  paid_at: string | null;
};

export type Doc = {
  id: string;
  wedding_id: string;
  owner_side: "pria" | "wanita" | "bersama";
  name: string;
  status: "belum" | "proses" | "selesai";
  file_path: string | null;
  sort_order: number;
};

export type Guest = {
  id: string;
  wedding_id: string;
  name: string;
  phone: string | null;
  group_name: string | null;
  pax: number;
  rsvp_status: "pending" | "hadir" | "tidak";
  rsvp_pax: number | null;
  message: string | null;
  invite_code: string;
  checked_in_at: string | null;
};

export type Vendor = {
  id: string;
  wedding_id: string;
  category_id: string | null;
  name: string;
  service: string | null;
  contact_name: string | null;
  phone: string | null;
  instagram: string | null;
  price_quote: number;
  status: "survei" | "nego" | "booking" | "lunas" | "batal";
  rating: number | null;
  note: string | null;
};

export type Saving = {
  id: string;
  amount: number;
  saved_at: string;
  by_whom: string | null;
  note: string | null;
};

export type RundownItem = {
  id: string;
  session: "akad" | "resepsi" | "lainnya";
  start_time: string | null;
  end_time: string | null;
  activity: string;
  pic: string | null;
  location: string | null;
};

export type Gift = {
  id: string;
  from_name: string;
  kind: "amplop" | "kado" | "transfer";
  amount: number | null;
  note: string | null;
  thanked: boolean;
};

export type Wish = {
  id?: string;
  name: string;
  message: string | null;
  attendance: string | null;
  created_at: string;
};
