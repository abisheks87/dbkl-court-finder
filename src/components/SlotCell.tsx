import React from 'react';
import { LocationFacilityTime } from '../utils/consecutiveSlots';

interface SlotCellProps {
  slot: LocationFacilityTime;
  columnSpan: number;
}

export function SlotCell({ slot, columnSpan }: SlotCellProps) {
  return (
    <div
      className="relative group h-10 border border-slate-700/60 cursor-pointer transition-all duration-150 rounded-sm"
      style={{
        gridColumn: `span ${columnSpan}`,
        backgroundColor: slot.slot_available ? '#22c55e' : '#334155',
      }}
      onMouseEnter={e => {
        if (slot.slot_available) {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(74, 222, 128, 0.6)';
          (e.currentTarget as HTMLElement).style.zIndex = '5';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.zIndex = '';
      }}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
        <div className="font-semibold">{slot.start_time_value} – {slot.end_time_value}</div>
        {slot.price && (
          <div className="text-slate-400 mt-0.5">
            {slot.slot_available ? (
              <span className="text-emerald-400">RM {slot.price}</span>
            ) : (
              <span>Booked</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
