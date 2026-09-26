'use client';
import { useEffect, useRef, useState } from 'react';

const VESSELS = [
  {
    id: 'A', name: 'MV Kaveri Star', mmsi: '419 002 481', type: 'Tanker · IMO 9312410',
    dist: '3.2 km', dt: '+22 min', lat: 13.32, lng: 80.42, color: '#C9433F',
    track: [[13.32, 80.42],[13.28, 80.38],[13.25, 80.35],[13.22, 80.31]],
  },
  {
    id: 'B', name: 'MT Porbandar', mmsi: '419 118 226', type: 'Tanker · IMO 9204471',
    dist: '7.8 km', dt: '−54 min', lat: 13.18, lng: 80.55, color: '#DC8A1F',
    track: [[13.18, 80.55],[13.21, 80.50],[13.24, 80.45],[13.26, 80.40]],
  },
  {
    id: 'C', name: 'MV Coromandel', mmsi: '419 004 733', type: 'Bulk carrier · IMO 9118820',
    dist: '11.4 km', dt: '+3h 10m', lat: 13.45, lng: 80.38, color: '#6E7F92',
    track: [[13.45, 80.38],[13.40, 80.40],[13.36, 80.42],[13.30, 80.44]],
  },
];

const SLICK_CENTER = [13.22, 80.46];

export default function OceanMap({ selected, results, onSelectVessel, showLayers }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({});
  const tracksRef = useRef({});
  const slickRef = useRef(null);
  const probRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || leafletRef.current) return;

    import('leaflet').then(L => {
      // Guard: destroy existing map if container already initialized
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }
      const map = L.map(mapRef.current, {
        center: [13.25, 80.42],
        zoom: 10,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      leafletRef.current = map;

      // ── Slick polygon ──
      if (showLayers?.slick !== false) {
        slickRef.current = L.polygon([
          [13.215, 80.450], [13.222, 80.438], [13.232, 80.432],
          [13.238, 80.440], [13.235, 80.455], [13.225, 80.462],
        ], {
          color: 'rgba(14,165,183,0.9)', weight: 2,
          fillColor: 'rgba(11,37,69,0.7)', fillOpacity: 0.8,
        }).addTo(map);
        slickRef.current.bindTooltip('<b>Observed Slick</b><br>4.6 km × 1.1 km · conf. 0.91', { className: 'leaflet-tooltip-dark' });
      }

      // ── Probability heatmap circles ──
      if (showLayers?.prob !== false) {
        [
          { lat: 13.29, lng: 80.40, r: 28000, op: 0.10, color: '#DC8A1F' },
          { lat: 13.28, lng: 80.39, r: 18000, op: 0.16, color: '#DC8A1F' },
          { lat: 13.27, lng: 80.38, r: 10000, op: 0.22, color: '#C9433F' },
          { lat: 13.26, lng: 80.37, r: 5000, op: 0.28, color: '#C9433F' },
        ].forEach(c => {
          L.circle([c.lat, c.lng], {
            radius: c.r, color: 'transparent',
            fillColor: c.color, fillOpacity: c.op,
          }).addTo(map);
        });
      }

      // ── Vessel markers + tracks ──
      VESSELS.forEach(v => {
        if (showLayers?.ais !== false) {
          const polyline = L.polyline(v.track, {
            color: v.color, weight: 2.5,
            dashArray: v.id === 'B' ? '6 8' : v.id === 'C' ? '3 8' : null,
            opacity: 0.85,
          }).addTo(map);
          tracksRef.current[v.id] = polyline;
        }

        const icon = L.divIcon({
          html: `<div style="
            width:14px;height:14px;border-radius:50%;
            background:${v.color};border:2.5px solid white;
            box-shadow:0 0 10px ${v.color};
          "></div>`,
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
        });

        const marker = L.marker([v.lat, v.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px;">
            <div style="font-weight:800;font-size:13px;margin-bottom:4px;">${v.name}</div>
            <div style="font-size:11px;color:#666;font-family:monospace;margin-bottom:8px;">MMSI ${v.mmsi}</div>
            <div style="font-size:11.5px;color:#444;">${v.type}</div>
            <div style="margin-top:8px;display:flex;gap:10px;font-size:11px;color:#555;">
              <span>Dist: <b>${v.dist}</b></span>
              <span>Δt: <b>${v.dt}</b></span>
            </div>
          </div>
        `);
        marker.on('click', () => onSelectVessel && onSelectVessel(v.id));
        markersRef.current[v.id] = marker;
      });

      // Style for tooltips
      const style = document.createElement('style');
      style.textContent = `.leaflet-tooltip-dark{background:#0F1A2B;border:1px solid #1C2D42;color:#EAF0F6;font-family:Inter,sans-serif;font-size:12px;padding:8px 12px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.4);}
      .leaflet-tooltip-dark::before{border-top-color:#1C2D42 !important;}`;
      document.head.appendChild(style);
    });

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Update marker opacity on selection
  useEffect(() => {
    if (!leafletRef.current) return;
    import('leaflet').then(L => {
      VESSELS.forEach(v => {
        const m = markersRef.current[v.id];
        if (!m) return;
        const opacity = v.id === selected ? 1 : 0.35;
        m.setOpacity(opacity);
        const t = tracksRef.current[v.id];
        if (t) t.setStyle({ opacity: opacity });
      });
    });
  }, [selected]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {/* Map legend overlay */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '20px', zIndex: 500,
        background: 'rgba(15,26,43,0.92)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--line)', borderRadius: '10px',
        padding: '12px 14px', minWidth: '160px',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Legend</div>
        {[
          { color: 'rgba(11,37,69,0.85)', border: 'rgba(14,165,183,0.9)', label: 'Observed slick' },
          { color: '#DC8A1F', label: 'Source probability' },
          { color: '#C9433F', label: 'Strong candidate' },
          { color: '#DC8A1F', label: 'Plausible', dash: true },
          { color: '#6E7F92', label: 'Ruled-out track', dash: true },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--ink-soft)', padding: '2px 0' }}>
            <div style={{
              width: item.label === 'Observed slick' ? '14px' : '14px',
              height: item.label === 'Observed slick' ? '10px' : '2px',
              borderRadius: item.label === 'Observed slick' ? '2px' : '0',
              background: item.color,
              border: item.border ? `1px solid ${item.border}` : 'none',
              borderTop: item.dash ? '2px dashed' : undefined,
              borderTopColor: item.dash ? item.color : undefined,
              flexShrink: 0,
            }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
