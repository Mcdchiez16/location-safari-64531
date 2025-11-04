import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

function AnimatedSphere({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
      
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(scale * 1.2, scale * 1.2, scale * 1.2), 0.1);
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
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        positions[i + 1] += Math.cos(state.clock.elapsedTime + i) * 0.002;
        
        // React to mouse
        const dx = mousePosition.current.x * 5 - x;
        const dy = mousePosition.current.y * 5 - y;
        positions[i] += dx * 0.0001;
        positions[i + 1] += dy * 0.0001;
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
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function InteractiveBackground() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        <AnimatedSphere position={[-3, 0, 0]} scale={1.5} color="#8b5cf6" />
        <AnimatedSphere position={[3, 0, -2]} scale={1.2} color="#ec4899" />
        <AnimatedSphere position={[0, 2, -1]} scale={1} color="#3b82f6" />
        
        <FloatingParticles />
      </Canvas>
    </div>
  );
}

export default InteractiveBackground;
