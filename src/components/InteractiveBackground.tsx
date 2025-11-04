import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

function AnimatedTorus({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.3) * 0.8;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.4) * 0.6;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(scale * 1.3, scale * 1.3, scale * 1.3), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <torusGeometry args={[1, 0.4, 16, 100]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.9}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function AnimatedRing({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.4;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.4;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1.5, 0.1, 16, 100]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.5}
        roughness={0.3}
        metalness={0.7}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const { camera, size } = useThree();
  const mousePosition = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 25;
      positions[i + 1] = (Math.random() - 0.5) * 25;
      positions[i + 2] = (Math.random() - 0.5) * 15;
      
      // Elegant color palette: gold, teal, rose gold
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i] = 0.85; colors[i + 1] = 0.65; colors[i + 2] = 0.13; // Gold
      } else if (colorChoice < 0.66) {
        colors[i] = 0.13; colors[i + 1] = 0.82; colors[i + 2] = 0.78; // Teal
      } else {
        colors[i] = 0.92; colors[i + 1] = 0.58; colors[i + 2] = 0.69; // Rose gold
      }
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.003;
        
        // Enhanced mouse interaction
        const distance = Math.sqrt(
          Math.pow(positions[i] - mousePosition.current.x * 5, 2) +
          Math.pow(positions[i + 1] - mousePosition.current.y * 5, 2)
        );
        
        if (distance < 2) {
          const force = (2 - distance) * 0.01;
          positions[i] += (positions[i] - mousePosition.current.x * 5) * force;
          positions[i + 1] += (positions[i + 1] - mousePosition.current.y * 5) * force;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const handlePointerMove = (event: any) => {
    if (event.point) {
      mousePosition.current.x = event.point.x;
      mousePosition.current.y = event.point.y;
    }
  };

  return (
    <points ref={particlesRef} onPointerMove={handlePointerMove}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function InteractiveBackground() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#d4af37" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#14b8a6" />
        <pointLight position={[0, 10, 5]} intensity={0.6} color="#eb9ca7" />
        <spotLight position={[5, 5, 5]} intensity={0.5} color="#ffd700" angle={0.5} penumbra={1} />
        
        {/* Elegant animated torus shapes */}
        <AnimatedTorus position={[-4, 0, -2]} scale={0.8} color="#d4af37" />
        <AnimatedTorus position={[4, 1, -3]} scale={0.6} color="#14b8a6" />
        <AnimatedTorus position={[0, -2, -1]} scale={0.7} color="#eb9ca7" />
        
        {/* Animated rings */}
        <AnimatedRing position={[-2, 2, -4]} scale={1} color="#ffd700" />
        <AnimatedRing position={[3, -1, -2]} scale={0.8} color="#5eead4" />
        
        <FloatingParticles />
      </Canvas>
    </div>
  );
}

export default InteractiveBackground;
