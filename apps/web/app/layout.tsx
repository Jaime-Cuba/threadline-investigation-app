import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Threadline Investigation",
  description: "A clear, source-linked customer investigation brief.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
