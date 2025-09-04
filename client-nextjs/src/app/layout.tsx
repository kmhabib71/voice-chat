import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Voice Assistant - Intelligent Conversation Companion",
  description: "Experience seamless voice and text conversations with our advanced AI assistant. Real-time responses, emotional intelligence, and memory-enhanced interactions.",
  keywords: ["AI voice assistant", "conversational AI", "voice chat", "intelligent assistant", "real-time chat"],
  authors: [{ name: "AI Girlfriend Project" }],
  openGraph: {
    title: "AI Voice Assistant - Intelligent Conversation Companion",
    description: "Experience seamless voice and text conversations with our advanced AI assistant.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="http://localhost:3002" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
