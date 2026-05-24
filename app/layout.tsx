import type { Metadata } from "next";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import Providers from "@/components/layout/Providers";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Factory OOP",
  description: "Smart Factory OOP — OOP Lab & Factory Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body>
        <Providers>
          <SidebarProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AppHeader />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
