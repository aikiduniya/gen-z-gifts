import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useMemo, useRef } from 'react';

interface Product3DViewerProps {
  imageUrl: string;
  name: string;
}

const GlowRing = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.5;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.3]}>
      <torusGeometry args={[2.2, 0.03, 16, 64]} />
      <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.5} transparent opacity={0.5} />
    </mesh>
  );
};

const FloatingParticles = () => {
  const ref = useRef<THREE.Points>(null);
  const particles = useMemo(() => {
    const positions = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a855f7" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const ProductBox = ({ imageUrl }: { imageUrl: string }) => {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
    }
  });

  const materials = useMemo(() => {
    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const sideMat = new THREE.MeshStandardMaterial({
      color: '#1a1a2e',
      roughness: 0.3,
      metalness: 0.4,
      emissive: '#a855f7',
      emissiveIntensity: 0.15,
    });
    const backMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.15,
      transparent: true,
      opacity: 0.6,
    });
    return [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
  }, [texture]);

  return (
    <mesh ref={meshRef} material={materials} rotation={[0, 0, 0]}>
      <boxGeometry args={[2.8, 2.8, 0.3]} />
    </mesh>
  );
};

const Product3DViewer = ({ imageUrl, name }: Product3DViewerProps) => {
  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden relative group">
      {/* Frosted glass border */}
      <div className="absolute inset-0 rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] z-10 pointer-events-none" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 z-10 pointer-events-none" />

      {/* Glassmorphism overlay corners */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-white/5 to-transparent z-10 pointer-events-none rounded-t-2xl" />
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none rounded-b-2xl" />

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] to-[#1a1035]" />

      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} color="#e9d5ff" />
          <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#c084fc" />
          <pointLight position={[0, 0, 3]} intensity={0.4} color="#a855f7" />
          <GlowRing />
          <FloatingParticles />
          <ProductBox imageUrl={imageUrl} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={7}
            autoRotate
            autoRotateSpeed={2}
          />
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* 3D badge - glassmorphism style */}
      <div className="absolute top-3 left-3 z-20 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        3D View
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/50 z-20">
        Drag to rotate • Scroll to zoom
      </p>
    </div>
  );
};

export default Product3DViewer;
