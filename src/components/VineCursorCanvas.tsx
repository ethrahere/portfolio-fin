import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Circle, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- Types ---

interface TrailPoint {
  position: THREE.Vector3;
  timestamp: number;
  // Pre-computed offsets for the "sketchy" lines
  offset1: THREE.Vector3;
  offset2: THREE.Vector3;
  offset3: THREE.Vector3;
  offset4: THREE.Vector3;
}

interface OrganicElement {
  id: number;
  position: THREE.Vector3;
  scale: number;
  aspectRatio: number; // For leaf variation
  rotation: [number, number, number]; // 3D rotation
  timestamp: number;
  variant: 'flower' | 'leaf';
  color: string;
}

// --- Constants ---

const TRAIL_LIFETIME = 4000;
const FADE_OUT_DURATION = 1000; // The last second is spent fading out
const MIN_DISTANCE = 0.1; // Reduced for higher density
const MAX_POINTS = 2000;

// Colors
const VINE_MAIN_COLOR = "#3A5F0B";
const VINE_SKETCH_COLOR_1 = "#608038";
const VINE_SKETCH_COLOR_2 = "#2E4A05";

const FLOWER_COLORS = ["#FFFF00", "#FFEA00", "#FFD600", "#FFF176"];
const LEAF_COLOR = "#4A7A26";

// --- Helper Geometry Components ---

const Petal: React.FC<{ color: string; angle: number; parentScale: number }> = ({ color, angle }) => {
  return (
    <group rotation={[0, 0, angle]}>
      <group position={[0.15, 0, 0]}>
        <Circle args={[0.12, 16]} scale={[1.2, 0.6, 1]}>
          <meshStandardMaterial
            color={color}
            roughness={1}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </Circle>
      </group>
    </group>
  );
};

/**
 * Procedural 3D Flower - Self Animating
 */
const Flower: React.FC<{ data: OrganicElement }> = ({ data }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const now = clock.elapsedTime * 1000;
    const age = now - data.timestamp;

    // Calculate lifecycle scale
    let scaleFactor = Math.min(1, age / 500); // Fade In

    if (age > TRAIL_LIFETIME - FADE_OUT_DURATION) {
      const remaining = TRAIL_LIFETIME - age;
      scaleFactor *= Math.max(0, remaining / FADE_OUT_DURATION);
    }

    const currentScale = data.scale * scaleFactor;
    groupRef.current.scale.setScalar(currentScale);
  });

  return (
    <group ref={groupRef} position={data.position} rotation={data.rotation} scale={0}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Petal
            key={i}
            color={data.color}
            angle={(i / 5) * Math.PI * 2}
            parentScale={data.scale}
          />
        ))}
        <group position={[0, 0, 0.05]}>
           <Circle args={[0.08, 16]}>
             <meshStandardMaterial color="#5D4037" />
           </Circle>
           <Circle args={[0.04, 16]} position={[0, 0, 0.01]}>
             <meshStandardMaterial color="#3E2723" />
           </Circle>
        </group>
      </Float>
    </group>
  );
};

/**
 * Procedural Leaf - Self Animating
 */
const Leaf: React.FC<{ data: OrganicElement }> = ({ data }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const now = clock.elapsedTime * 1000;
    const age = now - data.timestamp;

    // Fade In
    let scaleFactor = Math.min(1, age / 400);

    // Fade Out
    if (age > TRAIL_LIFETIME - FADE_OUT_DURATION) {
      const remaining = TRAIL_LIFETIME - age;
      scaleFactor *= Math.max(0, remaining / FADE_OUT_DURATION);
    }

    const currentScale = data.scale * scaleFactor;
    groupRef.current.scale.setScalar(currentScale);
  });

  return (
    <group ref={groupRef} position={data.position} rotation={data.rotation} scale={0}>
       <Float speed={1} rotationIntensity={0.5} floatIntensity={0.1}>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1, data.aspectRatio, 1]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial color={LEAF_COLOR} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, 0]} scale={[0.2, 0.02, 1]}>
           <planeGeometry args={[1, 1]} />
           <meshBasicMaterial color="#2d4a16" />
        </mesh>
      </Float>
    </group>
  );
};


/**
 * Main Scene Logic
 */
const InteractiveGarden: React.FC = () => {
  const { viewport, pointer } = useThree();

  const [points, setPoints] = useState<TrailPoint[]>([]);
  const [elements, setElements] = useState<OrganicElement[]>([]);
  const elementIdCounter = useRef(0);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime * 1000;

    // 1. Input Logic
    const x = (pointer.x * viewport.width) / 2;
    const y = (pointer.y * viewport.height) / 2;
    const currentPos = new THREE.Vector3(x, y, 0);

    let newPoints = [...points];
    let newElements = [...elements];
    let needsStateUpdate = false;

    // 2. Add new point logic
    const lastPoint = newPoints[newPoints.length - 1];
    if (!lastPoint || currentPos.distanceTo(lastPoint.position) > MIN_DISTANCE) {
      needsStateUpdate = true;

      const offset1 = new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, 0);
      const offset2 = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0);
      const offset3 = new THREE.Vector3((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15, 0);
      const offset4 = new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0);

      newPoints.push({
        position: currentPos.clone(),
        timestamp: now,
        offset1, offset2, offset3, offset4
      });

      // 3. Spawn Logic - Increased Density
      const rand = Math.random();
      // Increased chance to spawn (from >0.55 to >0.15)
      if (rand > 0.15) {
        elementIdCounter.current++;

        const isFlower = rand > 0.95; // Flowers still relatively rare compared to leaves

        const rotation: [number, number, number] = [
            (Math.random() - 0.5) * 1.0,
            (Math.random() - 0.5) * 1.0,
            Math.random() * Math.PI * 2
        ];

        const flowerScale = 0.5 + Math.random() * 0.3;
        const leafScale = 0.4 + Math.random() * 0.4;
        const leafAspectRatio = 0.4 + Math.random() * 0.4;

        const posOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            0
        );

        newElements.push({
          id: elementIdCounter.current,
          position: currentPos.clone().add(posOffset),
          scale: isFlower ? flowerScale : leafScale,
          aspectRatio: leafAspectRatio,
          rotation: rotation,
          timestamp: now,
          variant: isFlower ? 'flower' : 'leaf',
          color: isFlower ? FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)] : LEAF_COLOR,
        });
      }
    }

    // 4. Prune old data
    const activePoints = newPoints.filter(p => now - p.timestamp < TRAIL_LIFETIME);
    const activeElements = newElements.filter(e => now - e.timestamp < TRAIL_LIFETIME);

    const finalPoints = activePoints.length > MAX_POINTS ? activePoints.slice(activePoints.length - MAX_POINTS) : activePoints;

    // 5. Trigger React Update if structure changed
    if (needsStateUpdate || finalPoints.length !== points.length || activeElements.length !== elements.length) {
      setPoints(finalPoints);
      setElements(activeElements);
    }
  });

  const mainPath = useMemo(() => points.map(p => p.position), [points]);
  const sketchPath1 = useMemo(() => points.map(p => p.position.clone().add(p.offset1)), [points]);
  const sketchPath2 = useMemo(() => points.map(p => p.position.clone().add(p.offset2)), [points]);
  const sketchPath3 = useMemo(() => points.map(p => p.position.clone().add(p.offset3)), [points]);
  const sketchPath4 = useMemo(() => points.map(p => p.position.clone().add(p.offset4)), [points]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />

      {/* Main Vine Line */}
      {points.length > 1 && (
        <group>
          <Line
            points={mainPath}
            color={VINE_MAIN_COLOR}
            lineWidth={2.5}
          />
          {/* Sketch lines remain static color/opacity for performance */}
          <Line
            points={sketchPath1}
            color={VINE_SKETCH_COLOR_1}
            lineWidth={1}
            transparent
            opacity={0.5}
          />
           <Line
            points={sketchPath2}
            color={VINE_SKETCH_COLOR_2}
            lineWidth={1.5}
            transparent
            opacity={0.4}
          />
          <Line
            points={sketchPath3}
            color={VINE_SKETCH_COLOR_1}
            lineWidth={0.8}
            transparent
            opacity={0.3}
          />
          <Line
            points={sketchPath4}
            color={VINE_MAIN_COLOR}
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
        </group>
      )}

      {elements.map((el) => (
        el.variant === 'flower' ? (
          <Flower key={el.id} data={el} />
        ) : (
          <Leaf key={el.id} data={el} />
        )
      ))}
    </>
  );
};

const VineCursorCanvas: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      {/* Beautiful cursive "hi" text in the background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <h1
          className="text-[20vw] font-bold text-gray-200 select-none"
          style={{
            fontFamily: "'Allura', 'Dancing Script', 'Brush Script MT', cursive",
            letterSpacing: '-0.05em'
          }}
        >
          hi
        </h1>
      </div>

      {/* 3D Canvas with vines and flowers on top */}
      <Canvas
        className="w-full h-full absolute inset-0 z-10"
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#ffffff'), 0); // Transparent background
        }}
      >
        <InteractiveGarden />
      </Canvas>
    </div>
  );
};

export default VineCursorCanvas;
