import './globals.css';

export const metadata = {
  title: 'OCEORIGIN — Marine Oil Spill Intelligence',
  description: 'AI-powered satellite SAR analysis, Lagrangian transport simulation, and source attribution for marine oil spill investigations.',
  keywords: 'oil spill, SAR, satellite, ocean, attribution, marine pollution, Lagrangian transport',
  openGraph: {
    title: 'OCEORIGIN',
    description: 'Marine Oil Spill Intelligence Platform',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
