import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "AmbroseOvienlonbaTV - Christian Broadcasting",
  description: "AmbroseOvienlonbaTV - Christian Broadcasting Network. Watch sermons, gospel music, live events, and more.",
  keywords: ["Christian TV", "Gospel", "Sermons", "Christian Broadcasting", "Religious Content"],
  authors: [{ name: "AmbroseOvienlonbaTV" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
