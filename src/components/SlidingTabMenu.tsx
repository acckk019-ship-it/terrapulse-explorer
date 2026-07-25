import React, { useState } from 'react';
import { EarthVisualMode, LocationPoint, MapEngine, ViewMode, SlidingTabCategory } from '../types';
import { EARTH_LOCATIONS } from '../data/locations';

interface SlidingTabMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: SlidingTabCategory;
  onSelectTab: (tab: SlidingTabCategory) => void;
  selectedLocation: LocationPoint | null;
  onSelectLocation: (loc: LocationPoint) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  visualMode: EarthVisualMode;
  onVisualModeChange: (mode: EarthVisualMode) => void;
  mapEngine: MapEngine;
  onSwitchMapEngine: (engine: MapEngine) => void;
  showClouds: boolean;
  onToggleClouds: () => void;
  showSatellites: boolean;
  onToggleSatellites: () => void;
  rotationSpeed: number;
  onRotationSpeedChange: (speed: number) => void;
}

export const SlidingTabMenu: React.FC<SlidingTabMenuProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onSelectTab,
  selectedLocation,
  onSelectLocation,
  viewMode,
  onViewModeChange,
  visualMode,
  onVisualModeChange,
  mapEngine,
  onSwitchMapEngine,
  showClouds,
  onToggleClouds,
  showSatellites,
  onToggleSatellites,
  rotationSpeed,
  onRotationSpeedChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter locations based on active tab and search query
  const getFilteredLocations = () => {
    return EARTH_LOCATIONS.filter(loc => {
      const matchesSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'tmg_community') return loc.category === 'tmg_community';
      if (activeTab === 'tmg_resort') return loc.category === 'tmg_resort';
      if (activeTab === 'world') {
        return loc.category !== 'tmg_community' && loc.category !== 'tmg_resort';
      }
      return true;
    });
  };

  const filteredLocations = getFilteredLocations();
  const tmgCommunitiesCount = EARTH_LOCATIONS.filter(l => l.category === 'tmg_community').length;
  const tmgResortsCount = EARTH_LOCATIONS.filter(l => l.category === 'tmg_resort').length;
  const worldCount = EARTH_LOCATIONS.filter(l => l.category !== 'tmg_community' && l.category !== 'tmg_resort').length;

  return (
    <>
      {/* Docked Sliding Handle / Button on Left Edge */}
      <div className={`fixed top-24 z-40 transition-all duration-300 ${isOpen ? 'left-80 sm:left-96' : 'left-0'}`}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 bg-[#05070a]/95 hover:bg-[#0f1523] text-[#00ff95] border-y-2 border-r-2 border-[#00ff95] px-3 py-3 shadow-[0_0_20px_rgba(0,255,149,0.3)] backdrop-blur-xl transition-all rounded-r-xl group font-mono font-bold"
          title="Toggle All Projects & Settings Sliding Drawer"
        >
          <span className="text-base group-hover:scale-125 transition-transform">{isOpen ? '⏪' : '📑'}</span>
          <span className="text-xs uppercase tracking-wider hidden sm:inline text-[#e0e7ff] group-hover:text-[#00ff95]">
            {isOpen ? 'CLOSE TABS' : 'ALL TABS & DIRECTORY'}
          </span>
          {!isOpen && (
            <span className="bg-[#00ff95] text-[#05070a] text-[10px] px-1.5 py-0.5 rounded font-black">
              {EARTH_LOCATIONS.length}
            </span>
          )}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 sm:hidden animate-fade-in"
        />
      )}

      {/* The Sliding Tab Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-30 w-80 sm:w-96 bg-[#05070a]/95 border-r-2 border-[#00ff95] shadow-[0_0_40px_rgba(0,255,149,0.25)] backdrop-blur-2xl flex flex-col font-mono text-[#8ea8d0] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1a1f2e] bg-[#030407] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg animate-pulse">🌍</span>
            <div>
              <div className="text-sm font-black text-[#e0e7ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>TMG GEO-ENGINE</span>
                <span className="text-[10px] bg-[#00ff95]/20 text-[#00ff95] px-1 rounded">V2.0</span>
              </div>
              <div className="text-[10px] text-[#4e6a8e]">MASTER SLIDING DIRECTORY</div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded bg-[#0a0d16] hover:bg-[#1a1f2e] border border-[#1a1f2e] text-[#e0e7ff] hover:text-[#00ff95] flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Master Sliding Tabs Bar */}
        <div className="grid grid-cols-6 bg-[#030407] border-b border-[#1a1f2e] p-1 gap-1">
          <button
            onClick={() => { onSelectTab('tmg_community'); setSearchQuery(''); }}
            className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
              activeTab === 'tmg_community'
                ? 'bg-[#00ff95] text-[#05070a] font-black shadow-[0_0_15px_rgba(0,255,149,0.4)]'
                : 'bg-[#0a0d16] text-[#8ea8d0] hover:text-[#e0e7ff] hover:bg-[#141b2d]'
            }`}
            title="TMG Communities & Cities"
          >
            <span className="text-sm">🏛️</span>
            <span className="text-[9px] uppercase leading-tight font-bold">Cities</span>
          </button>

          <button
            onClick={() => { onSelectTab('tmg_resort'); setSearchQuery(''); }}
            className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
              activeTab === 'tmg_resort'
                ? 'bg-[#00f2ff] text-[#05070a] font-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                : 'bg-[#0a0d16] text-[#8ea8d0] hover:text-[#e0e7ff] hover:bg-[#141b2d]'
            }`}
            title="TMG Resorts & Hotels"
          >
            <span className="text-sm">🏝️</span>
            <span className="text-[9px] uppercase leading-tight font-bold">Resorts</span>
          </button>

          <button
            onClick={() => { onSelectTab('world'); setSearchQuery(''); }}
            className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
              activeTab === 'world'
                ? 'bg-[#ff0055] text-white font-black shadow-[0_0_15px_rgba(255,0,85,0.4)]'
                : 'bg-[#0a0d16] text-[#8ea8d0] hover:text-[#e0e7ff] hover:bg-[#141b2d]'
            }`}
            title="World Landmarks & Megacities"
          >
            <span className="text-sm">🌐</span>
            <span className="text-[9px] uppercase leading-tight font-bold">World</span>
          </button>

          <button
            onClick={() => { onSelectTab('atmosphere'); setSearchQuery(''); }}
            className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
              activeTab === 'atmosphere'
                ? 'bg-[#00f2ff] text-[#05070a] font-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                : 'bg-[#0a0d16] text-[#8ea8d0] hover:text-[#e0e7ff] hover:bg-[#141b2d]'
            }`}
            title="Atmospheric Composition"
          >
            <span className="text-sm">💨</span>
            <span className="text-[9px] uppercase leading-tight font-bold">Atm</span>
          </button>

          <button
            onClick={() => { onSelectTab('layers'); setSearchQuery(''); }}
            className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
              activeTab === 'layers'
                ? 'bg-[#ffb000] text-[#05070a] font-black shadow-[0_0_15px_rgba(255,176,0,0.4)]'
                : 'bg-[#0a0d16] text-[#8ea8d0] hover:text-[#e0e7ff] hover:bg-[#141b2d]'
            }`}
            title="Orbital Layers"
          >
            <span className="text-sm">🛰️</span>
            <span className="text-[9px] uppercase leading-tight font-bold">Layers</span>
          </button>

          <button
            onClick={() => { onSelectTab('settings'); setSearchQuery(''); }}
            className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
              activeTab === 'settings'
                ? 'bg-[#e0e7ff] text-[#05070a] font-black shadow-[0_0_15px_rgba(224,231,255,0.4)]'
                : 'bg-[#0a0d16] text-[#8ea8d0] hover:text-[#e0e7ff] hover:bg-[#141b2d]'
            }`}
            title="Map & Globe Visual Settings"
          >
            <span className="text-sm">⚙️</span>
            <span className="text-[9px] uppercase leading-tight font-bold">Set</span>
          </button>
        </div>

        {/* Tab Content Area */}
        {activeTab === 'tmg_community' || activeTab === 'tmg_resort' || activeTab === 'world' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Filter Box */}
            <div className="p-3 border-b border-[#1a1f2e] bg-[#05070a]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#00ff95]">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'tmg_community' ? 'TMG Cities' : activeTab === 'tmg_resort' ? 'TMG Resorts' : 'World Landmarks'}...`}
                  className="w-full bg-[#0a0d16] border border-[#1a1f2e] focus:border-[#00ff95] text-[#e0e7ff] text-xs pl-8 pr-7 py-2 rounded outline-none placeholder-[#4e6a8e] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#4e6a8e] hover:text-[#e0e7ff]"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#4e6a8e] mt-2 px-1 font-bold">
                <span>SHOWING: {filteredLocations.length} PROJECTS</span>
                <span className="text-[#00ff95]">CLICK TO ORBIT/ZOOM</span>
              </div>
            </div>

            {/* Scrollable Project List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-[#1a1f2e]">
              {filteredLocations.length === 0 ? (
                <div className="text-center py-12 text-[#4e6a8e] space-y-2">
                  <div className="text-2xl">🚫</div>
                  <div className="text-xs font-bold">NO PROJECTS MATCH "{searchQuery.toUpperCase()}"</div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] text-[#00ff95] underline hover:text-[#e0e7ff]"
                  >
                    CLEAR SEARCH FILTER
                  </button>
                </div>
              ) : (
                filteredLocations.map(loc => {
                  const isSelected = selectedLocation?.id === loc.id;
                  const isTMG = loc.category === 'tmg_community' || loc.category === 'tmg_resort';
                  const badgeColor =
                    loc.category === 'tmg_community' ? 'bg-[#00ff95]/20 text-[#00ff95] border-[#00ff95]/50' :
                    loc.category === 'tmg_resort' ? 'bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]/50' :
                    'bg-[#ff0055]/20 text-[#ff0055] border-[#ff0055]/50';

                  return (
                    <div
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        if (window.innerWidth < 640) onToggle();
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-[#0a111e] border-[#00ff95] shadow-[0_0_20px_rgba(0,255,149,0.15)] ring-1 ring-[#00ff95]'
                          : 'bg-[#0a0d16]/80 hover:bg-[#121929] border-[#1a1f2e] hover:border-[#00f2ff]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">
                              {loc.category === 'tmg_community' ? '🏛️' : loc.category === 'tmg_resort' ? '🏝️' : loc.category === 'megacity' ? '🏙️' : loc.category === 'wonder' ? '🏔️' : '🔭'}
                            </span>
                            <span className={`text-sm font-black truncate ${isSelected ? 'text-[#00ff95]' : 'text-[#e0e7ff] group-hover:text-[#00f2ff]'}`}>
                              {loc.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8ea8d0] mt-0.5 flex items-center gap-2 font-bold">
                            <span>📍 {loc.country.toUpperCase()}</span>
                            {loc.altitude && <span className="text-[#00f2ff]">• {loc.altitude}</span>}
                          </div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-black shrink-0 ${badgeColor}`}>
                          {loc.category === 'tmg_community' ? 'COMMUNITY' : loc.category === 'tmg_resort' ? 'RESORT' : 'LANDMARK'}
                        </span>
                      </div>

                      <p className="text-xs text-[#8ea8d0] line-clamp-2 leading-relaxed font-sans">
                        {loc.description}
                      </p>

                      {/* Action Buttons inside Card */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#1a1f2e]/60 text-[10px]">
                        <span className="text-[#4e6a8e]">COORDS: {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLocation(loc);
                              onViewModeChange('globe_3d');
                              if (window.innerWidth < 640) onToggle();
                            }}
                            className="bg-[#141b2d] hover:bg-[#00ff95] text-[#8ea8d0] hover:text-[#05070a] px-2 py-1 rounded font-bold transition-colors"
                            title="View on 3D Globe"
                          >
                            🌍 3D GLOBE
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLocation(loc);
                              onViewModeChange('map_2d_3d');
                              if (window.innerWidth < 640) onToggle();
                            }}
                            className="bg-[#141b2d] hover:bg-[#00f2ff] text-[#8ea8d0] hover:text-[#05070a] px-2 py-1 rounded font-bold transition-colors"
                            title="View on Pro Map (2D & 3D)"
                          >
                            🗺️ PRO MAP
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* TAB 4: SETTINGS & CONTROLS */
          <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
            {/* 1. View Mode Switcher */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-[#00ff95] tracking-wider block border-b border-[#1a1f2e] pb-1">
                🖥️ PRIMARY DISPLAY MODE
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onViewModeChange('globe_3d')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                    viewMode === 'globe_3d'
                      ? 'bg-[#00ff95] text-[#05070a] border-[#00ff95] shadow-[0_0_20px_rgba(0,255,149,0.3)]'
                      : 'bg-[#0a0d16] text-[#8ea8d0] border-[#1a1f2e] hover:border-[#00ff95]'
                  }`}
                >
                  <span className="text-xl">🌍</span>
                  <span className="text-xs">3D ORBITAL GLOBE</span>
                </button>
                <button
                  onClick={() => onViewModeChange('map_2d_3d')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                    viewMode === 'map_2d_3d'
                      ? 'bg-[#00f2ff] text-[#05070a] border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.3)]'
                      : 'bg-[#0a0d16] text-[#8ea8d0] border-[#1a1f2e] hover:border-[#00f2ff]'
                  }`}
                >
                  <span className="text-xl">🗺️</span>
                  <span className="text-xs">PRO MAP (2D & 3D)</span>
                </button>
              </div>
            </div>

            {/* 2. Earth Visual Themes (When on Globe) */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-[#00f2ff] tracking-wider block border-b border-[#1a1f2e] pb-1">
                🎨 EARTH PLANETARY TEXTURES
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(['realistic', 'night_lights', 'topographic', 'hologram'] as const).map(mode => {
                  const isActive = visualMode === mode;
                  const label =
                    mode === 'realistic' ? '🛰️ NASA REAL EARTH' :
                    mode === 'night_lights' ? '💡 NIGHT LIGHTS' :
                    mode === 'topographic' ? '⛰️ TOPOGRAPHIC' : '🤖 CYBER HOLOGRAM';
                  return (
                    <button
                      key={mode}
                      onClick={() => onVisualModeChange(mode)}
                      className={`py-2.5 px-3 rounded-lg border text-center font-bold text-xs transition-all ${
                        isActive
                          ? 'bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                          : 'bg-[#0a0d16] text-[#8ea8d0] border-[#1a1f2e] hover:text-[#e0e7ff] hover:border-[#4e6a8e]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Map Engine Switcher (When on Map) */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-[#ff0055] tracking-wider block border-b border-[#1a1f2e] pb-1">
                🗺️ MAP ENGINE SELECTOR
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onSwitchMapEngine('satellite_leaflet')}
                  className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                    mapEngine === 'satellite_leaflet'
                      ? 'bg-[#00ff95]/20 text-[#00ff95] border-[#00ff95] shadow-[0_0_15px_rgba(0,255,149,0.2)]'
                      : 'bg-[#0a0d16] text-[#8ea8d0] border-[#1a1f2e] hover:border-[#00ff95]'
                  }`}
                >
                  🛰️ LEAFLET SATELLITE
                </button>
                <button
                  onClick={() => onSwitchMapEngine('google_maps')}
                  className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                    mapEngine === 'google_maps'
                      ? 'bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                      : 'bg-[#0a0d16] text-[#8ea8d0] border-[#1a1f2e] hover:border-[#00f2ff]'
                  }`}
                >
                  🏙️ GOOGLE PRO (KEY)
                </button>
              </div>
            </div>

            {/* 4. Atmospheric & Orbital Toggles */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-[#e0e7ff] tracking-wider block border-b border-[#1a1f2e] pb-1">
                ☁️ ORBITAL SIMULATION LAYERS
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={onToggleClouds}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-between transition-all ${
                    showClouds
                      ? 'bg-[#00ff95]/20 text-[#00ff95] border-[#00ff95]'
                      : 'bg-[#0a0d16] text-[#4e6a8e] border-[#1a1f2e]'
                  }`}
                >
                  <span>☁️ NASA CLOUD WRAP</span>
                  <span>{showClouds ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={onToggleSatellites}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-between transition-all ${
                    showSatellites
                      ? 'bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]'
                      : 'bg-[#0a0d16] text-[#4e6a8e] border-[#1a1f2e]'
                  }`}
                >
                  <span>🛰️ SATELLITES</span>
                  <span>{showSatellites ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* 5. Rotation Speed Slider */}
            <div className="space-y-2 bg-[#0a0d16] p-3 rounded-xl border border-[#1a1f2e]">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#8ea8d0]">🔄 PLANETARY ROTATION</span>
                <span className="text-[#00ff95]">{rotationSpeed === 0 ? 'PAUSED' : `${rotationSpeed.toFixed(1)}X`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={rotationSpeed}
                onChange={e => onRotationSpeedChange(parseFloat(e.target.value))}
                className="w-full accent-[#00ff95] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#4e6a8e] font-bold">
                <button onClick={() => onRotationSpeedChange(0)} className="hover:text-[#e0e7ff]">PAUSE (0X)</button>
                <button onClick={() => onRotationSpeedChange(1)} className="hover:text-[#e0e7ff]">NORMAL (1X)</button>
                <button onClick={() => onRotationSpeedChange(3)} className="hover:text-[#e0e7ff]">FAST (3X)</button>
              </div>
            </div>

            <div className="p-3 bg-[#00ff95]/10 border border-[#00ff95]/30 rounded-xl text-center">
              <span className="text-xs text-[#00ff95] font-black">✨ ALL TMG PROJECTS INCLUDED</span>
              <p className="text-[10px] text-[#8ea8d0] mt-1 leading-relaxed font-sans">
                Explore all 11 cities & communities and 8 luxury resorts across Egypt and the Mediterranean.
              </p>
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        <div className="p-3 bg-[#030407] border-t border-[#1a1f2e] text-[10px] text-center text-[#4e6a8e] flex items-center justify-between font-bold">
          <span>TALAAT MOUSTAFA GROUP (TMG)</span>
          <span className="text-[#00ff95]">🛰️ LIVE TELEMETRY</span>
        </div>
      </aside>
    </>
  );
};
