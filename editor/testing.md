# Testing

### User roles

The app has three user roles: **Admin**, **Editor**, and **Viewer**. Test accounts are available for all three accounts in 1pass.

The below features should be tested with each role. Features with role-based access or visibility are indicated as such below, with the exception of editing in-general, which the **Viewer** role is completely prohibited from doing.

### Crashes list - `/crashes`

- Verify page `<title>` element is `Crashes - Vision Zero Editor` (check how the title is rendered in your browser tab)
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
- Record count is visible to left of pagination buttons
- paginate through search results
- use dropdown menu (to right of pagination controls) to change page size
- sort by various columns
- sort indicator icon updates as sort column changes
- Reset filters button appears when sort column is changed
- Use column visibility settings menu (gear icon to right of pagination controls) to adjust column visibility
- Verify column visibility settings persist when page is refreshed
- Column sort setting is persisted when refreshing the page
- Loading spinner appearas when column sort triggers data refetch
- Crashes map: Use the **Map** toggle to the right of the search input to switch between the list and map views
- Crashes map: Adjust the page size to show many features on map
- Crash map: use the address search to find a location within Austin metro area
- Crashes map: zoom in. click on a crash point to display it's pop-up card.
- Crashes map: use the fit bounds control (top right corner of map, above +/- buttons) to recenter the map
- Crashes map: Use the basemap control to change to the **Aerial** imagery basemap. Zoom in to make sure tiles load properly. Zoom out, and notice that the tiles transition to the mapbox satellite layer with road line features on top of the imagery.
- Crashes map: Switch back to **Streets** basemap. Now switch to dark mode and (1) confirm that the basemap changes to the dark streets basemap and (2) click on a point to confirm that it's pop-up card is styled with a dark background
- Crashes map: refresh your page to make sure the dark mode map setting persists
- Crashes map: click on a crash point once more and use the hyperlinked crash ID to navigate to the crash details page
- Use download button to export records to csv
- Download modal: Info banner appears with message about # of records to be downloaded
- Download modal: Download button is disabled and displays a spinner while data is being fetched
- Download modal: use Download button to save exported data
- Open downloaded data in CSV editor and verify it has no rendering or formatting issues

### Create temporary crash record

- [role: editor, admin] Use **Create crash record** button to open crash record form
- Cannot complete **Create crash record** without populating Case ID, Crash date, Primary address, and at least one unit
- Add multiple units with at least one fatality and one injury
- Submit form and verify crashes list updates with the newly created record
- On crashes list, the **Temporary records only** filter switch shows only temporary records
- Verify that crash details page of the temp record reflects units + people injuries correctly
- Delete temporary crash record
- After deleting temporary crash, use back button to navigate to it's details page and verify 404 page shows

### Crash details - `/crashes/[record_locator]`

- Breadcrumb shows below navbar with Crash ID
- Verify page `<title>` element is formatted as `<record-locator> - <crash-address>` (check how the title is rendered in your browser tab)
- Crash address header looks correct
- [role: editor, admin] Click crash address to edit form inputs. Use **Swap addresses** button to swap primary and secondary address inputs. Confirm changes save correctly.
- Crash injury widget reflects injuries from **People** card (test by editing person injuries)
- Temporary record banner is visible for (temp crashes only)
- [role: editor, admin] Delete tempoary crash record button inside temp record banner (temp crashes only)
- Crash map: card header: displays hyperlinked **Location ID** (if crash is matched to a location)
- Crash map: card header: displays **Provider** as **TxDOT CRIS** (default for new crashes from CRIS) or **Manual Q/A** (if a crash location is edited)
- Crash map: crash map displays crash location with nearmap aerials by default
- Crash map: Use the basemap control to change to the **Streets** basemap. Zoom way in and way out to make sure basemap load properly.
- Crash map: edit crash location by dragging map
- Crash map: edit crash location by keying in lat/lon
- Observe in change log that council district, jurisdiction, APD sector, engineer area update when crash location is edited to a distant position
- Crash map: use the address search to find a location within Austin metro area
- Crash map: use the fit bounds control (top right corner of map, above +/- buttons) to recenter the map
- Crash map: verify **Location ID** updates when crash is moved to another intersection
- Crash map: validation restricts keying in lat/lon with alpha characters
- Crash map: validation restricts keying in empty/blank lat/lon
- Crash map: validation restricts keying in lat/lon outside of Austin metro area
- Crash diagram: diagrams image renders within card body
- Crash diagram: zoom, rotate, and reset diagram image using buttons and slider
- Crash diagram: hold shift + scroll to zoom
- Crash diagram: the diagram card does not capture scroll unless shift is pressed
- Crash diagram: info alert shows when no diagram is available and is temp record
- Crash diagram: danger alert shows when no diagram is available and is not temp record
- Crash diagram: [role: admin, editor] **Save** button with disk icon shows as disabled if diagram x/y/z/rotate is not edited and diagram is initial loaded position
- Crash diagram: [role: admin, editor] Change diagram x, y, z, and rotate. Confirm that **Save** button enables when any of these properties are adjusted
- Crash diagram: [role: admin, editor] Use **Save** button to save current x/y/z/rotate. Refresh the page and confirm the diagram initializes at the expected transform state. On load, confirm that **Save** button is disabled and says **Saved** with a checkmark icon.
- Crash narrative: loads normally and is scrollable for long narratives
- Crash narrative: download CR3 pdf
- Crash data card: **Flags** card. Edit set **Private drive** to **No** and verify that warning banner appears with notification that the crash is not included in VZ statistical reporting
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
- Crash data card: Use gear icon in top left of card header to toggle column visibility on/off. Refresh page and verify that settings are persisted
- Crash data card - **Other**: cannot save a speed limit that is not a positive integer
- Crash data card: nullify a value (e.g. street name) by clearing its input and saving it
- Related records - **Units**
  - Use gear icon in top left of card header to toggle column visibility on/off. Refresh page and verify that settings are persisted
  - Verify unit **Contributing factors** are listed and prefixed with either **Primary** or **Possible**
  - Edit unit **Year**, **Body style**, **Type**, and **Movement**
  - Edit unit: cannot save a **Year** value less than 1900 or after the current year + 1
- Related records - **People**
  - Use gear icon in top left of card header to toggle column visibility on/off. Refresh page and verify that settings are persisted
  - Edit person **Name** and person **Type**
  - Edit person **Zipcode** and verify only pattern xxxxx or xxxxx-xxxx is valid
  - Edit person **Injury severity** and verify the crash injury widget (top of page to the right of crash address) updates accordingly
- Related records - **EMS Patient Care**
  - Use gear icon in top left of card header to toggle column visibility on/off. Refresh page and verify that settings are persisted
  - Verify records are populated (use EMS list view to find a crash with EMS records)
  - Verify records which were "automatically matched" are unmatched (disappear from table) when crash is moved +1200 meters
- Record history: changes to crash, units, people are being tracked.
- Record history: Details modal opens on row collect.
- Record history: Card is collapseable and collapsed state is persisted when refreshing the page
- Related records - **Notes**
  - [role: admin, editor] Ability to add, edit, and delete notes
  - [role: admin, editor] Note cannot be added or edited when the **Note** input is blank
  - Note **Created at** and **Updated by** are correct
- FRB Recommendations
  - [role: Admin, editor] Create and edit all recommendation fields
- Keyboard shortcuts to scroll instantly to various cards:
  - `shift` + `u`: Units
  - `shift` + `p`: People
  - `shift` + `3`: EMS patient care
  - `shift` + `c`: Charges
  - `shift` + `n`: Notes
  - `shift` + `f`: Fatality Review Board recommendations
- Hover your mouse over each card that has a shortcut key and verify that the shortcut key helper text appears above the right edge of the card. 

### Sidebar

- is expandable and open/closed state is preserved in localstorage

### Locations list - `/locations`

- Verify page `<title>` element is `Locations - Vision Zero Editor` (check how the title is rendered in your browser tab)
- filter using search input and selecting a field to search on
- reset filters
- filters are preserved (in local storage) when refreshing the page or navigating back to it
- Use column visibility settings menu (gear icon to right of pagination controls) to adjust column visibility
- Verify column visibility settings persist when page is refreshed
- export records to CSV

### Location details `/locations/[location_id]`

- Verify page `<title>` element is formatted as `<location-ID> - <location-name>` (check how the title is rendered in your browser tab)
- Location polygon map
- Location data card displays the location ID, crash counts and comp costs
- combined cr3 and noncr3 crashes list
  - this will not load locally until you manually refresh the view:

```sql
refresh materialized view location_crashes_view;
```

- use the **Map** toggle the view the map of crashes at the location
- verify map popup shows the crash **Type** the **Case ID** (for non-cr3 crashes), the **Crash ID** (hyperlinked, for CR3 crashes)

### EMS list - `/ems`

- filter using various search input fields and filter card switches
- filters are preserved (in local storage) when refreshing the page or navigating back to it
- for records with a matching crash, the **Crash ID** column is populated with working URL to the crash details page
- **Incident #** column has a working hyperlink to the EMS details page (`/ems/[incident_number]`)

### EMS incident details - `/ems/[incident-number]`

- Page breadcrumb and title—which is the EMS record address—look normal
- Incident map (top right of page) 
    - Use the EMS list page to filter/find an incident that has been matched automatically to a crash, person, and non-cr3 record
    - The incident map should display a CR3 crash (blue circle with car icon) and non-cr3 (gray cricle with sticky note icon) on the map as well as the EMS incident (red circle with ambulence icon)
    - Use the layer selector to toggle the CR3 and non-cr3 layers on/off
    - Use the layer selector to switch beetween the satellite and streets basemap
- Navigating to a bogus incident number such as `/ems/1abc` results in 404

#### EMS -> CR3 matching UI

- Locate an incident with multiple EMS patients: sort the EMS list by incident number and find rows that have the same incident number—visit the details page for any of the rows.
- The **EMS Patients** card displays multiple EMS patients with the same incident number.
- Use the column visibility selector to enable all columns on the **EMS Patients**
- Find an EMS patient record with a **person match status** of **Matched automatically**. Verify that the **Person match attributes** and **Match quality** fields are populated
- If **any** of the EMS patient records are not matched to a crash, the **Possible CR3 people matches** table will display **people** records from crashes that occurred during a 12-hour window of the crash
- The **Possible CR3 people matches** will also display **people** records from any crashes which are matched to any of the EMS patient records
- To match an EMS patien to a crash, confirm that the **Select person** button is displayed for each EMS patient row
- Click **Select person** to enable the **Select match** button to appear next to any unlinked person records in the **Possible CR3 people matches** table
- Click the **Person ID** column for any **EMS Patients** row to manually edit a person ID value
- Click the **Person ID** column and save an invalid person ID value and verify an error message is displayed
- Locate an **unmatched** EMS record, then click the **Person ID** column and save a valid person ID value
- Use the falafel menu to **Reset** an incident matched to a person ID
- Use the falafel menu to modify an incident to be **Match not found**
- Use the falafel menu to **Delete** an EMS record which is matched to a crash. If is is the only EMS record with this incident number, the 404 page will render.
- Navigate to the crash details page of the deleted record and confirm it is not displayed on the **EMS patien care** card
- The **Possible non-CR3 matches** card should display either no records if there are no matches, one match, or multiple possible matches depending on the non-CR3 match status

#### These steps test the DB trigger that matches EMS records to crashes

1. Visit the crash details for CRIS Crash `17357278`: `http://localhost:3002/editor/crashes/17357278`
2. Scroll down to **EMS Patient care** and observe that there is a single EMS record with status of **Matched automatically**
3. Edit the crash's **Longitude** to be `-98.12642144`. Scroll down to the EMS table and notice that there are no EMS records listed.
4. Edit the crash's **Longitude** back to the original value of `-97.676720393005`. Notice that the matched EMS record is listed in the EMS table. Use it's hyperlinked incident # to visit the incident details page.
5. Use the match UI to match the EMS record to any person record. Notice that it's status changes to **Matched by review/QA**
6. Navigate back to the crash details page, and again edit the longitude to `-98.12642144`. Notice that the EMS record remains listed in the table.
7. Navigate back to the EMS incident details page, and use the falafel menu to "Reset" the record's status.
8. Notice that the EMS record now has a status of **Unmatched**
9. Finally, go back to the crash details and once again restore the crash to it's original **Longitude**: `-97.676720393005`. Notice that the EMS record is again listed in the table with a status of **Matched automatically**

### Fatalities list - `/fatalities`

- Search, sort, and filter the falitities list
- Test the column visibility picker to show/hide columns
- Toggle the map view and click on a point to open it's pop-up card. Click on the hyperlinked crash ID to navigate the crash details page

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

### Upload Non-CR3 records page

- **Viewer** role cannot see this page
- download template file
- upload unedited template file and observe validation errors
- fix broken lines

### Dashboard page

- Page loads with embedded VZV
- Card hyperlinks work

### Users - `/users`

- user list view
- user details card
- add a new user
- edit a user
- delete a user
- copy user emails

### Misc

- The route path ( `/editor`) redirects to `/editor/crashes`. Locally, `http://localhost:3002/` should also redirect to `/editor/crashes`
- The page footer is stuck to the bottom of the oageon all pages and displays current version number
- The app favicon appears in the browser tab
- Locally, the environment banner shows at the top of the screen with a light yellow background. On staging/netlify, the banner shows with a light blue background
- login page
- location details
  - crash charts and widgets
- upload non-cr3
