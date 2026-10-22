"use client"

import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber"
import { ContactShadows, Html, OrbitControls, RoundedBox } from "@react-three/drei"
import { useEffect, useMemo, useState } from "react"
import { layoutSeats, type ClassroomData, type ClassroomSeat, type SeatAttendance } from "./seats"

// Màu theo trạng thái buổi gần nhất; trùng với chú thích ở classroom-3d-tab.tsx
export const ATTENDANCE_COLORS: Record<SeatAttendance, string> = {
  PRESENT: "#2ec4a0",
  LATE: "#ff8a3d",
  MAKE_UP: "#3bb4f2",
  ABSENT: "#9aa0a6",
  UNKNOWN: "#c9b8ff",
}

const SHIRT_COLORS = ["#ff5c93", "#3bb4f2", "#ffc93c", "#8c5cf0", "#2ec4a0", "#ff8a3d"]
const SKIN_COLORS = ["#f5d0b0", "#e8b896", "#f1c7a5", "#d9a47e"]

export type CameraPreset = "overview" | "teacher" | "top"

export const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  overview: { position: [9, 8, 12], target: [0, 0.6, 1.5] },
  teacher: { position: [0, 2.4, -4.2], target: [0, 0.8, 3] },
  top: { position: [0, 16, 2.5], target: [0, 0, 2.4] },
}

interface SceneProps {
  classroom: ClassroomData
  showNames: boolean
  preset: CameraPreset
  selectedId: string | null
  onSelect: (seat: ClassroomSeat | null) => void
  reducedMotion: boolean
}

function hashIndex(value: string, modulo: number) {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash % modulo
}

function Chair({ color = "#5b8def" }: { color?: string }) {
  return (
    <group>
      <RoundedBox args={[0.55, 0.06, 0.5]} radius={0.02} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <RoundedBox args={[0.55, 0.5, 0.06]} radius={0.02} position={[0, 0.72, 0.24]} castShadow>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      {[-0.23, 0.23].map((x) =>
        [-0.2, 0.2].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.22, z]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
            <meshStandardMaterial color="#6b6f76" metalness={0.4} roughness={0.5} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Desk({ highlighted }: { highlighted: boolean }) {
  return (
    <group>
      <RoundedBox args={[1.2, 0.06, 0.65]} radius={0.02} position={[0, 0.72, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={highlighted ? "#ffe08a" : "#e7c79a"} roughness={0.7} />
      </RoundedBox>
      {[-0.54, 0.54].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]} castShadow>
          <boxGeometry args={[0.05, 0.72, 0.55]} />
          <meshStandardMaterial color="#b88c5a" />
        </mesh>
      ))}
      {/* Vở và bút trên bàn */}
      <mesh position={[-0.15, 0.76, -0.05]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.02, 0.22]} />
        <meshStandardMaterial color="#fff8ec" />
      </mesh>
      <mesh position={[0.2, 0.765, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
        <meshStandardMaterial color="#ff5c93" />
      </mesh>
    </group>
  )
}

/** Bé ngồi trên ghế, quay mặt về phía bảng (trục -z) */
function Kid({ seed, attendance }: { seed: string; attendance: SeatAttendance }) {
  const shirt = SHIRT_COLORS[hashIndex(seed, SHIRT_COLORS.length)]
  const skin = SKIN_COLORS[hashIndex(seed + "skin", SKIN_COLORS.length)]
  const raisedHand = attendance === "PRESENT" && hashIndex(seed + "hand", 4) === 0

  return (
    <group position={[0, 0.48, 0.05]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.28, 6, 12]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.19, 24, 24]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* Tóc */}
      <mesh position={[0, 0.86, 0.04]} castShadow>
        <sphereGeometry args={[0.2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3b2a20" />
      </mesh>
      {/* Mắt nhìn về bảng */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.8, -0.17]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#2b2140" />
        </mesh>
      ))}
      {raisedHand ? (
        <mesh position={[0.22, 0.85, -0.05]} rotation={[0, 0, -0.2]} castShadow>
          <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
      ) : null}
    </group>
  )
}

function StudentSeat({
  seat,
  position,
  showName,
  selected,
  onSelect,
}: {
  seat: ClassroomSeat
  position: [number, number, number]
  showName: boolean
  selected: boolean
  onSelect: (seat: ClassroomSeat) => void
}) {
  const [hovered, setHovered] = useState(false)
  const isHere = seat.lastAttendance !== "ABSENT"
  const color = ATTENDANCE_COLORS[seat.lastAttendance]

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(seat)
  }

  return (
    <group
      position={position}
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
      <Desk highlighted={hovered || selected} />
      <group position={[0, 0, 0.55]}>
        <Chair color={isHere ? "#5b8def" : "#aab4c8"} />
        {isHere ? <Kid seed={seat.studentId} attendance={seat.lastAttendance} /> : null}
      </group>
      {/* Vòng trạng thái dưới sàn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.3]}>
        <ringGeometry args={[0.78, selected ? 0.92 : 0.84, 48]} />
        <meshBasicMaterial color={color} transparent opacity={selected || hovered ? 0.95 : 0.55} />
      </mesh>
      {showName || hovered || selected ? (
        <Html position={[0, 1.75, 0.55]} center distanceFactor={9} zIndexRange={[20, 0]}>
          <button
            type="button"
            onClick={() => onSelect(seat)}
            className="pointer-events-auto whitespace-nowrap rounded-full border-2 border-[#2b2140] px-3 py-1 text-[13px] font-bold shadow-[0_3px_0_0_#2b2140] select-none"
            style={{ background: selected ? "#ffc93c" : "#ffffff", color: "#2b2140" }}
          >
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: color }} />
            {seat.fullName}
            {seat.latestStars !== null ? (
              <span className="ml-1.5 rounded-full bg-[#fff1c7] px-1.5 align-middle text-[12px]" aria-label={`${seat.latestStars} sao buổi gần nhất`}>
                ⭐ {seat.latestStars}
              </span>
            ) : null}
          </button>
        </Html>
      ) : null}
    </group>
  )
}

function Room({ width, depth, classroom }: { width: number; depth: number; classroom: ClassroomData }) {
  const roomWidth = Math.max(width + 3, 10)
  const roomDepth = depth + 6
  const centerZ = roomDepth / 2 - 4

  return (
    <group>
      {/* Sàn gỗ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#d8b48a" roughness={0.9} />
      </mesh>
      {/* Thảm đọc sách ở góc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-roomWidth / 2 + 1.6, 0.005, roomDepth - 5.2]}>
        <circleGeometry args={[1.1, 40]} />
        <meshStandardMaterial color="#ffe0ec" />
      </mesh>
      {/* Tường trước (có bảng) và tường trái (có cửa sổ) */}
      <mesh position={[0, 1.8, -4]} receiveShadow>
        <planeGeometry args={[roomWidth, 3.6]} />
        <meshStandardMaterial color="#fff1c7" />
      </mesh>
      <mesh position={[-roomWidth / 2, 1.8, centerZ]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[roomDepth, 3.6]} />
        <meshStandardMaterial color="#dcf2ff" />
      </mesh>
      {[0.25, 0.6].map((t) => (
        <group key={t} position={[-roomWidth / 2 + 0.02, 2, -4 + roomDepth * t]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[1.8, 1.3]} />
            <meshStandardMaterial color="#a7dcff" emissive="#a7dcff" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.06, 1.3]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Bảng xanh */}
      <group position={[0, 1.9, -3.95]}>
        <RoundedBox args={[5.4, 2, 0.08]} radius={0.04}>
          <meshStandardMaterial color="#8a5a35" />
        </RoundedBox>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[5.1, 1.75]} />
          <meshStandardMaterial color="#2f5d50" roughness={0.95} />
        </mesh>
        <Html position={[0, 0, 0.06]} transform distanceFactor={2.6} occlude={false} pointerEvents="none">
          <div className="w-[820px] select-none text-center font-[Baloo_2,Nunito,sans-serif] text-white">
            <div className="text-[64px] leading-tight font-extrabold">{classroom.className}</div>
            <div className="text-[36px] opacity-90">{classroom.courseName}</div>
            <div className="mt-3 text-[30px] opacity-80">Hello, class! 👋 ABC • 123</div>
          </div>
        </Html>
      </group>

      {/* Bục và bàn giáo viên */}
      <group position={[roomWidth / 2 - 2.6, 0, -2.4]}>
        <RoundedBox args={[1.8, 0.75, 0.8]} radius={0.04} position={[0, 0.375, 0]} castShadow>
          <meshStandardMaterial color="#c98f5a" />
        </RoundedBox>
        <mesh position={[0.5, 0.87, 0]} castShadow>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color="#3bb4f2" />
        </mesh>
        <mesh position={[-0.45, 0.82, 0.05]} rotation={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.08, 0.3]} />
          <meshStandardMaterial color="#ff5c93" />
        </mesh>
        {classroom.teacherName ? (
          <Html position={[0, 1.55, 0]} center distanceFactor={9}>
            <div className="whitespace-nowrap rounded-full border-2 border-[#2b2140] bg-[#8c5cf0] px-3 py-1 text-[13px] font-bold text-white shadow-[0_3px_0_0_#2b2140] select-none">
              👩‍🏫 {classroom.teacherName}
            </div>
          </Html>
        ) : null}
      </group>
    </group>
  )
}

/** Đưa camera về góc nhìn đã chọn mỗi khi đổi preset */
function CameraRig({ preset }: { preset: CameraPreset }) {
  const camera = useThree((state) => state.camera)
  useEffect(() => {
    camera.position.set(...CAMERA_PRESETS[preset].position)
    camera.updateProjectionMatrix()
  }, [camera, preset])
  return null
}

export default function ClassroomScene({ classroom, showNames, preset, selectedId, onSelect, reducedMotion }: SceneProps) {
  const layout = useMemo(() => layoutSeats(classroom.seats.length), [classroom.seats.length])
  const camera = CAMERA_PRESETS[preset]

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: camera.position, fov: 45 }}
      onPointerMissed={() => onSelect(null)}
      aria-label={`Sơ đồ 3D lớp ${classroom.className}`}
    >
      <color attach="background" args={["#fff8ec"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <hemisphereLight args={["#ffffff", "#d8b48a", 0.4]} />

      <Room width={layout.width} depth={layout.depth} classroom={classroom} />

      {layout.positions.map((position, index) => {
        const seat = classroom.seats[index]
        const coords: [number, number, number] = [position.x, 0, position.z]
        if (!seat) {
          // Bàn trống để lớp ít học sinh vẫn trông như một phòng học
          return (
            <group key={`empty-${index}`} position={coords}>
              <Desk highlighted={false} />
              <group position={[0, 0, 0.55]}>
                <Chair color="#cfd6e4" />
              </group>
            </group>
          )
        }
        return (
          <StudentSeat
            key={seat.studentId}
            seat={seat}
            position={coords}
            showName={showNames}
            selected={selectedId === seat.studentId}
            onSelect={onSelect}
          />
        )
      })}

      <ContactShadows position={[0, 0.005, 2]} opacity={0.25} scale={30} blur={2.5} far={4} />

      <CameraRig preset={preset} />
      <OrbitControls
        key={preset}
        target={camera.target}
        enablePan
        minDistance={3}
        maxDistance={28}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={!reducedMotion && preset === "overview"}
        autoRotateSpeed={0.35}
        makeDefault
      />
    </Canvas>
  )
}
