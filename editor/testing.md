# Testing

### Crashes list - `/crashes`

- [role: editor, admin] **Create Crash Record** button is visibile in top-right corner of card
- loading spinner appears to left of pagination controls while page loads
- loading spinner appears to left of pagination controls when search is updated
- search by Crash ID, Case ID, and address fields
- filter by preset date range
- filter by custom date range
- filter by various card switches:
  - Temporary records
  - Mode
  - Jurisdiction
  - Fatalities
- filter menu toggle shows a badge with how many fitler switches are enabled
- refresh page and varify that search filters are persisted
- use Reset button to reset filters. Refresh page to verify reset is persisted.
- paginate through search results
- sort by various columns
- sort indicator icon updates as sort column changes
- Reset filters button appears when sort column is changed
- Column sort setting is persisted when refresh page
- Loading spinner appearas when column sort triggers data refetch
- Use download button to export records
- Download modal: Info banner appears with message about # of records to be downloaded
- Download modal: Download button is disabled and displays a spinner while data is being fetched
- Download modal: use Download button to save exported data
- Open downloaded data in CSV editor and verify it has no rendering or formatting issues
- Record count is visible to left of Download button


### Create temporary crash record

- [role: editor, admin] Use **Create crash record** button to open crash record form
- Cannot complete **Create crash record** without populating Case ID, Crash date, Primary address, and at least one unit
- Add multiple units with at least one fatality and one injury
- Submit form and verify crashes list updates with the newly created record
- On crashes list, the **Temporary records only** filter switch shows only temporary records
- Verify that crash details page of the temp record reflects units + people injuries correctly
- Delete temporary crash record
- After deleting temporary crash, use back button to navigate to it's details page and veryify 404 page shows

### Crash details - `/crashes/[record_locator]`

- Breadcrumb shows below navbar with Crash ID
- Crash address header looks correct
- Crash injury widget reflects injuries from **People** card (test by editing person injuries)
- Temporary record banner is visible for (temp crashes only)
- [role: editor, admin] Delete tempoary crash record button inside temp record banner  (temp crashes only)
- Crash map: crash map displays crash location with nearmap aerials
- Crash map: edit crash location by dragging map
- Crash map: edit crash location by keying in lat/lon
- Crash map: validation restricts keying in lat/lon with alpha characters
- Crash map: validation restricts keying in empty/blank lat/lon
- Crash map: validation restricts keying in lat/lon outside of Austin metro area
- Crash diagram: diagrams image renders within card body
- Crash diagram: zoom, rotate, and reset diagram image using buttons and slider
- Crash diagram: hold shift + scroll to zoom
- Crash diagram: the diagram card does not capture scroll unless shift is pressed
- Crash diagram: info alert shows when no diagram is available and is temp record
- Crash diagram: danger alert shows when no diagram is available and is not temp record
- Crash narrative: loads normally and is scrollable for long narratives
- Crash narrative: download CR3 pdf
- Crash data card: edit various field types:
  - Yes/No - e.g., **At intersection**
  - Select lookup value — e.g., **Collision type**
  - Input field — e.g., **Law Enforcement YTD Fatal Crash**
- Crash data card: cannot save unless field is edited
- Crash data card: use cancel button to exit edit mode and restore initial value
- Crash data card: use `enter` key to save edits
- Crash data card: edit a field with lookup values
- Crash data card: edit a text input
- Crash data card: edit a number input
- Crash data card: edit a yes/no field
- Crash data card - **Flags**
- Crash data card: nullify a value (e.g. street name) by clearing its input and saving it
- [role: editor, admin] Crash data card - **Swap addresses** button is visibile in **Primary address** card header can be used to swap primary and secondary addresses
- FRB Recommendations
  - Create recommendation
  - Edit recommendation
- Related records - units: click field to edit it
- Related records - charges
- Related records - people
  - name edit component
- Record history: change to crash, units, people are being tracked.
- Record history: Details modal opens on row collect. 
- Record history: Card is collapseable and collapsed state is persisted when refreshing the page
- Keyboard shortcuts to scroll instantly to various cards:
  - `shift` + `a`: Primary address
  - `shift` + `u`: Units
  - `shift` + `p`: People
  - `shift` + `c`: Charges
  - `shift` + `n`: Notes
  - `shift` + `f`: Fatality Review Board recommendations

### Sidebar
  - is expandable and open/closed state is preserved in localstorage
  
### Locations list - `/locations`
- Locations list
  - filter using search input and selecting a field to search on
  - reset filters
  - filters are preserved (in local storage) when refreshing the page or navigating back to it

### Location details `/locations/[location_id]`
  - Location polygon map
  - Location data card displays the location ID, crash counts and comp costs
  - combined cr3 and noncr3 crashes list


### Top nav

- Vision Zero logo displays on left side
- Crash search
  - The **Case Id** / **Crash ID** button toggles the search field
  - Searching by a known Case ID will cause the page to redirect to the crash details for the matching crash
  - Searching by a known CRIS Crash ID will cause the page to redirect to the crash details for the matching crash
- Avatar image displays on right side with dropdown items
  - email address (disabled/not clickable)
  - dark mode toggle
  - signout link
  - external links to report a bug, request enhancement, and TxDOT's CR3 codesheet

### Users - `/users`

  - user list view
  - user details card
  - add a new user
  - edit a user
  - delete a user
  - copy user emails

## Todo

- permissions-based features:
  - side nav
  - field editing
  - etc. see <Can/> component from VZE
- crash details
  - crash injury widgets
  - notes
  - misc column editing + placement
  - Crash map: show coordinates and enable editing by tying into input
  - crash diagram: zoom/tilt control

- locations
  - export records
- location details
  - crash charts and widgets
- upload non-cr3
- dashboard
- login page: make it look nice
- versioned localstorage
- error boundary (see Moped's for reference)
- map geocoder (technically an enhancement vis a vis current state)

### Misc

- The route path ( `/editor`) redirects to `/editor/crashes`. Locally, `http://localhost:3002/` should also redirect to `/editor/crashes`
- The page footer is stuck to the bottom of the oageon all pages and displays current version number
- The app favicon appears in the browser tab
- Locally, the environment banner shows at the top of the screen with a light yellow background. On staging/netlify, the banner shows with a light blue background
- login page 

