import type { LocationFacilityTime } from './utils/consecutiveSlots';

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
