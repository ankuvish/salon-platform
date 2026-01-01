import type { Metadata, Viewport } from "next";
import "./globals.css";
import ErrorReporter from "@/components/ErrorReporter";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SalonBook - Discover & Book Your Perfect Salon",
  description: "Reduce wait times by booking appointments at top-rated salons with real-time availability",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className="antialiased touch-manipulation">
        <ErrorReporter />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}