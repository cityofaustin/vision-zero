import type { AppProps } from "next/app";
import { Auth0Provider } from "@auth0/auth0-react";
import "@/styles/global.scss";

const DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN!;
const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!;
let redirect_uri: string | undefined;

export default function App({ Component, pageProps }: AppProps) {
  if (typeof window !== "undefined") {
    redirect_uri = window.location.origin;
  }
  return (
    <Auth0Provider
      domain={DOMAIN}
      clientId={CLIENT_ID}
      authorizationParams={{ redirect_uri: redirect_uri }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}
