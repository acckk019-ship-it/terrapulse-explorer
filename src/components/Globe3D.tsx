import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EarthVisualMode, LocationPoint } from '../types';
import { EARTH_LOCATIONS } from '../data/locations';

interface Globe3DProps {
  visualMode: EarthVisualMode;
  selectedLocation: LocationPoint | null;
  onSelectLocation: (loc: LocationPoint) => void;
  onZoomToMap: (loc: LocationPoint) => void;
  rotationSpeed: number;
  showClouds: boolean;
  showSatellites: boolean;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  visualMode,
  selectedLocation,
  onSelectLocation,
  onZoomToMap,
  rotationSpeed,
  showClouds,
  showSatellites
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const satellitesGroupRef = useRef<THREE.Group | null>(null);
  const beaconsGroupRef = useRef<THREE.Group | null>(null);
  const texturesRef = useRef<{ [key: string]: THREE.Texture }>({});
  const currentVisualModeRef = useRef(visualMode);

  useEffect(() => {
    currentVisualModeRef.current = visualMode;
  }, [visualMode]);

  // Interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.2, y: -0.5 });
  const currentRotationRef = useRef({ x: 0.2, y: -0.5 });
  const targetZoomRef = useRef(14);
  const currentZoomRef = useRef(14);

  const [hoveredLocation, setHoveredLocation] = useState<LocationPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate procedural ultra-high-definition textures for instant, bulletproof rendering
  const createProceduralTextures = () => {
    // 1. Realistic Blue Marble Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Ocean gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#051833');
    oceanGrad.addColorStop(0.5, '#0A2B5C');
    oceanGrad.addColorStop(1, '#051833');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Draw stylized continents / landmasses with noise-like patterns
    ctx.fillStyle = '#1A5336';
    ctx.strokeStyle = '#236E48';
    ctx.lineWidth = 4;

    // Helper to draw continent masses
    const drawLandmass = (cx: number, cy: number, rx: number, ry: number, points: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = rx * (0.6 + Math.sin(i * 3) * 0.2 + Math.cos(i * 5) * 0.2);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * ry * (0.7 + Math.sin(i * 2) * 0.3);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // North America
    drawLandmass(450, 320, 220, 160, 24, '#1E633F');
    // South America
    drawLandmass(620, 650, 160, 240, 20, '#247A4D');
    // Europe
    drawLandmass(1020, 280, 140, 100, 18, '#2B8053');
    // Africa
    drawLandmass(1080, 520, 190, 220, 22, '#8C7A3E'); // Desert & savanna
    // Asia
    drawLandmass(1450, 340, 320, 210, 28, '#226943');
    // Australia
    drawLandmass(1700, 720, 150, 120, 16, '#9E5B2B'); // Outback brown
    // Antarctica
    ctx.fillStyle = '#E8F1F5';
    ctx.fillRect(0, 920, 2048, 104);
    // Arctic ice
    ctx.fillRect(0, 0, 2048, 60);

    const realisticTex = new THREE.CanvasTexture(canvas);
    realisticTex.wrapS = THREE.RepeatWrapping;
    realisticTex.wrapT = THREE.ClampToEdgeWrapping;
    realisticTex.colorSpace = THREE.SRGBColorSpace;

    // 2. Night Lights Texture
    const nightCanvas = document.createElement('canvas');
    nightCanvas.width = 2048;
    nightCanvas.height = 1024;
    const nCtx = nightCanvas.getContext('2d')!;
    nCtx.fillStyle = '#020611';
    nCtx.fillRect(0, 0, 2048, 1024);

    // Draw glowing city light clusters
    EARTH_LOCATIONS.forEach(loc => {
      const x = ((loc.lng + 180) / 360) * 2048;
      const y = ((90 - loc.lat) / 180) * 1024;
      const radius = (loc.category === 'megacity' || loc.category === 'tmg_community') ? 35 : loc.category === 'tmg_resort' ? 28 : 18;
      const grad = nCtx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, '#FFDA73');
      grad.addColorStop(1, 'rgba(255, 160, 50, 0)');
      nCtx.fillStyle = grad;
      nCtx.beginPath();
      nCtx.arc(x, y, radius, 0, Math.PI * 2);
      nCtx.fill();
    });

    const nightTex = new THREE.CanvasTexture(nightCanvas);
    nightTex.wrapS = THREE.RepeatWrapping;
    nightTex.colorSpace = THREE.SRGBColorSpace;

    // 3. Topographic Texture
    const topoCanvas = document.createElement('canvas');
    topoCanvas.width = 2048;
    topoCanvas.height = 1024;
    const tCtx = topoCanvas.getContext('2d')!;
    tCtx.fillStyle = '#1A1A1A';
    tCtx.fillRect(0, 0, 2048, 1024);
    // Add relief contour lines
    tCtx.strokeStyle = '#404040';
    tCtx.lineWidth = 1;
    for (let y = 0; y < 1024; y += 24) {
      tCtx.beginPath();
      tCtx.moveTo(0, y);
      for (let x = 0; x <= 2048; x += 64) {
        tCtx.lineTo(x, y + Math.sin(x * 0.01 + y * 0.05) * 12);
      }
      tCtx.stroke();
    }
    const topoTex = new THREE.CanvasTexture(topoCanvas);
    topoTex.wrapS = THREE.RepeatWrapping;
    topoTex.colorSpace = THREE.SRGBColorSpace;

    // 4. Cyber Hologram Texture
    const cyberCanvas = document.createElement('canvas');
    cyberCanvas.width = 2048;
    cyberCanvas.height = 1024;
    const cCtx = cyberCanvas.getContext('2d')!;
    cCtx.fillStyle = '#010A14';
    cCtx.fillRect(0, 0, 2048, 1024);
    cCtx.strokeStyle = '#00F0FF';
    cCtx.lineWidth = 1.5;
    cCtx.globalAlpha = 0.3;
    for (let x = 0; x < 2048; x += 64) {
      cCtx.beginPath(); cCtx.moveTo(x, 0); cCtx.lineTo(x, 1024); cCtx.stroke();
    }
    for (let y = 0; y < 1024; y += 64) {
      cCtx.beginPath(); cCtx.moveTo(0, y); cCtx.lineTo(2048, y); cCtx.stroke();
    }
    const cyberTex = new THREE.CanvasTexture(cyberCanvas);
    cyberTex.wrapS = THREE.RepeatWrapping;
    cyberTex.colorSpace = THREE.SRGBColorSpace;

    // 5. Cloud texture
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 2048;
    cloudCanvas.height = 1024;
    const clCtx = cloudCanvas.getContext('2d')!;
    clCtx.clearRect(0, 0, 2048, 1024);
    clCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 120; i++) {
      const cx = Math.random() * 2048;
      const cy = Math.random() * 1024;
      const r = 40 + Math.random() * 120;
      clCtx.beginPath();
      clCtx.arc(cx, cy, r, 0, Math.PI * 2);
      clCtx.fill();
    }
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    cloudTex.wrapS = THREE.RepeatWrapping;
    cloudTex.colorSpace = THREE.SRGBColorSpace;

    return { realisticTex, nightTex, topoTex, cyberTex, cloudTex };
  };

  // Helper: Convert Lat/Lng to 3D Cartesian coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const width = Math.max(400, containerRef.current.clientWidth || 800);
    const height = Math.max(400, containerRef.current.clientHeight || 600);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 14;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Multi-Angle Orbital Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.set(20, 10, 25);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(-20, -10, 20);
    scene.add(fillLight);

    // Deep Space Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const r = 100 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);

      const tint = 0.7 + Math.random() * 0.3;
      starColors[i] = tint;
      starColors[i + 1] = tint * (0.8 + Math.random() * 0.2);
      starColors[i + 2] = 1.0;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Earth Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Textures - Initialize procedural textures immediately for instant rendering
    const textures = createProceduralTextures();
    texturesRef.current = {
      realistic: textures.realisticTex,
      night_lights: textures.nightTex,
      topographic: textures.topoTex,
      hologram: textures.cyberTex,
      clouds: textures.cloudTex
    };

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(5, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: textures.realisticTex,
      roughness: 0.6,
      metalness: 0.05,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Asynchronously load Real Earth High-Res Textures (NASA / Official CDNs)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    // 1. Real Day Earth (NASA Blue Marble / Satellite Photo)
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        texturesRef.current.realistic = tex;
        if (earthMeshRef.current && currentVisualModeRef.current === 'realistic') {
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).map = tex;
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      },
      undefined,
      () => {
        textureLoader.load(
          'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
          (tex2) => {
            tex2.wrapS = THREE.RepeatWrapping;
            tex2.colorSpace = THREE.SRGBColorSpace;
            texturesRef.current.realistic = tex2;
            if (earthMeshRef.current && currentVisualModeRef.current === 'realistic') {
              (earthMeshRef.current.material as THREE.MeshStandardMaterial).map = tex2;
              (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
            }
          },
          undefined,
          () => {}
        );
      }
    );

    // 2. Real Night Lights
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        texturesRef.current.night_lights = tex;
        if (earthMeshRef.current && currentVisualModeRef.current === 'night_lights') {
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).map = tex;
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      },
      undefined,
      () => {
        textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg', (tex2) => {
          tex2.wrapS = THREE.RepeatWrapping;
          tex2.colorSpace = THREE.SRGBColorSpace;
          texturesRef.current.night_lights = tex2;
          if (earthMeshRef.current && currentVisualModeRef.current === 'night_lights') {
            (earthMeshRef.current.material as THREE.MeshStandardMaterial).map = tex2;
            (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
          }
        });
      }
    );

    // 3. Real Earth Topographic / Normal Texture
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        texturesRef.current.topographic = tex;
        if (earthMeshRef.current && currentVisualModeRef.current === 'topographic') {
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).map = tex;
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      },
      undefined,
      () => {
        textureLoader.load(
          'https://unpkg.com/three-globe/example/img/earth-topology.png',
          (tex2) => {
            tex2.wrapS = THREE.RepeatWrapping;
            tex2.colorSpace = THREE.SRGBColorSpace;
            texturesRef.current.topographic = tex2;
            if (earthMeshRef.current && currentVisualModeRef.current === 'topographic') {
              (earthMeshRef.current.material as THREE.MeshStandardMaterial).map = tex2;
              (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
            }
          },
          undefined,
          () => {}
        );
      }
    );

    // 4. Real Earth Clouds
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        texturesRef.current.clouds = tex;
        if (cloudsMeshRef.current) {
          (cloudsMeshRef.current.material as THREE.MeshStandardMaterial).map = tex;
          (cloudsMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      },
      undefined,
      () => {}
    );

    // Atmosphere Rim Glow Shader
    const atmosGeo = new THREE.SphereGeometry(5.15, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.1, 0.6, 1.0, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // Volumetric Cloud Layer
    const cloudsGeo = new THREE.SphereGeometry(5.05, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: textures.cloudTex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Beacons & City Pins Group
    const beaconsGroup = new THREE.Group();
    earthGroup.add(beaconsGroup);
    beaconsGroupRef.current = beaconsGroup;

    EARTH_LOCATIONS.forEach(loc => {
      const pos = latLngToVector3(loc.lat, loc.lng, 5.02);
      const beaconGroup = new THREE.Group();
      beaconGroup.position.copy(pos);
      beaconGroup.lookAt(new THREE.Vector3(0, 0, 0));
      // Rotate 180 degrees so cone points outward from Earth center
      beaconGroup.rotateX(Math.PI);
      beaconGroup.userData = { location: loc };

      // Color by category
      let color = 0x00ffff; // Cyan default
      if (loc.category === 'megacity') color = 0xffa000; // Gold
      else if (loc.category === 'wonder') color = 0x00e676; // Green
      else if (loc.category === 'extreme') color = 0xff1744; // Red
      else if (loc.category === 'observatory') color = 0xd500f9; // Purple
      else if (loc.category === 'tmg_community') color = 0x00ff95; // Mint Green
      else if (loc.category === 'tmg_resort') color = 0x00f2ff; // Cyan

      // Dot on surface
      const dotGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      beaconGroup.add(dotMesh);

      // Outer pulsing ring
      const ringGeo = new THREE.RingGeometry(0.1, 0.18, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.01;
      ringMesh.rotateX(Math.PI / 2);
      beaconGroup.add(ringMesh);

      // Upward beam cylinder
      const beamGeo = new THREE.CylinderGeometry(0.01, 0.05, 0.8, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.y = -0.4;
      beaconGroup.add(beamMesh);

      beaconsGroup.add(beaconGroup);
    });

    // Orbital Satellites Constellation
    const satellitesGroup = new THREE.Group();
    earthGroup.add(satellitesGroup);
    satellitesGroupRef.current = satellitesGroup;

    // Create 4 orbital tracks with moving satellite dots
    for (let ring = 0; ring < 4; ring++) {
      const orbitRadius = 6.2 + ring * 0.7;
      const trackGeo = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, 0, Math.sin(theta) * orbitRadius));
      }
      trackGeo.setFromPoints(points);
      const trackMat = new THREE.LineBasicMaterial({ color: 0x00bcd4, transparent: true, opacity: 0.15 });
      const orbitLine = new THREE.Line(trackGeo, trackMat);
      orbitLine.rotation.x = (Math.random() - 0.5) * Math.PI;
      orbitLine.rotation.z = (Math.random() - 0.5) * Math.PI;
      satellitesGroup.add(orbitLine);

      // Satellite dot
      const satGeo = new THREE.BoxGeometry(0.12, 0.08, 0.2);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.userData = { angle: Math.random() * Math.PI * 2, speed: 0.005 + ring * 0.002, radius: orbitRadius, orbitLine };
      satellitesGroup.add(satMesh);
    }

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(300, containerRef.current.clientWidth || 800);
      const h = Math.max(300, containerRef.current.clientHeight || 600);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Mouse / Touch Interactions
    const domElement = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        targetRotationRef.current.y += deltaX * 0.005;
        targetRotationRef.current.x += deltaY * 0.005;
        // Clamp pitch so we don't flip upside down
        targetRotationRef.current.x = Math.max(-1.4, Math.min(1.4, targetRotationRef.current.x));
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast for hover tooltips
        const rect = domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        if (beaconsGroupRef.current) {
          const intersects = raycaster.intersectObjects(beaconsGroupRef.current.children, true);
          if (intersects.length > 0) {
            let obj: THREE.Object3D | null = intersects[0].object;
            while (obj && !obj.userData?.location) {
              obj = obj.parent;
            }
            if (obj && obj.userData.location) {
              setHoveredLocation(obj.userData.location);
              setTooltipPos({ x: e.clientX, y: e.clientY });
              domElement.style.cursor = 'pointer';
              return;
            }
          }
        }
        setHoveredLocation(null);
        domElement.style.cursor = 'grab';
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      domElement.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      // Check if we clicked a beacon
      const rect = domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      if (beaconsGroupRef.current) {
        const intersects = raycaster.intersectObjects(beaconsGroupRef.current.children, true);
        if (intersects.length > 0) {
          let obj: THREE.Object3D | null = intersects[0].object;
          while (obj && !obj.userData?.location) {
            obj = obj.parent;
          }
          if (obj && obj.userData.location) {
            onSelectLocation(obj.userData.location);
            return;
          }
        }
      }

      // If clicked empty globe surface, calculate lat/lng and create waypoint!
      if (earthMeshRef.current) {
        const intersects = raycaster.intersectObject(earthMeshRef.current);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          // Convert 3D point on radius 5 sphere back to lat/lng
          const lat = 90 - (Math.acos(point.y / 5) * 180) / Math.PI;
          const lng = ((Math.atan2(point.z, -point.x) * 180) / Math.PI) - 180;
          const normalizedLng = ((lng + 540) % 360) - 180;

          const customPoint: LocationPoint = {
            id: `custom_${Date.now()}`,
            name: `Coordinates (${lat.toFixed(2)}°, ${normalizedLng.toFixed(2)}°)`,
            lat,
            lng: normalizedLng,
            country: 'Global Waypoint',
            category: 'wonder',
            description: 'Custom surface waypoint inspected by user on 3D globe.',
            altitude: 'Surface Level'
          };
          onSelectLocation(customPoint);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomRef.current += e.deltaY * 0.008;
      targetZoomRef.current = Math.max(6.5, Math.min(25, targetZoomRef.current));
    };

    domElement.addEventListener('mousedown', handleMouseDown);
    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('click', handleClick);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera interpolation
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.1;

      if (cameraRef.current) {
        cameraRef.current.position.z = currentZoomRef.current;
      }

      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.x = currentRotationRef.current.x;
        earthGroupRef.current.rotation.y = currentRotationRef.current.y;

        // Auto orbital rotation when not dragging and no specific location is locked
        if (!isDraggingRef.current && rotationSpeed > 0) {
          targetRotationRef.current.y += rotationSpeed * 0.002;
        }
      }

      // Rotate clouds slightly faster
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += rotationSpeed * 0.0025;
      }

      // Animate orbital satellites
      if (satellitesGroupRef.current) {
        satellitesGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.userData.radius) {
            child.userData.angle += child.userData.speed;
            const r = child.userData.radius;
            const line = child.userData.orbitLine;
            if (line) {
              const theta = child.userData.angle;
              const localPos = new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r);
              localPos.applyEuler(line.rotation);
              child.position.copy(localPos);
            }
          }
        });
      }

      // Pulse beacon rings
      if (beaconsGroupRef.current) {
        const time = clock.getElapsedTime();
        beaconsGroupRef.current.children.forEach((beacon, idx) => {
          const ring = beacon.children[1] as THREE.Mesh;
          if (ring) {
            const scale = 1 + Math.sin(time * 3 + idx) * 0.3;
            ring.scale.set(scale, scale, 1);
          }
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('click', handleClick);
      domElement.removeEventListener('wheel', handleWheel);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // Update visual materials when visualMode changes
  useEffect(() => {
    if (!earthMeshRef.current || !atmosphereMeshRef.current) return;
    const mat = earthMeshRef.current.material as THREE.MeshStandardMaterial;

    const targetTexture = texturesRef.current[visualMode] || texturesRef.current.realistic;
    if (targetTexture) {
      mat.map = targetTexture;
      mat.needsUpdate = true;
    }

    if (visualMode === 'realistic') {
      mat.color.setHex(0xffffff);
      mat.wireframe = false;
      mat.roughness = 0.6;
      mat.metalness = 0.05;
      if (cloudsMeshRef.current) cloudsMeshRef.current.visible = showClouds;
    } else if (visualMode === 'night_lights') {
      mat.color.setHex(0xffffff);
      mat.wireframe = false;
      mat.roughness = 0.8;
      mat.metalness = 0.0;
      if (cloudsMeshRef.current) cloudsMeshRef.current.visible = false;
    } else if (visualMode === 'hologram') {
      mat.color.setHex(0x00e5ff);
      mat.wireframe = true;
      mat.roughness = 0.3;
      mat.metalness = 0.8;
      if (cloudsMeshRef.current) cloudsMeshRef.current.visible = false;
    } else if (visualMode === 'topographic') {
      mat.color.setHex(0xeeeeee);
      mat.wireframe = false;
      mat.roughness = 0.9;
      mat.metalness = 0.0;
      if (cloudsMeshRef.current) cloudsMeshRef.current.visible = false;
    }
  }, [visualMode, showClouds]);

  // Update satellite visibility
  useEffect(() => {
    if (satellitesGroupRef.current) {
      satellitesGroupRef.current.visible = showSatellites;
    }
  }, [showSatellites]);

  // Rotate camera to selected location smoothly
  useEffect(() => {
    if (selectedLocation) {
      // Convert target lng/lat to target rotation Y and X
      const targetY = -((selectedLocation.lng + 90) * Math.PI) / 180;
      const targetX = (selectedLocation.lat * Math.PI) / 180;
      targetRotationRef.current = { x: targetX, y: targetY };
      targetZoomRef.current = 10.5; // Zoom closer when selected!
    }
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-full flex-1 min-h-[450px] bg-[#05070a] border border-[#1a1f2e] overflow-hidden select-none" ref={containerRef}>
      {/* Interactive Tooltip on hover */}
      {hoveredLocation && (
        <div
          className="absolute z-30 pointer-events-none px-3 py-2 bg-[#0a0d16] border border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)] text-[#e0e7ff] transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3 font-mono text-xs rounded-none"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 12}px` }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00f2ff] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#00f2ff] animate-ping" />
            <span>TARGET // {hoveredLocation.category.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="font-bold text-sm text-[#e0e7ff] mt-0.5">{hoveredLocation.name.toUpperCase()}</div>
          <div className="text-[10px] text-[#4e6a8e] font-mono">{hoveredLocation.country.toUpperCase()}</div>
        </div>
      )}

      {/* On-screen High Density technical footer strip */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none bg-[#0a0d16]/95 border-t border-[#1a1f2e] px-4 py-2 flex flex-wrap justify-between items-center text-[10px] font-mono text-[#4e6a8e]">
        <div className="flex items-center space-x-4">
          <span className="text-[#00f2ff] font-bold">[DRAG: ROTATE]</span>
          <span>•</span>
          <span className="text-[#00f2ff] font-bold">[SCROLL: ZOOM]</span>
          <span>•</span>
          <span className="text-[#00f2ff] font-bold">[CLICK: INSPECT TARGET]</span>
        </div>
        <div className="flex items-center space-x-6">
          <div>FRAME_LATENCY: <span className="text-[#00ff95] font-bold">0.4MS</span></div>
          <div>POWER_LEVEL: <span className="text-[#00f2ff] font-bold">OPTIMAL</span></div>
          <div className="hidden md:block text-[#8ea8d0]">SOL_SYSTEM // THIRD_ORBIT</div>
        </div>
      </footer>
    </div>
  );
};
