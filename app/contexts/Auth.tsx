"use client";
import { Auth0Provider } from "@auth0/auth0-react";

const DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN!;
const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!;

/**
 * Client-side wrapper for the Auth0Provider
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const redirect_uri =
    (typeof window !== "undefined" && window.location.origin) || undefined;

  return (
    <Auth0Provider
      domain={DOMAIN}
      clientId={CLIENT_ID}
      authorizationParams={{
        redirect_uri: redirect_uri || "",
        scope: "openid profile email",
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
