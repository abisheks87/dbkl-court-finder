import type { LocationFacilityTime } from "./utils/consecutiveSlots";

export const SPORT_OPTIONS = [
  { value: "BADMINTON", label: "Badminton" },
  { value: "FUTSAL", label: "Futsal" },
  { value: "PADANG BOLASEPAK", label: "Football" },
  { value: "BOLA KERANJANG", label: "Basketball" },
  { value: "BOLA TAMPAR", label: "Volleyball" },
  { value: "TENIS", label: "Tennis" },
  { value: "SQUASH", label: "Squash" },
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "PING PONG", label: "Table Tennis" },
  // { value: 'HOKI', label: 'Hockey' },
  { value: "SEPAKTAKRAW", label: "Sepak Takraw" },
  { value: "MEMANAH", label: "Archery" },
  // { value: 'PETANQUE', label: 'Petanque' },
  // { value: 'BALAPAN', label: 'Athletics' },
] as const;

export type SportCategory = (typeof SPORT_OPTIONS)[number]["value"];

export interface LocationFacility {
  id: string;
  location_id: string;
  venue_name: string;
  location_name: string;
  sub_category_name: string;
  location_facility_times: LocationFacilityTime[];
}

export interface LocationData {
  location_id: string;
  location_name: string;
}
