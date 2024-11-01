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

## This app vs VZE

- Create-React-App -> NextJS
- Javascript -> Typescript
- CoreUI + reactstrap -> react-bootstrap
- Apollo Client -> SWR + graphql-request

## Todo

- permission checks
- gridtable
  - search
  - export
- locations
- location details
- create crash record
- upload records
