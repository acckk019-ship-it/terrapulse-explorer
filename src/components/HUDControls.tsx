import React, { useState } from 'react';
import { EarthVisualMode, LocationCategory, LocationPoint, ViewMode } from '../types';
import { EARTH_LOCATIONS } from '../data/locations';

interface HUDControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  visualMode: EarthVisualMode;
  onVisualModeChange: (mode: EarthVisualMode) => void;
  selectedCategory: LocationCategory | 'all';
  onCategoryChange: (cat: LocationCategory | 'all') => void;
  onSelectLocation: (loc: LocationPoint) => void;
  selectedLocation: LocationPoint | null;
  rotationSpeed: number;
  onRotationSpeedChange: (speed: number) => void;
  showClouds: boolean;
  onToggleClouds: () => void;
  showSatellites: boolean;
  onToggleSatellites: () => void;
  isSlidingTabOpen?: boolean;
}

export const HUDControls: React.FC<HUDControlsProps> = ({
  viewMode,
  onViewModeChange,
  visualMode,
  onVisualModeChange,
  selectedCategory,
  onCategoryChange,
  onSelectLocation,
  selectedLocation,
  rotationSpeed,
  onRotationSpeedChange,
  showClouds,
  onToggleClouds,
  showSatellites,
  onToggleSatellites,
  isSlidingTabOpen = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredLocations = EARTH_LOCATIONS.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || loc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });


  return (
    <>
      {/* Top Main Technical Navigation Bar */}
      <header className="z-20 flex flex-wrap items-center justify-between border-b border-[#1a1f2e] pb-3 mb-3 gap-3 shrink-0 pointer-events-auto bg-[#05070a] text-[#8ea8d0] font-sans">
        {/* Left: Brand Logo, System Status & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-[#00f2ff]">🪐</span>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-[#00f2ff] uppercase font-mono">
                Terra-OS v4.2
              </h1>
              <div className="text-[9px] uppercase font-mono tracking-widest text-[#4e6a8e] font-bold">Orbital Studio Pro</div>
            </div>
          </div>

          <div className="h-7 w-px bg-[#1a1f2e] hidden sm:block" />

          <div className="hidden md:flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-[#4e6a8e] font-bold">System Status</span>
            <span className="text-[11px] font-mono text-[#00ff95] font-bold">CONNECTED / ORBITAL_SYNC_ACTIVE</span>
          </div>

          <div className="h-7 w-px bg-[#1a1f2e] hidden sm:block" />

          {/* View Switcher Pills */}
          <div className="flex bg-[#0a0d16] p-1 border border-[#1a1f2e]">
            <button
              onClick={() => onViewModeChange('globe_3d')}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                viewMode === 'globe_3d'
                  ? 'bg-[#00f2ff] text-[#05070a] shadow-[0_0_10px_rgba(0,242,255,0.3)] font-black'
                  : 'text-[#8ea8d0] hover:text-[#00f2ff] hover:bg-[#1a1f2e]'
              }`}
            >
              <span>🌍</span>
              <span>3D Orbital</span>
            </button>
            <button
              onClick={() => onViewModeChange('map_2d_3d')}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                viewMode === 'map_2d_3d'
                  ? 'bg-[#00f2ff] text-[#05070a] shadow-[0_0_10px_rgba(0,242,255,0.3)] font-black'
                  : 'text-[#8ea8d0] hover:text-[#00f2ff] hover:bg-[#1a1f2e]'
              }`}
            >
              <span>🗺️</span>
              <span>Pro Map</span>
            </button>
          </div>
        </div>

        {/* Right HUD Controls: Coordinate Telemetry, Visual Theme & Ask Gemini */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Telemetry Coordinate Readouts */}
          <div className="hidden xl:flex items-center space-x-6 font-mono text-[11px] border-r border-[#1a1f2e] pr-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-[#4e6a8e] font-bold">LATITUDE</span>
              <span className="text-[#e0e7ff] font-bold">{selectedLocation ? `${selectedLocation.lat.toFixed(4)}°` : '34.0522° N'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-[#4e6a8e] font-bold">LONGITUDE</span>
              <span className="text-[#e0e7ff] font-bold">{selectedLocation ? `${selectedLocation.lng.toFixed(4)}°` : '118.2437° W'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-[#4e6a8e] font-bold">ALTITUDE</span>
              <span className="text-[#00ff95] font-bold">{selectedLocation?.altitude || '35,786 KM'}</span>
            </div>
          </div>


        </div>
      </header>


    </>
  );
};
