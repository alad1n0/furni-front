'use client'

import * as THREE from 'three';
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import {Canvas3DAdvancedProps, ConstructionMesh, ViewMode} from "@/screens/construction/type/editor/ThreeMesh";
// import {exportToGLB} from "@/screens/construction/features/editor/utils/export";

function threeMeshToConstructionMesh(mesh: THREE.Mesh): ConstructionMesh {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    return {
        name: mesh.name,
        geometry: {
            attributes: {
                position: {
                    array: geometry.attributes.position.array as Float32Array
                }
            }
        },
        position: {
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z
        },
        rotation: {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z
        },
        scale: {
            x: mesh.scale.x,
            y: mesh.scale.y,
            z: mesh.scale.z
        },
        castShadow: mesh.castShadow,
        receiveShadow: mesh.receiveShadow,
        visible: mesh.visible,
        material: mesh.material ? {
            wireframe: (mesh.material as THREE.MeshStandardMaterial).wireframe,
            color: (mesh.material as THREE.MeshStandardMaterial).color,
            metalness: (mesh.material as THREE.MeshStandardMaterial).metalness,
            roughness: (mesh.material as THREE.MeshStandardMaterial).roughness,
            clone: () => (mesh.material as THREE.MeshStandardMaterial).clone()
        } : undefined
    };
}

function FrameModel({frameWidth, frameHeight, beamThickness, viewMode = 'solid', onMeshesUpdate, onInfoUpdate, groupRef, onBeamClick}: { frameWidth: number; frameHeight: number; beamThickness: number; viewMode?: ViewMode; onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void; onInfoUpdate?: (info: string) => void; groupRef: React.MutableRefObject<THREE.Group | null>; onBeamClick?: (beamName: string) => void; }) {
    const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);
    const [selectedBeam, setSelectedBeam] = useState<string | null>(null);
    const outlinesRef = useRef<THREE.LineSegments[]>([]);

    const createHorizontalBeamTop45 = (width: number, thickness: number, depth: number) => {
        const shape = new THREE.Shape();
        const t = thickness;

        shape.moveTo(0, thickness);
        shape.lineTo(t, 0);
        shape.lineTo(width - t, 0);
        shape.lineTo(width, thickness);
        shape.lineTo(width, thickness);
        shape.lineTo(0, thickness);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false
        });

        geometry.center();
        return geometry;
    };

    const createHorizontalBeamBottom45 = (width: number, thickness: number, depth: number) => {
        const shape = new THREE.Shape();
        const t = thickness;

        shape.moveTo(0, 0);
        shape.lineTo(width, 0);
        shape.lineTo(width - t, thickness);
        shape.lineTo(t, thickness);
        shape.lineTo(0, 0);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false
        });

        geometry.center();
        return geometry;
    };

    const createVerticalBeamLeft45 = (height: number, thickness: number, depth: number) => {
        const shape = new THREE.Shape();
        const t = thickness;

        shape.moveTo(0, 0);
        shape.lineTo(thickness - t, 0);
        shape.lineTo(thickness, t);
        shape.lineTo(thickness, height - t);
        shape.lineTo(thickness - t, height);
        shape.lineTo(0, height);
        shape.lineTo(0, 0);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false
        });

        geometry.center();
        return geometry;
    };

    const createVerticalBeamRight45 = (height: number, thickness: number, depth: number) => {
        const shape = new THREE.Shape();
        const t = thickness;

        shape.moveTo(thickness, 0);
        shape.lineTo(t, 0);
        shape.lineTo(0, t);
        shape.lineTo(0, height - t);
        shape.lineTo(t, height);
        shape.lineTo(thickness, height);
        shape.lineTo(thickness, 0);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false
        });

        geometry.center();
        return geometry;
    };

    const getPartPriority = (name: string): number => {
        const priority: { [key: string]: number } = {
            'Верхня балка': 1,
            'Ліва балка': 2,
            'Нижня балка': 3,
            'Права балка': 4
        };
        return priority[name] ?? 99;
    };

    const beamColors: { [key: string]: number } = {
        'Верхня балка': 0x222222,
        'Нижня балка': 0x222222,
        'Ліва балка': 0x0000FF,
        'Права балка': 0x0000FF
    };

    useEffect(() => {
        if (!groupRef.current) return;

        const meshArray: THREE.Mesh[] = [];
        groupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.name.startsWith('outline')) {
                meshArray.push(child);
            }
        });

        const orderedMeshes = [...meshArray].sort((a, b) => {
            return getPartPriority(a.name) - getPartPriority(b.name);
        });

        setMeshes(meshArray);

        if (onMeshesUpdate) {
            const constructionMeshes = meshArray.map(threeMeshToConstructionMesh);
            const orderedConstructionMeshes = orderedMeshes.map(threeMeshToConstructionMesh);
            onMeshesUpdate(constructionMeshes, orderedConstructionMeshes);
        }
    }, [frameWidth, frameHeight, beamThickness]);

    useEffect(() => {
        meshes.forEach((mesh) => {
            const material = mesh.material as THREE.MeshStandardMaterial;
            mesh.visible = true;
            material.wireframe = viewMode === 'wireframe';
        });
    }, [viewMode, meshes]);

    useEffect(() => {
        outlinesRef.current.forEach(outline => {
            if (outline.parent) outline.parent.remove(outline);
        });
        outlinesRef.current = [];

        meshes.forEach((mesh) => {
            if (selectedBeam === mesh.name) {
                const edges = new THREE.EdgesGeometry(mesh.geometry);
                const outline = new THREE.LineSegments(
                    edges,
                    new THREE.LineBasicMaterial({ color: 0x00ff00 })
                );

                outline.position.copy(mesh.position);
                outline.rotation.copy(mesh.rotation);
                outline.scale.copy(mesh.scale);
                outline.name = `outline_${mesh.name}`;

                groupRef.current?.add(outline);
                outlinesRef.current.push(outline);
            }
        });
    }, [selectedBeam, meshes]);

    useFrame(() => {
        if (!onInfoUpdate || !groupRef.current) return;

        const box = new THREE.Box3().setFromObject(groupRef.current);
        const size = new THREE.Vector3();
        box.getSize(size);

        onInfoUpdate(`📦 Модель
📏 ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}
🟢 Виділена: ${selectedBeam ?? 'немає'}`);
    });

    const handleBeamClick = (beamName: string) => {
        setSelectedBeam(beamName);
        onBeamClick?.(beamName);
    };

    const createBeam = (name: string, geometry: THREE.BufferGeometry, position: [number, number, number]) => (
        <mesh
            key={name}
            name={name}
            geometry={geometry}
            position={position}
            castShadow
            receiveShadow
            onClick={(e) => {
                e.stopPropagation();
                handleBeamClick(name);
            }}
        >
            <meshStandardMaterial
                color={beamColors[name]}
                metalness={0.2}
                roughness={0.6}
            />
        </mesh>
    );

    return (
        <group ref={groupRef}>
            {createBeam(
                'Верхня балка',
                createHorizontalBeamTop45(frameWidth, beamThickness, beamThickness),
                [0, frameHeight / 2 - beamThickness / 2, 0]
            )}

            {createBeam(
                'Нижня балка',
                createHorizontalBeamBottom45(frameWidth, beamThickness, beamThickness),
                [0, -frameHeight / 2 + beamThickness / 2, 0]
            )}

            {createBeam(
                'Ліва балка',
                createVerticalBeamLeft45(frameHeight, beamThickness, beamThickness),
                [-frameWidth / 2 + beamThickness / 2, 0, 0]
            )}

            {createBeam(
                'Права балка',
                createVerticalBeamRight45(frameHeight, beamThickness, beamThickness),
                [frameWidth / 2 - beamThickness / 2, 0, 0]
            )}
        </group>
    );
}

function CameraAndControls({frameWidth, frameHeight, beamThickness}: { frameWidth: number; frameHeight: number; beamThickness: number; }) {
    const { camera } = useThree<{ camera: THREE.PerspectiveCamera }>();
    const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

    useEffect(() => {
        const maxDim = Math.max(frameWidth, frameHeight, beamThickness);
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        cameraDistance *= 2;

        camera.position.set(0, 0, cameraDistance);
        camera.near = cameraDistance / 100;
        camera.far = cameraDistance * 100;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);

        if (orbitRef.current) {
            orbitRef.current.target.set(0, 0, 0);
            orbitRef.current.update();
        }
    }, [frameWidth, frameHeight, beamThickness, camera]);

    return (
        <OrbitControls
            ref={orbitRef}
            enableDamping
            dampingFactor={0.05}
        />
    );
}

function SceneContent({frameWidth, frameHeight, beamThickness, viewMode, transformMode, onMeshesUpdate, onInfoUpdate, onBeamClick, groupRef}: Canvas3DAdvancedProps & { groupRef: React.MutableRefObject<THREE.Group | null> }) {
    const transformRef = useRef<React.ComponentRef<typeof TransformControls>>(null);

    useEffect(() => {
        const transform = transformRef.current;
        if (!transform || !groupRef.current) return;

        console.log('🔧 Attaching group to transform');
        transform.attach(groupRef.current);

        return () => {
            console.log('🧹 Detaching group');
            transform.detach();
        };
    }, []);

    return (
        <>
            <color attach="background" args={[0x23272f]} />
            <ambientLight intensity={0.6} color={0xffffff} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow color={0xffffff} />

            <CameraAndControls
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                beamThickness={beamThickness}
            />

            {transformMode !== 'none' && (
                <TransformControls
                    ref={transformRef}
                    mode={transformMode}
                />
            )}

            <FrameModel
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                beamThickness={beamThickness}
                viewMode={viewMode}
                onMeshesUpdate={onMeshesUpdate}
                onInfoUpdate={onInfoUpdate}
                groupRef={groupRef}
                onBeamClick={onBeamClick}
            />
        </>
    );
}

export default function Canvas3DAdvanced({frameWidth, frameHeight, beamThickness, sawThickness, viewMode = 'solid', transformMode = 'none', onMeshesUpdate, onInfoUpdate, onBeamClick}: Canvas3DAdvancedProps) {
    const groupRef = useRef<THREE.Group>(null);

    // const handleExport = (format: 'fbx' | 'glb') => {
    //     if (format === 'fbx') {
    //         // exportToFBX(groupRef, 'my-frame-model.fbx');
    //     } else if (format === 'glb') {
    //         exportToGLB(groupRef, 'my-frame-model.glb');
    //     }
    // };

    return (
        // <div className="w-full h-full flex flex-col">
        //     <div className="p-4 bg-gray-800 flex gap-2">
        //         <button
        //             onClick={() => handleExport('fbx')}
        //             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        //         >
        //             📥 Експорт FBX
        //         </button>
        //         <button
        //             onClick={() => handleExport('glb')}
        //             className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        //         >
        //             📥 Експорт GLB
        //         </button>
        //     </div>
        //
        //     <Canvas
        //         className="w-full flex-1"
        //         shadows
        //         camera={{
        //             position: [4, 4, 6],
        //             fov: 50,
        //             near: 0.1,
        //             far: 1000
        //         }}
        //     >
        //         <SceneContent
        //             frameWidth={frameWidth}
        //             frameHeight={frameHeight}
        //             beamThickness={beamThickness}
        //             sawThickness={sawThickness}
        //             viewMode={viewMode}
        //             transformMode={transformMode}
        //             onMeshesUpdate={onMeshesUpdate}
        //             onInfoUpdate={onInfoUpdate}
        //             onBeamClick={onBeamClick}
        //             groupRef={groupRef}
        //         />
        //     </Canvas>
        // </div>
        <Canvas
            className="w-full flex-1"
            shadows
            camera={{
                position: [4, 4, 6],
                fov: 50,
                near: 0.1,
                far: 1000
            }}
        >
            <SceneContent
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                beamThickness={beamThickness}
                sawThickness={sawThickness}
                viewMode={viewMode}
                transformMode={transformMode}
                onMeshesUpdate={onMeshesUpdate}
                onInfoUpdate={onInfoUpdate}
                onBeamClick={onBeamClick}
                groupRef={groupRef}
            />
        </Canvas>
    );
}