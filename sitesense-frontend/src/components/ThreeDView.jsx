import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei'

export default function ThreeDView() {
  return (
    <Canvas className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <Suspense fallback={null}>
        {/* This represents your Bridge/Structure Segment */}
        <mesh rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[3, 1.5, 0.5]} /> 
          <MeshWobbleMaterial 
            color="#1e3a8a" 
            speed={1} 
            factor={0.1} 
            metalness={0.8}
          />
        </mesh>
      </Suspense>
      
      <OrbitControls enableZoom={false} autoRotate />
    </Canvas>
  )
}