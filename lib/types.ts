/** 官網查詢結果的型別（對應 sanity/lib/queries.ts） */
import type { BrandId, CatStatus, DayKey } from "./constants";

export type Img = {
  _key?: string;
  asset?: { _ref: string };
  alt?: string;
  decorative?: boolean;
  caption?: string | null;
  lqip?: string;
  dimensions?: { width: number; height: number };
  crop?: unknown;
  hotspot?: unknown;
} | null;

export type Seo = { title?: string | null; description?: string | null; image?: unknown; noIndex?: boolean } | null;

export type HoursRow = { day: DayKey; closed?: boolean; open?: string; close?: string };
export type SpecialDate = { date: string; closed?: boolean; open?: string; close?: string; note?: string | null };

export type Shop = {
  brand: BrandId;
  address?: string;
  addressZh?: string;
  postalCode?: string;
  city?: string;
  location?: { lat: number; lng: number };
  mapUrl?: string;
  phone?: string;
  lineUrl?: string;
  hours?: HoursRow[];
  specialDates?: SpecialDate[];
  prices?: { _key: string; name?: string; weekday?: number; holiday?: number; note?: string | null }[];
  priceNote?: string | null;
  payments?: string[];
  entryAge?: number | null;
  entryNote?: string | null;
  noReservation?: boolean;
  rules?: { _key: string; icon?: string; text?: string }[];
  mrt?: string | null;
  bus?: string | null;
  parking?: string | null;
  mapImage?: Img;
  menuImages?: NonNullable<Img>[];
  verifiedAt?: string | null;
  seo?: Seo;
};

export type CatCard = {
  _id: string;
  brand: BrandId;
  status: CatStatus;
  slug: string;
  name: string;
  summary?: string | null;
  gender?: "male" | "female" | "unknown";
  birthday?: string | null;
  cover?: Img;
};

export type NewsCard = {
  _id: string;
  slug: string;
  publishedAt: string;
  category?: string;
  brand?: string;
  pinned?: boolean;
  title: string;
  excerpt?: string | null;
  cover?: Img;
};

export type FaqItem = { _id: string; category?: string; brand?: string; question: string; answer: string };
export type Step = { _key: string; title?: string; text?: string | null; image?: Img };
export type GameCard = { _id: string; slug: string; url?: string | null; platforms?: string[]; title: string; summary?: string | null; cover?: Img };
export type Story = { _id: string; slug: string; graduatedAt: string; title?: string | null; catName?: string; familyWords?: string | null; image?: Img };
