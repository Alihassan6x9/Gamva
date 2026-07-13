import "./globals.css";

export const metadata = {
  title: "GAMVA — party games, no sign-in",
  description:
    "Truth or Dare, Never Have I Ever, Would You Rather and more. Create a room, share the code, play on your phones.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f1229",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
