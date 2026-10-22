"use client"

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import { ContactShadows, Html, OrbitControls, RoundedBox } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { buildingPlacement, type BuildingId, type CampusBuilding } from "./buildings"

const HOME_CAMERA = new THREE.Vector3(0, 15, 21)
const HOME_TARGET = new THREE.Vector3(0, 0.5, 0)

interface SceneProps {
  buildings: CampusBuilding[]
  focusedId: BuildingId | null
  onSelect: (id: BuildingId | null) => void
  reducedMotion: boolean
}

type Controls = { target: THREE.Vector3; update: () => void }

/** Bay camera tới toà nhà đang chọn (hoặc về toàn cảnh), rồi trả quyền điều khiển cho OrbitControls */
function CameraFlyer({ goal, reducedMotion }: { goal: { position: THREE.Vector3; target: THREE.Vector3 }; reducedMotion: boolean }) {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as unknown as Controls | null
  const flying = useRef(true)

  useEffect(() => {
    flying.current = true
  }, [goal])

  useFrame((_, delta) => {
    if (!flying.current || !controls) return
    const t = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.2)
    camera.position.lerp(goal.position, t)
    controls.target.lerp(goal.target, t)
    controls.update()
    if (camera.position.distanceTo(goal.position) < 0.05 && controls.target.distanceTo(goal.target) < 0.05) {
      flying.current = false
    }
  })

  return null
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1, 8]} />
        <meshStandardMaterial color="#8a5a35" />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <icosahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color="#4cc38a" flatShading />
      </mesh>
      <mesh position={[0.25, 1.75, 0.1]} castShadow>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#62d39b" flatShading />
      </mesh>
    </group>
  )
}

function Cloud({ position, speed, reducedMotion }: { position: [number, number, number]; speed: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current || reducedMotion) return
    ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed) * 3
  })
  return (
    <group ref={ref} position={position}>
      {[[0, 0, 0, 1], [0.9, -0.1, 0.2, 0.75], [-0.9, -0.15, 0, 0.7], [0.3, 0.35, 0, 0.7]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

function Flagpole({ reducedMotion }: { reducedMotion: boolean }) {
  const flag = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!flag.current || reducedMotion) return
    flag.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.15
  })
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.3, 32]} />
        <meshStandardMaterial color="#f4e3c8" />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 4.8, 12]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={flag} position={[0.6, 4.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.75, 0.03]} />
        <meshStandardMaterial color="#ff5c93" />
      </mesh>
      <Html position={[0, 0.5, 1.35]} center distanceFactor={14} pointerEvents="none">
        <div className="whitespace-nowrap rounded-full border-2 border-[#2b2140] bg-white px-3 py-0.5 text-[13px] font-extrabold text-[#2b2140] shadow-[0_3px_0_0_#2b2140] select-none">
          🌸 RosyClass
        </div>
      </Html>
    </group>
  )
}

function Building({
  building,
  index,
  total,
  focused,
  dimmed,
  onSelect,
}: {
  building: CampusBuilding
  index: number
  total: number
  focused: boolean
  dimmed: boolean
  onSelect: (id: BuildingId) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { x, z, rotationY } = buildingPlacement(index, total)
  const [width, height, depth] = building.size

  // Nảy nhẹ khi rê chuột hoặc đang chọn
  useFrame((_, delta) => {
    if (!ref.current) return
    const goal = focused ? 1.08 : hovered ? 1.05 : 1
    const scale = THREE.MathUtils.lerp(ref.current.scale.x, goal, 1 - Math.exp(-delta * 10))
    ref.current.scale.setScalar(scale)
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(building.id)
  }

  const windows = Math.max(2, Math.round(width / 0.8))

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <group
        ref={ref}
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ""
        }}
      >
        <RoundedBox args={[width, height, depth]} radius={0.12} position={[0, height / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={building.color} transparent opacity={dimmed ? 0.45 : 1} />
        </RoundedBox>
        {/* Mái nhọn */}
        <mesh position={[0, height + 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[Math.max(width, depth) * 0.78, 1.1, 4]} />
          <meshStandardMaterial color={building.roof} flatShading transparent opacity={dimmed ? 0.45 : 1} />
        </mesh>
        {/* Cửa chính quay về phía sân trường (+z cục bộ) */}
        <RoundedBox args={[0.7, 1.1, 0.08]} radius={0.05} position={[0, 0.55, depth / 2 + 0.02]}>
          <meshStandardMaterial color="#8a5a35" />
        </RoundedBox>
        {Array.from({ length: windows }, (_, i) => {
          const wx = (i - (windows - 1) / 2) * (width / windows)
          if (Math.abs(wx) < 0.45) return null
          return (
            <mesh key={i} position={[wx, height * 0.55, depth / 2 + 0.02]}>
              <planeGeometry args={[0.42, 0.42]} />
              <meshStandardMaterial color="#fffbe6" emissive="#fff1b0" emissiveIntensity={0.6} />
            </mesh>
          )
        })}
        {height > 2.3 ? (
          <mesh position={[0, height * 0.82, depth / 2 + 0.02]}>
            <circleGeometry args={[0.28, 24]} />
            <meshStandardMaterial color="#fffbe6" emissive="#fff1b0" emissiveIntensity={0.6} />
          </mesh>
        ) : null}
      </group>

      <Html position={[0, height + 1.7, 0]} center distanceFactor={16} zIndexRange={[20, 0]}>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onSelect(building.id)}
          className="pointer-events-auto flex flex-col items-center gap-0.5 rounded-2xl border-2 border-[#2b2140] bg-white px-3 py-1.5 text-center shadow-[0_3px_0_0_#2b2140] select-none"
          style={{ background: focused ? "#ffc93c" : "#ffffff", opacity: dimmed ? 0.6 : 1 }}
        >
          <span className="whitespace-nowrap text-[14px] font-extrabold text-[#2b2140]">{building.name}</span>
          {building.stat ? (
            <span className="whitespace-nowrap text-[12px] font-semibold text-[#5c5470]">
              <strong className="text-[#2b2140]">{building.stat.value}</strong> {building.stat.label}
            </span>
          ) : null}
        </button>
      </Html>
    </group>
  )
}

function Campus({ buildings, focusedId, onSelect, reducedMotion }: SceneProps) {
  const trees = useMemo(() => {
    const list: Array<{ position: [number, number, number]; scale: number }> = []
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2 + 0.13
      const radius = 13.5 + (i % 3) * 0.9
      list.push({ position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius], scale: 0.85 + (i % 4) * 0.12 })
    }
    return list
  }, [])

  return (
    <group>
      {/* Bãi cỏ, sân trường và lối đi tới từng toà nhà */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[17, 64]} />
        <meshStandardMaterial color="#9be3a5" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#f4e3c8" />
      </mesh>
      {buildings.map((building, index) => {
        const { x, z } = buildingPlacement(index, buildings.length)
        const length = Math.hypot(x, z)
        return (
          <mesh
            key={`path-${building.id}`}
            rotation={[-Math.PI / 2, 0, -Math.atan2(z, x)]}
            position={[x / 2, 0.012, z / 2]}
            receiveShadow
          >
            <planeGeometry args={[length, 0.9]} />
            <meshStandardMaterial color="#f4e3c8" />
          </mesh>
        )
      })}

      <Flagpole reducedMotion={reducedMotion} />

      {buildings.map((building, index) => (
        <Building
          key={building.id}
          building={building}
          index={index}
          total={buildings.length}
          focused={focusedId === building.id}
          dimmed={focusedId !== null && focusedId !== building.id}
          onSelect={onSelect}
        />
      ))}

      {trees.map((tree, i) => (
        <Tree key={i} position={tree.position} scale={tree.scale} />
      ))}

      <Cloud position={[-8, 9, -6]} speed={0.15} reducedMotion={reducedMotion} />
      <Cloud position={[7, 10, -9]} speed={0.12} reducedMotion={reducedMotion} />
      <Cloud position={[2, 8.5, 9]} speed={0.18} reducedMotion={reducedMotion} />
      <mesh position={[11, 13, -14]}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial color="#ffd23f" />
      </mesh>
    </group>
  )
}

export default function CampusScene({ buildings, focusedId, onSelect, reducedMotion }: SceneProps) {
  const goal = useMemo(() => {
    const index = buildings.findIndex((building) => building.id === focusedId)
    if (index < 0) return { position: HOME_CAMERA, target: HOME_TARGET }
    const { x, z } = buildingPlacement(index, buildings.length)
    const outward = new THREE.Vector3(x, 0, z).normalize()
    const target = new THREE.Vector3(x, 1.5, z)
    // Đứng ở sân trường nhìn ra cửa chính của toà nhà
    const position = target.clone().sub(outward.multiplyScalar(7.5)).setY(5.5)
    return { position, target }
  }, [buildings, focusedId])

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: HOME_CAMERA.toArray(), fov: 45 }}
      onPointerMissed={() => onSelect(null)}
      aria-label="Khuôn viên RosyClass 3D"
    >
      <color attach="background" args={["#cdeeff"]} />
      <fog attach="fog" args={["#cdeeff", 28, 55]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[10, 16, 8]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <hemisphereLight args={["#ffffff", "#9be3a5", 0.45]} />

      <Campus buildings={buildings} focusedId={focusedId} onSelect={onSelect} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.25} scale={40} blur={2.5} far={6} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={34}
        maxPolarAngle={Math.PI / 2.25}
        autoRotate={!reducedMotion && focusedId === null}
        autoRotateSpeed={0.25}
      />
      <CameraFlyer goal={goal} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
