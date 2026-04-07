# DBKL Badminton Court Finder

A modern web application to find available badminton courts at DBKL (Dewan Bandaraya Kuala Lumpur) facilities. The app provides a real-time, user-friendly interface to search for courts, check availability, and filter by consecutive time slots.

## Features

- **Live Data**: Fetches real-time court availability from DBKL APIs
- **Location Search**: Select from 72+ DBKL locations with badminton facilities
- **Date Picker**: Search availability for any date
- **Consecutive Slots Filter**: Filter courts by minimum consecutive available slots (configurable)
- **Timeline View**: Visual representation of court availability throughout the day
- **Color-Coded Availability**: 
  - Green (✓) = Available
  - Red (✗) = Booked
- **Show/Hide Toggle**: View all courts or only those meeting your slot requirements
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **API Integration**: DBKL Public API

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173/` (or the next available port if 5173 is in use).

## Project Structure

```
src/
├── App.tsx              # Main application component
├── components/
│   ├── FilterBar.tsx    # Date, location, and filter controls
│   ├── TimelineView.tsx # Court availability display
│   ├── CourtRow.tsx     # Individual court row
│   └── SlotCell.tsx     # Individual time slot cell
├── hooks/
│   ├── useLocations.ts  # Hook for fetching locations
│   └── useFacility.ts   # Hook for fetching court availability
├── utils/
│   └── consecutiveSlots.ts  # Utility for checking consecutive available slots
└── index.css            # Global styles with Tailwind
```

## How It Works

1. **Location Loading**: The app fetches all DBKL locations that have badminton facilities
2. **Date & Location Selection**: User selects a location and date to check availability
3. **Court Fetching**: The app calls the DBKL facility API with the selected parameters
4. **Filtering**: Courts are filtered based on the minimum consecutive slots requirement
5. **Display**: Available courts are displayed in a timeline view with color-coded slots

## API Integration

The app uses two DBKL public endpoints:

### 1. Locations API
- **Endpoint**: `https://apihub.dbkl.gov.my/api/public/v1/location/getCategoryByLocation`
- **Purpose**: Fetch all available locations and their categories
- **Response**: Nested structure with locations grouped by category

### 2. Facility Availability API
- **Endpoint**: `https://apihub.dbkl.gov.my/api/public/v1/location/facility`
- **Parameters**: 
  - `sub_category`: BADMINTON
  - `location_id`: Selected location ID
  - `search_date`: Date in YYYY-MM-DD format
- **Response**: Courts with their time slots and availability status

## Usage

### Basic Workflow

1. **Load the App**: Navigate to the application URL
2. **Select Location**: Choose a badminton facility from the dropdown (72+ options)
3. **Pick Date**: Use the date picker to select the date you want to check
4. **Adjust Filter**: Set minimum consecutive slots (default: 2)
   - Use quick buttons (2 or 4) or type a custom number
   - Max: 12 consecutive slots
5. **View Results**: 
   - Courts meeting the filter criteria are highlighted
   - Use "Show all" to see courts that don't meet the filter
   - Green cells = available, Red cells = booked

### Features

- **Quick Presets**: Click "2" or "4" buttons to quickly set consecutive slot requirements
- **Date Navigation**: Change the date to see availability for different days
- **Flexible Filtering**: Adjust the minimum slots on the fly
- **Legend**: Bottom section shows color meanings (Available/Booked)

## Data Displayed

For each court, the app shows:
- **Venue Name**: Court identifier (e.g., COURT 1, COURT 2)
- **Time Slots**: Hourly slots from 8:00 AM to 12:00 AM
- **Availability Status**: Color-coded for instant recognition
- **Pricing**: Shown on hover (Malaysian Ringgit)

## Performance Notes

- Locations are fetched once on app load and cached
- Court availability is fetched on-demand when location/date changes
- No database required - all data is fetched on-the-fly from DBKL APIs
- Responsive design optimized for all screen sizes

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## CORS Note

The app calls DBKL APIs directly from the browser. If you encounter CORS errors, uncomment the proxy configuration in `vite.config.ts` to relay requests through a local proxy.

## Future Enhancements

- User accounts and booking history
- Email/SMS notifications for available slots
- Integration with actual booking system
- Court rating and reviews
- Favorite locations
- Share availability with friends
- Calendar view for multi-day planning

## License

This project is open source and available for personal and commercial use.

## Support

For issues with the app, check:
1. Browser console for error messages
2. Network tab to verify API responses
3. Ensure you have an active internet connection
4. Try a different location or date

## Acknowledgments

- DBKL API for providing public access to facility data
- Tailwind CSS for styling utilities
- React for the component framework
- Vite for the build tool
