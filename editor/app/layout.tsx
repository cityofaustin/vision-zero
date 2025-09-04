import "../styles/global.scss";
import { Metadata } from "next";
import AuthProvider from "@/contexts/Auth";
import SidebarLayout from "@/components/SidebarLayout";
import { AppThemeProvider } from "@/contexts/AppThemeProvider";

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
    <html lang="en" style={{ fontSize: "14px" }}>
      <AuthProvider>
        <AppThemeProvider>
          <body>
            <SidebarLayout>{children}</SidebarLayout>
          </body>
        </AppThemeProvider>
      </AuthProvider>
    </html>
  );
}
