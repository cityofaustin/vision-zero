import type { AppProps } from "next/app";
import { Auth0Provider } from "@auth0/auth0-react";
import SidebarLayout from "@/components/SidebarLayout";
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
      authorizationParams={{
        redirect_uri: redirect_uri,
        scope: "openid profile email",
        // our audience ID is the same as our client ID
        // i think this might be because we intially configured
        // this Auth0 app with an SPA GUI wizard
        // -- because this is not normal as far as i can tell
        // audience: CLIENT_ID,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <SidebarLayout>
        <Component {...pageProps} />
      </SidebarLayout>
    </Auth0Provider>
  );
}
