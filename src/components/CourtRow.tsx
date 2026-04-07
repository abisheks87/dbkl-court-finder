import React from 'react';
import { LocationFacilityTime, TIME_ORDER } from '../utils/consecutiveSlots';
import { SlotCell } from './SlotCell';

interface CourtRowProps {
  venueName: string;
  slots: LocationFacilityTime[];
  isDimmed: boolean;
  timeSlotIds: string[];
}

export function CourtRow({ venueName, slots, isDimmed, timeSlotIds }: CourtRowProps) {
  /*
    The API sometimes returns overlapping slot records for the same time window
    (e.g. both a 1-hour "6–7 PM" slot AND a 2-hour "6–8 PM" slot).
    Rendering them all in sequence causes cells to overflow their grid columns.

    Fix: build a map keyed by start_time_id so each time column is filled exactly once.
    Among duplicates, prefer the one with the smaller span (1h over 2h) so we get
    granular per-hour availability rather than one merged block.
  */
  const slotByStartId = React.useMemo(() => {
    const map = new Map<string, LocationFacilityTime>();
    for (const slot of slots) {
      const existing = map.get(slot.start_time_id);
      if (!existing) {
        map.set(slot.start_time_id, slot);
      } else {
        // Prefer smaller span (1h granularity)
        const existSpan = parseInt(existing.end_time_id, 10) - parseInt(existing.start_time_id, 10);
        const newSpan = parseInt(slot.end_time_id, 10) - parseInt(slot.start_time_id, 10);
        if (newSpan < existSpan) map.set(slot.start_time_id, slot);
      }
    }
    return map;
  }, [slots]);

  /*
    Walk the header time columns in order. For each column, if we have a slot starting
    there, place it (spanning however many header columns it covers). Skip columns that
    are already covered by a previous multi-hour slot. Columns with no slot get an empty
    placeholder so the grid stays intact.

    Span is computed using TIME_ORDER index difference (not start_time_id arithmetic)
    to correctly handle midnight wraparound: 10PM(id=23) → 12AM(id=1) would give a
    negative/zero numeric difference, but TIME_ORDER gives index 14→16 = span 2.
  */
  const cells: React.ReactNode[] = [];
  let skipUntilCol = 0; // columns with index < skipUntilCol are covered by a previous multi-hour slot

  for (let col = 0; col < timeSlotIds.length; col++) {
    if (col < skipUntilCol) continue;

    const timeId = timeSlotIds[col];
    const slot = slotByStartId.get(timeId);
    if (slot) {
      const startIdx = TIME_ORDER.indexOf(slot.start_time_value);
      const endIdx = TIME_ORDER.indexOf(slot.end_time_value);
      // Clamp span so it never exceeds the remaining columns
      const rawSpan = endIdx > startIdx ? endIdx - startIdx : 1;
      const span = Math.min(rawSpan, timeSlotIds.length - col);
      if (span > 1) skipUntilCol = col + span;
      cells.push(<SlotCell key={slot.id} slot={slot} columnSpan={span} />);
    } else {
      cells.push(
        <div
          key={`empty-${timeId}`}
          className="h-10 rounded-sm"
          style={{ backgroundColor: '#1e293b' }}
        />
      );
    }
  }

  return (
    <div
      className={`items-center py-1 ${isDimmed ? 'opacity-40' : ''}`}
      style={{ display: 'grid', gridTemplateColumns: `160px repeat(${timeSlotIds.length}, minmax(32px, 1fr))` }}
    >
      <div className="pr-2 font-medium text-sm text-slate-300 truncate">
        {venueName}
      </div>
      {cells}
    </div>
  );
}
