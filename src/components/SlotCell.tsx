import { LocationFacilityTime } from '../utils/consecutiveSlots';

interface SlotCellProps {
  slot: LocationFacilityTime;
  columnSpan: number;
}

export function SlotCell({ slot, columnSpan }: SlotCellProps) {
  const baseClass =
    "relative group h-10 border border-slate-300/60 dark:border-slate-700/60 cursor-pointer transition-all duration-150 rounded-sm";
  const stateClass = slot.slot_available
    ? "bg-emerald-500 hover:shadow-[0_0_10px_rgba(74,222,128,0.6)] hover:z-[5]"
    : "bg-slate-200 dark:bg-slate-700";

  return (
    <div
      className={`${baseClass} ${stateClass}`}
      style={{ gridColumn: `span ${columnSpan}` }}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
        <div className="font-semibold">{slot.start_time_value} – {slot.end_time_value}</div>
        {slot.price && (
          <div className="text-slate-500 dark:text-slate-400 mt-0.5">
            {slot.slot_available ? (
              <span className="text-emerald-600 dark:text-emerald-400">RM {slot.price}</span>
            ) : (
              <span>Booked</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
