import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Workflow Designer | FlowDesigner Studio",
  description:
    "Visual HR workflow designer — drag-and-drop workflow builder for onboarding, leave approval, document verification, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }} suppressHydrationWarning>
      <body
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
