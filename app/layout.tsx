import "./globals.css";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const pingFangFont = localFont({
  src: [
    {
      path: "./assets/fonts/PingFang ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./assets/fonts/PingFang Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./assets/fonts/PingFang Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./assets/fonts/PingFang Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./assets/fonts/PingFang Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./assets/fonts/PingFang Heavy.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("antialiased h-screen", pingFangFont.className)}>
        {children}
      </body>
    </html>
  );
}
