const TIME_ORDER = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM',
];

export function timeIndex(time: string): number {
  const idx = TIME_ORDER.indexOf(time);
  return idx === -1 ? 999 : idx;
}

export interface LocationFacilityTime {
  id: string;
  location_facility_id: string;
  start_time_id: string;
  end_time_id: string;
  start_time_value: string;
  end_time_value: string;
  price: string;
  is_active: string;
  slot_available: boolean;
}

export function hasConsecutiveSlots(
  times: LocationFacilityTime[],
  minSlots: number
): boolean {
  let count = 0;
  for (const t of times) {
    count = t.slot_available ? count + 1 : 0;
    if (count >= minSlots) return true;
  }
  return false;
}

export function hasConsecutiveSlotsInRange(
  times: LocationFacilityTime[],
  minSlots: number,
  startTime: string | null,
  endTime: string | null
): boolean {
  if (!startTime && !endTime) {
    return hasConsecutiveSlots(times, minSlots);
  }

  const startIdx = startTime ? timeIndex(startTime) : 0;
  const endIdx = endTime ? timeIndex(endTime) : 999;

  // Keep slots whose start falls within the range
  const filteredTimes = times.filter(t => {
    const slotIdx = timeIndex(t.start_time_value);
    return slotIdx >= startIdx && slotIdx < endIdx;
  });

  return hasConsecutiveSlots(filteredTimes, minSlots);
}

export { TIME_ORDER };
