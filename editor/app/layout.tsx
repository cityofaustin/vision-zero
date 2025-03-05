import "../styles/global.scss";
import { Metadata } from "next";
import AuthProvider from "@/contexts/Auth";
import SidebarLayout from "@/components/SidebarLayout";
import EnvironmentBanner from "@/components/EnvironmentBanner";

export const metadata: Metadata = {
  title: "Vision Zero Editor",
  description: "Austin's crash data management platform",
  authors: [
    {
      name: "Austin Transportation & Public Works Data & Technology Services",
      url: "https://austinmobility.io/",
    },
  ],
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.ico`,
  },
  keywords: ["Vision Zero", "Austin", "City of Austin", "Safety", "Civic Tech"],
};

/**
 * The root layout for the whole app
 *
 * todo: metadata
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <html lang="en" style={{fontSize: "14px"}} data-bs-theme="dark">
    <html lang="en" style={{ fontSize: "14px" }}>
      <AuthProvider>
        <body>
          <EnvironmentBanner />
          <SidebarLayout>{children}</SidebarLayout>
        </body>
      </AuthProvider>
    </html>
  );
}
