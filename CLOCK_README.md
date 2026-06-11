# Digital Clock - Multiple Time Zones

A modern web application that displays the current time across different time zones around the world.

## Features

### 🌍 Multiple Time Zones
- Display time in 4 default time zones (New York, London, Tokyo, Sydney)
- Add or remove time zones dynamically
- Support for 30+ major world time zones
- Search and filter functionality

### ⏰ Real-time Updates
- Live clock display that updates every second
- Shows time, date, and day of the week
- UTC offset information for each timezone
- 12-hour format with AM/PM

### 🎨 Beautiful UI
- Modern gradient background
- Responsive card-based layout
- Smooth animations and transitions
- Dark/light contrast for readability
- Mobile-friendly design

### 🔍 Search & Filter
- Search clocks by timezone name or time
- Add new time zones from a searchable list
- Only available time zones appear in the add menu
- Quick reset to default time zones

### 💾 Persistent Data
- Selected time zones are saved to localStorage
- Your preferences persist across sessions
- No server required

## How to Use

1. Open `clock.html` in your web browser
2. View the default 4 time zones
3. Click **+ Add Time Zone** to add more clocks
4. Search for your desired timezone in the modal
5. Click a timezone to add it
6. Hover over a clock and click **×** to remove it
7. Use the search bar to filter displayed clocks
8. Click **Reset to Default** to restore original time zones

## Supported Time Zones

The clock supports 30+ time zones including:

**Africa:** Johannesburg, Lagos, Cairo, Nairobi

**Americas:** 
- USA: New York, Chicago, Denver, Los Angeles, Anchorage
- Canada: Toronto
- Mexico: Mexico City
- South America: Buenos Aires, Sao Paulo, Caracas

**Europe:** London, Paris, Berlin, Moscow, Istanbul, Athens, Amsterdam, Stockholm, Prague

**Asia:**
- Middle East: Dubai
- South Asia: Kolkata
- Southeast Asia: Bangkok, Jakarta, Manila, Singapore, Taipei
- East Asia: Hong Kong, Shanghai, Tokyo, Seoul

**Oceania:** Sydney, Melbourne, Perth, Auckland, Fiji, Samoa, Honolulu

## Features Breakdown

### Clock Card Display
- Timezone name (formatted for readability)
- Current time (12-hour format)
- Full date (Month Day, Year)
- Day of the week
- UTC offset information
- Remove button (visible on hover)

### Search Functionality
- Real-time filtering of displayed clocks
- Search by timezone name or time value
- Instant results as you type

### Time Zone Modal
- Modal dialog for selecting time zones
- Search within available timezones
- Only shows timezones not already selected
- Click to add, click close or outside to cancel

### Responsive Design
- Desktop: Multi-column grid layout
- Tablet: 2-3 columns
- Mobile: Single column
- All interactive elements work perfectly on touch devices

## Technical Details

- **Pure JavaScript**: No frameworks or dependencies
- **HTML5 Canvas**: Not required - CSS Grid layout
- **Internationalization API**: Uses native `Intl` for accurate timezone conversion
- **Local Storage API**: For persistent user preferences
- **Responsive CSS**: Flexbox and Grid for layout

## Browser Compatibility

Works in all modern browsers:
- Chrome 24+
- Firefox 29+
- Safari 10+
- Edge 15+
- Opera 15+

## How It Works

The app uses JavaScript's `Intl.DateTimeFormat` API to convert the current time to different timezones. Each second, all clocks are updated with:

1. Current time formatted for the specific timezone
2. Current date
3. Day of the week
4. UTC offset calculation

The selected timezones are stored in localStorage, so your preferences are remembered across sessions.

Enjoy coordinating across time zones! 🌍⏰
