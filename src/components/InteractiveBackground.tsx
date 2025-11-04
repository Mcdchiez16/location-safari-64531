import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

function FloatingSphere({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 1.2;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.3 + position[1]) * 0.8;
      meshRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.4) * 0.5;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(scale * 1.5, scale * 1.5, scale * 1.5), 0.1);
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
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.4}
        wireframe={false}
      />
    </mesh>
  );
}

function AnimatedCube({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[scale * 1.5, scale * 1.5, scale * 1.5]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        roughness={0.4}
        metalness={0.6}
        emissive={color}
        emissiveIntensity={0.3}
        wireframe
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const { camera, size } = useThree();
  const mousePosition = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      
      // Vibrant color palette: purple, cyan, coral, lime
      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        colors[i] = 0.67; colors[i + 1] = 0.33; colors[i + 2] = 0.93; // Purple
      } else if (colorChoice < 0.5) {
        colors[i] = 0.0; colors[i + 1] = 0.9; colors[i + 2] = 0.95; // Cyan
      } else if (colorChoice < 0.75) {
        colors[i] = 1.0; colors[i + 1] = 0.45; colors[i + 2] = 0.45; // Coral
      } else {
        colors[i] = 0.6; colors[i + 1] = 0.95; colors[i + 2] = 0.3; // Lime
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
        size={0.1}
        vertexColors
        transparent
        opacity={0.9}
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#06b6d4" />
        <pointLight position={[0, 10, 5]} intensity={1.0} color="#f87171" />
        <pointLight position={[-5, -5, 5]} intensity={0.8} color="#84cc16" />
        <spotLight position={[5, 5, 5]} intensity={0.7} color="#c084fc" angle={0.6} penumbra={1} />
        
        {/* Floating spheres */}
        <FloatingSphere position={[-3, 0, -2]} scale={0.6} color="#a855f7" />
        <FloatingSphere position={[3, 1, -3]} scale={0.5} color="#06b6d4" />
        <FloatingSphere position={[0, -2, -1]} scale={0.7} color="#f87171" />
        <FloatingSphere position={[-2, 2, -4]} scale={0.4} color="#84cc16" />
        
        {/* Animated cubes */}
        <AnimatedCube position={[4, -1, -2]} scale={0.8} color="#c084fc" />
        <AnimatedCube position={[-4, 1, -3]} scale={0.6} color="#22d3ee" />
        
        <FloatingParticles />
      </Canvas>
    </div>
  );
}

export default InteractiveBackground;
