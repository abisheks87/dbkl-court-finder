import { useState, useMemo } from 'react';
import './App.css';
import { FilterBar } from './components/FilterBar';
import { TimelineView } from './components/TimelineView';
import { ThemeToggle } from './components/ThemeToggle';
import { useLocations } from './hooks/useLocations';
import { useFacility } from './hooks/useFacility';
import { useAllFacilities } from './hooks/useAllFacilities';
import { useUserLocation } from './hooks/useUserLocation';
import { useLocationDetails } from './hooks/useLocationDetails';
import { haversineKm, formatDistance } from './utils/distance';
import { TIME_ORDER } from './utils/consecutiveSlots';
import { SPORT_OPTIONS } from './types';
import type { SportCategory } from './types';

function App() {
  const getTodayDate = () => {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  };

  const [sport, setSportRaw] = useState<SportCategory>('BADMINTON');
  const [date, setDate] = useState(getTodayDate());
  const [locationId, setLocationId] = useState('');

  // Reset location when sport changes — previous location may not offer the new sport
  const handleSportChange = (newSport: SportCategory) => {
    setSportRaw(newSport);
    setLocationId('');
  };
  const [minConsecutiveSlots, setMinConsecutiveSlots] = useState(2);
  const [minCourtsNeeded, setMinCourtsNeeded] = useState(1);
  const [timeRangeStart, setTimeRangeStart] = useState<string | null>(null);
  const [timeRangeEnd, setTimeRangeEnd] = useState<string | null>(null);

  // Wrappers that auto-sync minConsecutiveSlots when the time range changes.
  const handleTimeRangeStartChange = (start: string | null) => {
    setTimeRangeStart(start);
    if (start && timeRangeEnd) {
      const span = TIME_ORDER.indexOf(timeRangeEnd) - TIME_ORDER.indexOf(start);
      if (span > 0) setMinConsecutiveSlots(span);
    } else if (!start && !timeRangeEnd) {
      setMinConsecutiveSlots(1);
    }
  };

  const handleTimeRangeEndChange = (end: string | null) => {
    setTimeRangeEnd(end);
    if (timeRangeStart && end) {
      const span = TIME_ORDER.indexOf(end) - TIME_ORDER.indexOf(timeRangeStart);
      if (span > 0) setMinConsecutiveSlots(span);
    } else if (!timeRangeStart && !end) {
      setMinConsecutiveSlots(1);
    }
  };

  const { locations, loading: locationsLoading } = useLocations(sport);

  const isAllLocations = locationId === '';
  const singleFacility = useFacility(isAllLocations ? null : locationId, date, sport);
  const allFacilities = useAllFacilities(locations, date, isAllLocations, sport);

  const activeCourts = useMemo(() => {
    if (isAllLocations) {
      return allFacilities.results.flatMap(group =>
        group.courts.map(court => ({
          ...court,
          location_name: group.location_name,
          // Ensure courts from different location_ids with the same name are grouped separately
          location_id: group.location_id,
        }))
      );
    }
    return singleFacility.courts;
  }, [isAllLocations, singleFacility.courts, allFacilities.results]);

  const courtsLoading = isAllLocations ? allFacilities.loading : singleFacility.loading;
  const courtsError = isAllLocations ? allFacilities.error : singleFacility.error;
  const allLocationsProgress = isAllLocations ? allFacilities.progress : 0;
  const loadedCount = isAllLocations ? allFacilities.loadedCount : 0;
  const totalCount = isAllLocations ? allFacilities.totalCount : 0;

  // Geolocation
  const userLocation = useUserLocation();

  // Fetch real lat/lng + parliment info from DBKL location detail API
  const locationIds = useMemo(() => locations.map(l => l.location_id), [locations]);
  const locationDetails = useLocationDetails(locationIds);

  // Rich distance map keyed by location_id: { formatted, km, lat, lng }
  // km is the raw straight-line value used for sorting; formatted applies the road correction factor.
  // Venues with invalid coordinates (lat/lng are NaN or zero) are skipped.
  const distances = useMemo(() => {
    const distMap = new Map<string, { formatted: string; km: number; lat: number; lng: number }>();
    if (!userLocation.coords) return distMap;
    locationDetails.forEach((detail, locId) => {
      if (Number.isFinite(detail.lat) && Number.isFinite(detail.lng)) {
        const km = haversineKm(
          userLocation.coords!.lat,
          userLocation.coords!.lng,
          detail.lat,
          detail.lng
        );
        distMap.set(locId, { formatted: formatDistance(km), km, lat: detail.lat, lng: detail.lng });
      }
    });
    return distMap;
  }, [userLocation.coords, locationDetails]);

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: 'var(--color-bg-gradient)' }}
    >
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700/60 backdrop-blur-sm sticky top-0 z-20 shadow-lg dark:shadow-2xl transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          {/* Shuttlecock icon */}
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-emerald-600 dark:fill-emerald-400" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C9.8 2 8 3.8 8 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm7.07 4.93l-1.41-1.41c-.78-.78-2.05-.78-2.83 0L13 13.34V22h2v-7.83l1.66-1.66 1.41 1.41L20 12.09l-1.93 1.84z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Court Finder
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wider">
                DBKL
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Live {SPORT_OPTIONS.find(s => s.value === sport)?.label?.toLowerCase() ?? 'sports'} court availability</p>
            </div>
          </div>
          {userLocation.coords && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-500">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-500">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Location active</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Bar */}
        <FilterBar
          sport={sport}
          onSportChange={handleSportChange}
          date={date}
          onDateChange={setDate}
          locationId={locationId}
          onLocationChange={setLocationId}
          locations={locations}
          minConsecutiveSlots={minConsecutiveSlots}
          onMinSlotsChange={setMinConsecutiveSlots}
          minCourtsNeeded={minCourtsNeeded}
          onMinCourtsChange={setMinCourtsNeeded}
          timeRangeStart={timeRangeStart}
          onTimeRangeStartChange={handleTimeRangeStartChange}
          timeRangeEnd={timeRangeEnd}
          onTimeRangeEndChange={handleTimeRangeEndChange}
          locationLoading={locationsLoading}
          allLocationsProgress={allLocationsProgress}
          distances={distances.size > 0 ? distances : undefined}
          locationDetails={locationDetails}
        />

        {/* Location permission hint */}
        {!userLocation.coords && !userLocation.loading && (
          <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-500 dark:fill-slate-400 flex-shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-slate-600 dark:text-slate-400">
              Allow location access to sort courts by distance from you.
            </span>
          </div>
        )}

        {/* Timeline View */}
        <TimelineView
          courts={activeCourts}
          date={date}
          sport={sport}
          minConsecutiveSlots={minConsecutiveSlots}
          minCourtsNeeded={minCourtsNeeded}
          timeRangeStart={timeRangeStart}
          timeRangeEnd={timeRangeEnd}
          loading={courtsLoading}
          error={courtsError}
          distances={distances.size > 0 ? distances : undefined}
          locationDetails={locationDetails}
          loadedCount={loadedCount}
          totalCount={totalCount}
        />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-700/50 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-5 text-center text-slate-500 dark:text-slate-500 text-xs">
          Data powered by DBKL API · {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </footer>
    </div>
  );
}

export default App;
