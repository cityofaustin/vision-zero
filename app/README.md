**This** is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Quick start

1. Start your database and graphql engine

2. Use the `env_template` to configure the local environment variables. These can be copied from your existing VZE `.env` file, by replacing `REACT_APP_` with `NEXT_PUBLIC_` in the variable name:

```shell
# run this cmd and then edit .env.local as needed
cp -n env_template .env.local
```

3. Activate your `node` environment (`v20` is required):

```shell
nvm use
```

4. Install node packages

```
npm install
```

5. Start the development server

```shell
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## This app vs the old VZE

- Create-React-App ➡️ NextJS
- Javascript ➡️ Typescript
- CoreUI + reactstrap ➡️ react-bootstrap
- Apollo Client ➡️ SWR + graphql-request

## Working features

- Crashes list
  - filter by preset date range
  - filter by custom date range
  - filter using search input and selecting a field to search on
  - reset filters
  - filters are preserved (in local storage) when refreshing the page or navigating back to it
  - advanced search filter menu toggle shows a badge with how many fitlers are applied
  - expandable filter toggle menu with working filter switch groups
  - paginate through search results
  - loading spinner apperas in pagination controls when fetching data
  - sortable table columns with icon indicating sort direction
- Crash details page
  - Crash map: crash map displays crash location with nearmap aerials
  - Crash map: ability to edit crash location  
  - Crash diagram: diagrams render
  - Crash diagram: no pan/twist/zoom controls (yet)
  - Crash narrative: loads normally and is scrollable for long narratives
  - Crash data card: click field to edit
  - Crash data card: cannot save unless field is edited
  - Crash data card: use cancel button to exit edit mode and restore initial value
  - Crash data card: edit a field with lookup values
  - Crash data card: edit a text input
  - Crash data card: edit a number input
  - Crash data card: nullify a value (e.g. street name) by clearing its input and saving it
  - Related records - units: click field to edit it
  - Related records - people: todo
  - Related records - chargs: todo
  - Change log: change log works normally with details modal. But it is not collapseable (yet).
- Sidebar
  - is exapandable and open/closed state is preserved in localstorage


## Todo

- permissions-based features:
  - side nav
  - field editing
  - etc. see <Can/> component from VZE
- crash details
  - crash injury widgets
  - swap addresses
  - people table
    - name edit component
  - charges table
  - notes
  - recommendations
  - misc column editing + placement
  - Crash map: show coordinates and enable editing by tying into input
  - crash diagram: zoom/tilt control
  - Change log: collapseable
- table
  - advanced filters: test them and add "Other" unit type filter
  - export
  - record counts
- Top nav component
  - app logo
  - navigration crash search
  - profile menu with signout
- locations
- location details
- create crash record
- upload non-cr3
- dashboard
- users
  - user list
  - add/edit/delete uers
  - copy user emails
- login page: make it look nice - also it flashes on the screen on every page load
- versioned localstorage
- error boundary (see Moped's for reference)
- map geocoder (technically an enhancement vis a vis current state)