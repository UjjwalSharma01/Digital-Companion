import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/chat.css"; // Import our chat-specific styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Meri Digital Saheli",
  description: "AI Companion Chat Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: "var(--background-gradient)",
          height: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {children}
      </body>
    </html>
  );
}
