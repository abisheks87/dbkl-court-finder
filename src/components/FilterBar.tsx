import React, { useCallback } from 'react';
import { TIME_ORDER } from '../utils/consecutiveSlots';

// Display labels for each time slot
const TIME_LABELS: Record<string, string> = {
  '8:00 AM': '8a', '9:00 AM': '9a', '10:00 AM': '10a', '11:00 AM': '11a',
  '12:00 PM': '12p', '1:00 PM': '1p', '2:00 PM': '2p', '3:00 PM': '3p',
  '4:00 PM': '4p', '5:00 PM': '5p', '6:00 PM': '6p', '7:00 PM': '7p',
  '8:00 PM': '8p', '9:00 PM': '9p', '10:00 PM': '10p',
};

// Only show the bookable hours in the picker
const PICKER_SLOTS = TIME_ORDER.slice(0, 15); // 8 AM → 10 PM

interface LocationEntry {
  location_id: string;
  location_name: string;
}

interface FilterBarProps {
  date: string;
  onDateChange: (date: string) => void;
  locationId: string;
  onLocationChange: (locationId: string) => void;
  locations: LocationEntry[];
  minConsecutiveSlots: number;
  onMinSlotsChange: (minSlots: number) => void;
  minCourtsNeeded: number;
  onMinCourtsChange: (n: number) => void;
  timeRangeStart: string | null;
  onTimeRangeStartChange: (time: string | null) => void;
  timeRangeEnd: string | null;
  onTimeRangeEndChange: (time: string | null) => void;
  locationLoading: boolean;
  allLocationsProgress: number;
  distances?: Map<string, { formatted: string; km: number }>; // keyed by location_id
  locationDetails?: Map<string, { parliment_name: string; lat: number; lng: number; parliment_id: string; location_id: string }>;
}

export function FilterBar({
  date,
  onDateChange,
  locationId,
  onLocationChange,
  locations,
  minConsecutiveSlots,
  onMinSlotsChange,
  minCourtsNeeded,
  onMinCourtsChange,
  timeRangeStart,
  onTimeRangeStartChange,
  timeRangeEnd,
  onTimeRangeEndChange,
  locationLoading,
  allLocationsProgress,
  distances,
  locationDetails,
}: FilterBarProps) {

  // Sort locations: by distance (keyed by location_id) if available, else alphabetically
  const sortedLocations = React.useMemo(() => {
    if (!distances || distances.size === 0) {
      return [...locations].sort((a, b) => a.location_name.localeCompare(b.location_name));
    }
    return [...locations].sort((a, b) => {
      const da = distances.get(a.location_id)?.km;
      const db = distances.get(b.location_id)?.km;
      if (da != null && db != null) return da - db;
      if (da != null) return -1;
      if (db != null) return 1;
      return a.location_name.localeCompare(b.location_name);
    });
  }, [locations, distances]);

  // Clickable time-range picker logic
  const handleTimeClick = useCallback((time: string) => {
    // Nothing selected yet → set as start
    if (!timeRangeStart && !timeRangeEnd) {
      onTimeRangeStartChange(time);
      return;
    }
    // Only start set
    if (timeRangeStart && !timeRangeEnd) {
      if (time === timeRangeStart) {
        // Tap same → clear
        onTimeRangeStartChange(null);
        return;
      }
      // Set end, auto-order
      const si = TIME_ORDER.indexOf(timeRangeStart);
      const ei = TIME_ORDER.indexOf(time);
      if (ei < si) {
        onTimeRangeStartChange(time);
        onTimeRangeEndChange(timeRangeStart);
      } else {
        onTimeRangeEndChange(time);
      }
      return;
    }
    // Both set → tap start/end clears that end; tap elsewhere resets to new start
    if (timeRangeStart && timeRangeEnd) {
      if (time === timeRangeStart) {
        onTimeRangeStartChange(timeRangeEnd);
        onTimeRangeEndChange(null);
        return;
      }
      if (time === timeRangeEnd) {
        onTimeRangeEndChange(null);
        return;
      }
      // Start fresh from clicked slot
      onTimeRangeStartChange(time);
      onTimeRangeEndChange(null);
    }
  }, [timeRangeStart, timeRangeEnd, onTimeRangeStartChange, onTimeRangeEndChange]);

  const startIdx = timeRangeStart ? TIME_ORDER.indexOf(timeRangeStart) : -1;
  const endIdx = timeRangeEnd ? TIME_ORDER.indexOf(timeRangeEnd) : -1;

  const isInRange = (time: string) => {
    const i = TIME_ORDER.indexOf(time);
    if (startIdx === -1) return false;
    if (endIdx === -1) return i === startIdx;
    return i >= startIdx && i <= endIdx;
  };

  const isEndpoint = (time: string) => time === timeRangeStart || time === timeRangeEnd;

  const rangeLabel = timeRangeStart
    ? timeRangeEnd
      ? `${timeRangeStart} — ${timeRangeEnd}`
      : `From ${timeRangeStart}`
    : 'Any time';

  return (
    <div className="bg-slate-800 shadow-xl rounded-2xl p-5 mb-6 border border-slate-700">
      {/* Row 1: Date · Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => onDateChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Location
          </label>
          <select
            value={locationId}
            onChange={e => onLocationChange(e.target.value)}
            disabled={locationLoading}
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <option value="">
              {locationLoading ? `Loading… ${allLocationsProgress}%` : 'All Locations'}
            </option>
            {sortedLocations.map(loc => {
              const dist = distances?.get(loc.location_id);
              const parl = locationDetails?.get(loc.location_id)?.parliment_name;
              return (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.location_name}{parl ? ` · ${parl}` : ''}{dist ? ` (${dist.formatted})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Row 2: Min Consecutive Slots · Min Courts Needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Min Consecutive Slots */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Min Consecutive Hours
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 flex-1">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => onMinSlotsChange(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    minConsecutiveSlots === n
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {n}h
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="12"
              value={minConsecutiveSlots}
              onChange={e => onMinSlotsChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Min Courts Needed */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Min Courts Needed
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 flex-1">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => onMinCourtsChange(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    minCourtsNeeded === n
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={minCourtsNeeded}
              onChange={e => onMinCourtsChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Venues with at least this many courts available simultaneously
          </p>
        </div>
      </div>

      {/* Row 2: Time range picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Time Window
          </label>
          <span className="text-xs font-medium text-emerald-400">{rangeLabel}</span>
          {(timeRangeStart || timeRangeEnd) && (
            <button
              onClick={() => { onTimeRangeStartChange(null); onTimeRangeEndChange(null); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-3"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PICKER_SLOTS.map(time => {
            const inRange = isInRange(time);
            const endpoint = isEndpoint(time);
            return (
              <button
                key={time}
                onClick={() => handleTimeClick(time)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                  endpoint
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/40 scale-105'
                    : inRange
                    ? 'bg-orange-900/60 text-orange-200 border border-orange-700'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                }`}
              >
                {TIME_LABELS[time] ?? time}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Tap a time to set start · tap another to set end · tap endpoint to adjust
        </p>
      </div>
    </div>
  );
}
