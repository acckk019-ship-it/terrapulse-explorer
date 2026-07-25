/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EarthVisualMode, LocationCategory, LocationPoint, MapEngine, ViewMode, SlidingTabCategory } from './types';
import { EARTH_LOCATIONS } from './data/locations';
import { Globe3D } from './components/Globe3D';
import { MapExplorer } from './components/MapExplorer';
import { HUDControls } from './components/HUDControls';
import { SlidingTabMenu } from './components/SlidingTabMenu';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('globe_3d');
  const [visualMode, setVisualMode] = useState<EarthVisualMode>('realistic');
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(EARTH_LOCATIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [showClouds, setShowClouds] = useState<boolean>(true);
  const [showSatellites, setShowSatellites] = useState<boolean>(true);
  const [mapEngine, setMapEngine] = useState<MapEngine>('satellite_leaflet');
  const [isSlidingTabOpen, setIsSlidingTabOpen] = useState<boolean>(false);
  const [activeSlidingTab, setActiveSlidingTab] = useState<SlidingTabCategory>('tmg_community');

  // Handle zoom to map from Globe or Drawer
  const handleZoomToMap = (loc: LocationPoint) => {
    setSelectedLocation(loc);
    // Give time for Globe3D to zoom in first (it zooms in on setSelectedLocation), 
    // then switch to map view with a smooth transition.
    setTimeout(() => {
      setViewMode('map_2d_3d');
    }, 800); // 800ms for smooth transition
  };

  return (
    <div className="relative w-full h-screen min-h-[650px] bg-[#05070a] text-[#8ea8d0] overflow-hidden select-none font-sans border-4 border-[#1a1f2e] box-border p-2 sm:p-4 flex flex-col">
      {/* Top and Side HUD Controls */}
      <HUDControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        visualMode={visualMode}
        onVisualModeChange={setVisualMode}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSelectLocation={loc => {
          setSelectedLocation(loc);
          if (viewMode === 'map_2d_3d') {
            // Already in map, stay in map
          }
        }}
        selectedLocation={selectedLocation}
        rotationSpeed={rotationSpeed}
        onRotationSpeedChange={setRotationSpeed}
        showClouds={showClouds}
        onToggleClouds={() => setShowClouds(!showClouds)}
        showSatellites={showSatellites}
        onToggleSatellites={() => setShowSatellites(!showSatellites)}
        isSlidingTabOpen={isSlidingTabOpen}
      />

      {/* Master Sliding Tab Drawer for All Tabs & Projects */}
      <SlidingTabMenu
        isOpen={isSlidingTabOpen}
        onToggle={() => setIsSlidingTabOpen(!isSlidingTabOpen)}
        activeTab={activeSlidingTab}
        onSelectTab={setActiveSlidingTab}
        selectedLocation={selectedLocation}
        onSelectLocation={loc => {
          setSelectedLocation(loc);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        visualMode={visualMode}
        onVisualModeChange={setVisualMode}
        mapEngine={mapEngine}
        onSwitchMapEngine={setMapEngine}
        showClouds={showClouds}
        onToggleClouds={() => setShowClouds(!showClouds)}
        showSatellites={showSatellites}
        onToggleSatellites={() => setShowSatellites(!showSatellites)}
        rotationSpeed={rotationSpeed}
        onRotationSpeedChange={setRotationSpeed}
      />

      {/* Main Display: 3D Orbital Globe vs 2D/3D Pro Map Explorer */}
      <main
        onClick={() => {
          if (isSlidingTabOpen && window.innerWidth < 640) {
            setIsSlidingTabOpen(false);
          }
        }}
        className={`flex-1 relative w-full min-h-[450px] overflow-hidden rounded-xl border border-[#1a1f2e] flex flex-col transition-all duration-300 ${isSlidingTabOpen ? 'sm:ml-96 sm:w-[calc(100%-24rem)] cursor-pointer sm:cursor-default' : 'ml-0 w-full'}`}>
        <AnimatePresence mode="wait">
          {viewMode === 'globe_3d' ? (
            <motion.div
              key="globe"
              className="w-full h-full"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3, transition: { duration: 0.8, ease: "easeIn" } }}
            >
              <Globe3D
                visualMode={visualMode}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                onZoomToMap={handleZoomToMap}
                rotationSpeed={rotationSpeed}
                showClouds={showClouds}
                showSatellites={showSatellites}
              />
            </motion.div>
          ) : (
            <motion.div
              key="map"
              className="w-full h-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }}
            >
              <MapExplorer
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                onOrbitBack={() => setViewMode('globe_3d')}
                mapEngine={mapEngine}
                onSwitchEngine={setMapEngine}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
