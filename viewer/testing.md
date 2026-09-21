# Testing

Follow this guide to test the Vision Zero Viewer.

### Support browsers and operating systems

We have [Browserstack](https://www.browserstack.com/) available to us for cross-platform testing. Credentials are in 1Pass. All releases should be tested on:

- Windows - Chrome
- Windows - Firefox
- Macos - Safari
- Macos - Chrome
- Android - Chrome
- iOS - Safari

### Summary page - `/`

- Info banner at the top links to the Vision Zero Program **website** and the **Capital Projects Explorer** (both open in a new tab)
- Click the info icon (ⓘ) next to **Crash data** to open the "Traffic Crashes" definitions popover; confirm it closes
- KPI widget row (Fatalities, Years of Life Lost, Serious Injuries, Total Crashes) loads without error and shows a current-year vs. prior-year comparison for each
- Click the info icon on **Years of Life Lost** to open its definition popover
- For each of the 6 chart cards below, click the info icon (ⓘ) in the card header to open/close its definitions popover, and use the **All / Fatalities / Serious Injuries** toggle to confirm the chart re-renders:
  - **By Year & Month**: toggle between **Monthly** and **Cumulative** chart types; confirm current year is compared against the 5-year average
  - **By Travel Mode**: click a mode icon in the legend to toggle that mode's data off/on the chart; confirm the totals table above the chart matches what's plotted
  - **By Time of Day**: click through the per-year buttons (including **All**); hover over the heatmap to confirm tooltips show crash counts per day-of-week/hour cell
  - **By Demographics**: switch between the **Race/Ethnicity**, **Age**, and **Sex** tabs; hover over the stacked bar to confirm tooltips show both count and percentage
  - **By Population (Rate Per 100,000)**: confirm the table and bar chart both render and agree
  - **View the map**: hover to confirm the overlay effect, click to navigate to `/map`

### Map page - `/map`

- Map loads centered on Austin; pan/zoom is restricted to the Travis County area and won't zoom out past the metro area
- Use the zoom in/out control (top right) and the geolocate control below it (accept/deny the browser location permission prompt and confirm behavior either way)
- Use the address search box (top left) to search a location in the Austin metro area and confirm the map flies to it
- Click the attribution "i" control (bottom right) and confirm the "Improve this map" link works
- **Injury type** filter (sidebar): toggle **All**, **Fatal**, **Serious Injuries** and confirm the correct points render on the map
- **Travel mode** filter (sidebar checkboxes): all modes are checked by default (Pedestrian, Bicyclist, Motorist, Motorcyclist, E-Scooter Rider, Other); uncheck one and confirm matching points disappear from the map; you must always leave at least one checked
- **Crash date** filter (sidebar):
  - Change the start/end date and confirm an **Apply date filter** button appears; click it and confirm the map updates
  - Confirm a **Reset** button appears once the applied range differs from the default, and that it resets the range and refreshes the map
  - Confirm you cannot pick a date before 2014-01-01 or after today
  - On a mobile-width screen, confirm the date inputs render as native date pickers instead of the calendar widget
- **Crash time of day** chart (sidebar): click a bar (e.g. 12AM–4AM) and confirm the map filters to that window and the bar is highlighted while others gray out; click **Reset** to clear it
- **Overlays** (sidebar): click **ASMP Street Levels**, **High Injury Network**, and **Austin City Council Districts** one at a time and confirm only one overlay is active at a time (clicking the active one again turns it off)
  - With **ASMP Street Levels** active, toggle its 1–5 sub-level buttons on/off and confirm the map layer updates
  - Click the info icon (ⓘ) next to **Overlays** to open/close its definitions popover
- Click a crash point (fatal or serious injury) to open its popup; confirm it shows Date/Time, Fatalities, Serious Injuries, Modes Involved, and Crash ID; use the copy button next to Crash ID and confirm a "Copied" tooltip appears; close the popup with the X
- With **Austin City Council Districts** active, click a district on the map and confirm a popup shows the district number
- Use the polygon draw tool (bottom-right map control):
  - Draw a polygon and confirm a summary box appears showing crash counts (Fatalities/Serious Injuries, matching whichever injury-type filter is active) for the area
  - Start drawing again and cancel mid-draw using the cancel button, and separately by pressing **Escape**; confirm the in-progress shape is discarded both ways
  - After a polygon is drawn, use the trash/clear button to remove it and confirm the map returns to normal
  - Confirm clicking on other map features (crash points, districts) doesn't open a popup while actively drawing
- Use the **Give feedback** mailto link at the bottom of the sidebar

### `/measures` embed view

- Loads standalone at `/measures` with no header, footer, or side drawer (this view is meant to be embedded via iframe on an external site)
- Confirm the 4 KPI numbers match what's shown on the Summary page

### Navigation & footer

- Header shows the Vision Zero logo; the nav button for the page you're *not* currently on is visible (e.g. on `/`, a **Go to Map** button shows; on `/map`, a **Go to Summary** button shows) and navigates correctly
- On a mobile-width screen, use the hamburger icon to open/close the side drawer
- Footer (visible on `/`, not shown on `/map` or `/measures`) links all resolve correctly: **Data**, **Code**, **Terms of Use**, **Privacy**, **Give feedback on Vision Zero Viewer** (mailto), **Powered by Data & Technology Services**
- Footer displays the current app version number

### Misc

- Navigate to an undefined route (e.g. `/viewer/asdf`) and confirm the "Sorry, but this page does not exist." message renders
- Resize to a mobile width and spot-check: side drawer becomes a slide-out toggled by the hamburger, map date inputs switch to native date pickers, travel-mode labels on the By Travel Mode chart hide below small screen widths
- (Env-gated, not a normal click-through step) If `VITE_UNDER_MAINTENANCE` is set, confirm the maintenance banner renders instead of the app, with different copy on `/measures` vs. other routes
