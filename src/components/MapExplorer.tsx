import React, { useEffect, useState } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, useMap as useGoogleMap } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, useMap as useLeafletMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationPoint, MapEngine } from '../types';
import { EARTH_LOCATIONS } from '../data/locations';

// Ensure Leaflet icons work nicely
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapExplorerProps {
  selectedLocation: LocationPoint | null;
  onSelectLocation: (loc: LocationPoint) => void;
  onOrbitBack: () => void;
  mapEngine: MapEngine;
  onSwitchEngine: (engine: MapEngine) => void;
}

// Helper component to center Leaflet map when location changes
const LeafletCenterController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useLeafletMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Helper component to center Google map when location changes
const GoogleMapCenterController: React.FC<{ center: { lat: number; lng: number }; zoom: number }> = ({ center, zoom }) => {
  const map = useGoogleMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const MapExplorer: React.FC<MapExplorerProps> = ({
  selectedLocation,
  onSelectLocation,
  onOrbitBack,
  mapEngine,
  onSwitchEngine
}) => {
  const [mapTypeId, setMapTypeId] = useState<'hybrid' | 'roadmap' | 'satellite' | 'terrain'>('hybrid');
  const [tileSource, setTileSource] = useState<'esri_satellite' | 'osm_street' | 'carto_dark'>('esri_satellite');
  const [showDirectory, setShowDirectory] = useState(false);
  const [projectFilter, setProjectFilter] = useState<'all' | 'tmg_community' | 'tmg_resort'>('all');

  // Load Leaflet CSS dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  const centerLat = selectedLocation?.lat ?? 20.0;
  const centerLng = selectedLocation?.lng ?? 0.0;
  const zoomLevel = selectedLocation ? 14 : 3;

  // Render Google Maps Pro mode
  const renderGoogleMap = () => {
    if (!hasValidKey) {
      // Automatically fall back to high-res Satellite & Street Map mode without throwing an error
      return (
        <div className="relative w-full h-full">
          {renderLeafletMap()}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#05070a]/90 border border-[#00f2ff]/50 text-[#00f2ff] px-4 py-2 rounded-full text-xs font-mono shadow-[0_0_20px_rgba(0,242,255,0.2)] backdrop-blur-md flex items-center gap-2 pointer-events-auto">
            <span>🛰️ Using High-Res Satellite Engine</span>
            <span className="text-[#8ea8d0] text-[10px]">(Add GOOGLE_MAPS_PLATFORM_KEY in Settings for 3D Google Buildings)</span>
            <button
              onClick={() => onSwitchEngine('satellite_leaflet')}
              className="ml-2 bg-[#00f2ff] text-[#05070a] px-2 py-0.5 rounded font-bold text-[10px] hover:bg-[#00ff95] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      );
    }

    return (
      <APIProvider apiKey={API_KEY} version="weekly">
        <GoogleMap
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={zoomLevel}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapTypeId}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
        >
          <GoogleMapCenterController center={{ lat: centerLat, lng: centerLng }} zoom={zoomLevel} />
          {EARTH_LOCATIONS.map(loc => (
            <AdvancedMarker
              key={loc.id}
              position={{ lat: loc.lat, lng: loc.lng }}
              title={loc.name}
              onClick={() => onSelectLocation(loc)}
            >
              <Pin
                background={
                  loc.category === 'megacity' ? '#ffa000' :
                  loc.category === 'tmg_community' ? '#00ff95' :
                  loc.category === 'tmg_resort' ? '#00f2ff' :
                  loc.category === 'wonder' ? '#00e676' :
                  loc.category === 'extreme' ? '#ff1744' : '#00bcd4'
                }
                glyphColor="#fff"
                scale={selectedLocation?.id === loc.id ? 1.4 : 1.0}
              />
            </AdvancedMarker>
          ))}
          {selectedLocation && (
            <AdvancedMarker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
              <Pin background="#ff1744" glyphColor="#ffffff" scale={1.5} />
            </AdvancedMarker>
          )}
        </GoogleMap>
      </APIProvider>
    );
  };

  // Render Leaflet Satellite & Street Map mode
  const renderLeafletMap = () => {
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    if (tileSource === 'osm_street') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    } else if (tileSource === 'carto_dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    }

    return (
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoomLevel}
        style={{ width: '100%', height: '100%', background: '#0a0f1d' }}
      >
        <LeafletCenterController center={[centerLat, centerLng]} zoom={zoomLevel} />
        <TileLayer url={tileUrl} attribution={attribution} maxZoom={19} />
        {EARTH_LOCATIONS.map(loc => (
          <LeafletMarker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            eventHandlers={{
              click: () => onSelectLocation(loc)
            }}
          >
            <LeafletPopup>
              <div className="font-sans p-1">
                <div className="font-bold text-slate-900 text-sm">{loc.name}</div>
                <div className="text-xs text-slate-600 mb-1">{loc.country}</div>
                <div className="text-xs bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-medium inline-block uppercase">
                  {loc.category.replace('_', ' ')}
                </div>
              </div>
            </LeafletPopup>
          </LeafletMarker>
        ))}
        {selectedLocation && (
          <LeafletMarker position={[selectedLocation.lat, selectedLocation.lng]}>
            <LeafletPopup>
              <div className="font-bold text-red-600 text-sm">📍 {selectedLocation.name}</div>
            </LeafletPopup>
          </LeafletMarker>
        )}
      </MapContainer>
    );
  };

  return (
    <div className="relative w-full h-full flex-1 min-h-[450px] bg-[#05070a] border border-[#1a1f2e] overflow-hidden">
      {/* The Map Engine Render */}
      {mapEngine === 'google_maps' ? renderGoogleMap() : renderLeafletMap()}

      {/* Top Floating Map Controls HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none font-mono">
        {/* Left: Return to Orbit & TMG Projects Directory Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onOrbitBack}
            className="flex items-center gap-2 px-3 py-2 bg-[#0a0d16] hover:bg-[#1a1f2e] text-[#00f2ff] font-bold text-[11px] uppercase tracking-widest border border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all"
          >
            <span className="text-sm animate-pulse">🌍</span>
            <span>// RETURN TO ORBIT</span>
          </button>
          <button
            onClick={() => setShowDirectory(!showDirectory)}
            className={`flex items-center gap-2 px-3 py-2 bg-[#0a0d16] hover:bg-[#1a1f2e] font-bold text-[11px] uppercase tracking-widest border transition-all ${
              showDirectory
                ? 'border-[#00ff95] text-[#00ff95] shadow-[0_0_15px_rgba(0,255,149,0.2)]'
                : 'border-[#4e6a8e] text-[#8ea8d0] hover:text-[#00ff95] hover:border-[#00ff95]'
            }`}
            title="Toggle TMG Projects Directory Panel"
          >
            <span>📁</span>
            <span>// TMG PROJECTS ({EARTH_LOCATIONS.length})</span>
            <span className="text-[9px] bg-[#00ff95]/20 text-[#00ff95] px-1.5 py-0.5 ml-0.5 font-mono">EZ JUMP</span>
          </button>
        </div>

        {/* Right: Map Layer Switchers */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#0a0d16] p-1 border border-[#1a1f2e]">
          {mapEngine === 'google_maps' ? (
            <>
              {(['hybrid', 'roadmap', 'satellite', 'terrain'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setMapTypeId(type)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    mapTypeId === type
                      ? 'bg-[#00f2ff] text-[#05070a]'
                      : 'text-[#8ea8d0] hover:text-[#00f2ff] hover:bg-[#1a1f2e]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                onClick={() => setTileSource('esri_satellite')}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  tileSource === 'esri_satellite'
                    ? 'bg-[#00f2ff] text-[#05070a]'
                    : 'text-[#8ea8d0] hover:text-[#00f2ff] hover:bg-[#1a1f2e]'
                }`}
              >
                <span>🛰️</span>
                <span>SATELLITE PRO</span>
              </button>
              <button
                onClick={() => setTileSource('osm_street')}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  tileSource === 'osm_street'
                    ? 'bg-[#00f2ff] text-[#05070a]'
                    : 'text-[#8ea8d0] hover:text-[#00f2ff] hover:bg-[#1a1f2e]'
                }`}
              >
                <span>🛣️</span>
                <span>STREET</span>
              </button>
              <button
                onClick={() => setTileSource('carto_dark')}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  tileSource === 'carto_dark'
                    ? 'bg-[#00f2ff] text-[#05070a]'
                    : 'text-[#8ea8d0] hover:text-[#00f2ff] hover:bg-[#1a1f2e]'
                }`}
              >
                <span>🌌</span>
                <span>CYBER DARK</span>
              </button>
            </>
          )}

          <div className="w-px h-5 bg-[#1a1f2e] mx-1" />

          {/* Engine Toggle */}
          <button
            onClick={() => onSwitchEngine(mapEngine === 'google_maps' ? 'satellite_leaflet' : 'google_maps')}
            className="px-2 py-1 bg-[#05070a] hover:bg-[#1a1f2e] text-[#00ff95] text-[10px] font-mono uppercase tracking-wider border border-[#1a1f2e] flex items-center gap-1"
            title="Switch between Google Maps API and Instant Satellite mode"
          >
            <span>{mapEngine === 'google_maps' ? '⚡ ZERO-KEY SATELLITE' : '📍 GOOGLE MAPS PRO'}</span>
          </button>
        </div>
      </div>

      {/* Bottom info strip */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none max-w-md bg-[#0a0d16] border-2 border-[#00f2ff] p-4 shadow-[0_0_20px_rgba(0,242,255,0.2)] text-[#e0e7ff] font-mono">
          <div className="text-[10px] uppercase tracking-widest text-[#00f2ff] font-bold mb-1">ACTIVE MAP TARGET // TELEMETRY</div>
          <div className="text-lg font-black tracking-tight text-[#e0e7ff] uppercase">{selectedLocation.name}</div>
          <div className="text-xs text-[#8ea8d0] mt-1 font-sans leading-relaxed">{selectedLocation.description}</div>
          <div className="mt-2 text-[11px] font-mono text-[#00ff95] bg-[#05070a] px-2 py-1 border border-[#1a1f2e] inline-block">
            LAT: {selectedLocation.lat.toFixed(4)}° // LNG: {selectedLocation.lng.toFixed(4)}° | ALT: {selectedLocation.altitude || 'SEA LEVEL'}
          </div>
        </div>
      )}

      {/* TMG Projects Directory Sidebar inside Pro Map */}
      {showDirectory && (
        <div className="absolute top-16 right-4 z-20 w-80 max-h-[calc(100vh-100px)] flex flex-col bg-[#0a0d16]/95 border-2 border-[#00ff95] shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl text-[#8ea8d0] font-mono overflow-hidden transition-all">
          <div className="flex items-center justify-between p-3 border-b border-[#1a1f2e] bg-[#05070a]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#00ff95] animate-pulse">🏛️</span>
              <span className="text-xs font-black text-[#e0e7ff] uppercase tracking-wider">TMG PROJECTS DIRECTORY</span>
            </div>
            <button
              onClick={() => setShowDirectory(false)}
              className="text-[#4e6a8e] hover:text-[#e0e7ff] bg-[#0a0d16] border border-[#1a1f2e] px-2 py-0.5 text-xs font-bold transition-colors"
              title="Close Directory"
            >
              [X]
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 p-2 bg-[#05070a] border-b border-[#1a1f2e] text-[10px]">
            {(['all', 'tmg_community', 'tmg_resort'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setProjectFilter(tab)}
                className={`flex-1 py-1 font-bold uppercase transition-all ${
                  projectFilter === tab
                    ? 'bg-[#00ff95] text-[#05070a]'
                    : 'bg-[#0a0d16] text-[#8ea8d0] hover:text-[#e0e7ff] border border-[#1a1f2e]'
                }`}
              >
                {tab === 'all' ? '🌐 All (19)' : tab === 'tmg_community' ? '🏛️ Cities' : '🏝️ Resorts'}
              </button>
            ))}
          </div>

          {/* Project List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-[#1a1f2e]">
            {EARTH_LOCATIONS.filter(loc => projectFilter === 'all' ? true : loc.category === projectFilter).map(loc => {
              const isSelected = selectedLocation?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`w-full text-left p-2.5 transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[#00ff95]/15 border-[#00ff95] text-[#e0e7ff] shadow-[0_0_10px_rgba(0,255,149,0.15)]'
                      : 'bg-[#05070a]/80 hover:bg-[#0a0d16] border-[#1a1f2e] text-[#8ea8d0] hover:border-[#00f2ff]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{loc.category === 'tmg_community' ? '🏛️' : '🏝️'}</span>
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#00ff95]' : 'text-[#e0e7ff]'}`}>
                        {loc.name.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#4e6a8e] mt-0.5 flex items-center gap-2 truncate">
                      <span>{loc.country.toUpperCase()}</span>
                      <span>|</span>
                      <span className="text-[#00f2ff]">{loc.category === 'tmg_community' ? 'COMMUNITY' : 'RESORT'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#00ff95] font-bold">&gt;&gt;</span>
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-[#1a1f2e] bg-[#05070a] text-[10px] text-[#00ff95] text-center font-mono font-bold">
            ⚡ CLICK ANY PROJECT TO INSTANT-ZOOM
          </div>
        </div>
      )}
    </div>
  );
};
