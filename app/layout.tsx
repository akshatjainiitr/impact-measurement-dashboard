import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImpactLens | NGO Impact Intelligence Platform",
  description:
    "A production-grade impact intelligence dashboard for NGO education outcomes, cost efficiency, data quality, forecasting, and executive insights.",
  applicationName: "ImpactLens"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123f32"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
