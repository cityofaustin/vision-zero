import "../styles/global.scss";
import AuthProvider from "@/contexts/Auth";
import SidebarLayout from "@/components/SideBarLayout";

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
    // <Html lang="en" style={{fontSize: "14px"}} data-bs-theme="dark">
    <html lang="en" style={{ fontSize: "14px" }}>
      <AuthProvider>
        <body>
          <SidebarLayout>{children}</SidebarLayout>
        </body>
      </AuthProvider>
    </html>
  );
}
