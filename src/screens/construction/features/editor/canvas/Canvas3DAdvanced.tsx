'use client'

import * as THREE from 'three';
import React, {useRef, useEffect, useState, useMemo} from 'react';
import {Canvas, ThreeEvent, useFrame, useThree} from '@react-three/fiber';
import {Html, OrbitControls, TransformControls} from '@react-three/drei';
import {Canvas3DAdvancedProps, ConstructionMesh, ViewMode} from "@/screens/construction/type/editor/ThreeMesh";
import {BEAM_NAMES} from "@/screens/construction/constants/beamConstants";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {DrillDefaultParameters} from "@/screens/construction/features/editor/panels/ParametersPanel";

const HandleSideEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
}

export type HandleSideEnum = typeof HandleSideEnum[keyof typeof HandleSideEnum];

interface ModelDimensions {
    width: number;
    height: number;
    depth: number;
}

const MODEL_TO_BEAM_NAME_MAP: Record<string, string> = {
    'Нижня_балка': BEAM_NAMES.BOTTOM,
    'Верхня_балка': BEAM_NAMES.TOP,
    'Права_балка': BEAM_NAMES.RIGHT,
    'Ліва_балка': BEAM_NAMES.LEFT
};

function centerModel(model: THREE.Group): ModelDimensions {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    return {
        width: size.x,
        height: size.y,
        depth: size.z
    };
}

async function loadGLBModel(fileUrl: string): Promise<{ model: THREE.Group; dimensions: ModelDimensions } | null> {
    try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                fileUrl,
                (gltf) => {
                    const object = gltf.scene;

                    console.log('✅ GLB model loaded successfully:', fileUrl);
                    console.log('📦 Model children count:', object.children.length);

                    object.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const originalName = child.name;
                            const newName = MODEL_TO_BEAM_NAME_MAP[originalName];

                            if (newName) {
                                console.log(`🔄 Renaming mesh: ${originalName} → ${newName}`);
                                child.name = newName;
                            }
                        }
                    });

                    const dimensions = centerModel(object);

                    resolve({
                        model: object,
                        dimensions: dimensions
                    });
                },
                (progress) => {
                    console.log(
                        `📥 Loading: ${Math.round(
                            (progress.loaded / progress.total) * 100
                        )}%`
                    );
                },
                (error) => {
                    console.error('❌ Error loading GLB:', error);
                    reject(error);
                }
            );
        });
    } catch (error) {
        console.error('❌ Failed to load GLTFLoader or model:', error);
        return null;
    }
}

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

function BeamWithOutline({name, geometry, position, color, isSelected, onClick}: { name: string; geometry: THREE.BufferGeometry; position: [number, number, number]; color: number; isSelected: boolean; onClick: () => void; }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const outlineRef = useRef<THREE.LineSegments | null>(null);

    useEffect(() => {
        if (!meshRef.current || !isSelected) {
            if (outlineRef.current) {
                outlineRef.current.parent?.remove(outlineRef.current);
                outlineRef.current.geometry.dispose();
                (outlineRef.current.material as THREE.Material).dispose();
                outlineRef.current = null;
            }
            return;
        }

        const edges = new THREE.EdgesGeometry(geometry);
        const outline = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
                color: 0x00ff00,
                linewidth: 2,
            })
        );

        meshRef.current.add(outline);
        outlineRef.current = outline;

        return () => {
            if (outlineRef.current) {
                outlineRef.current.parent?.remove(outlineRef.current);
                outlineRef.current.geometry.dispose();
                (outlineRef.current.material as THREE.Material).dispose();
                outlineRef.current = null;
            }
        };
    }, [isSelected, geometry]);

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                name={name}
                geometry={geometry}
                castShadow
                receiveShadow
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <meshStandardMaterial
                    color={color}
                    metalness={0.3}
                    roughness={0.8}
                />
            </mesh>
        </group>
    );
}

function SelectiveOutlines({model, selectedPartName}: { model: THREE.Group; selectedPartName: string; }) {
    useEffect(() => {
        if (!model) return;

        const meshesToOutline: THREE.Mesh[] = [];

        model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name === selectedPartName) {
                meshesToOutline.push(child);
            }
        });

        console.log(`🎯 Creating outlines for ${meshesToOutline.length} meshes:`, selectedPartName);

        meshesToOutline.forEach((mesh) => {
            const edges = new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry);
            const outline = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({
                    color: 0x00ff00,
                    linewidth: 2,
                    depthTest: true,
                })
            );

            mesh.add(outline);
        });

        return () => {
            meshesToOutline.forEach((mesh) => {
                const childrenToRemove: THREE.Object3D[] = [];
                mesh.children.forEach((child) => {
                    if (child instanceof THREE.LineSegments) {
                        childrenToRemove.push(child);
                    }
                });

                childrenToRemove.forEach((child) => {
                    mesh.remove(child);
                    if (child instanceof THREE.LineSegments) {
                        child.geometry.dispose();
                        (child.material as THREE.Material).dispose();
                    }
                });
            });
        };
    }, [model, selectedPartName]);

    return null;
}

function ImportedModelWrapper({model, originalDimensions, targetWidth, targetHeight, targetDepth, selectedPart, onPartClick}: { model: THREE.Group | null; originalDimensions: ModelDimensions | null; targetWidth: number; targetHeight: number; targetDepth: number; selectedPart: string | null; onPartClick: (partName: string) => void; }) {
    const processedModel = useMemo(() => {
        if (!model || !originalDimensions) return null;

        console.log('='.repeat(80));
        console.log('🚀 ПОЧАТОК ОБРОБКИ');
        console.log('='.repeat(80));
        console.log('📊 Original dimensions:', originalDimensions);
        console.log('🎯 Target dimensions:', { targetWidth, targetHeight, targetDepth });

        const cloned = model.clone(true);

        const scaleX = targetWidth / originalDimensions.width;
        const scaleY = targetHeight / originalDimensions.height;
        const scaleZ = targetDepth / originalDimensions.depth;

        console.log('📐 Scale factors:', { scaleX, scaleY, scaleZ });

        const initialPositions: Record<string, THREE.Vector3> = {};

        cloned.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                initialPositions[child.name] = child.position.clone();
                console.log(`📍 Початкова позиція ${child.name}:`, {
                    x: child.position.x.toFixed(2),
                    y: child.position.y.toFixed(2),
                    z: child.position.z.toFixed(2)
                });
            }
        });

        const beamsInfo: Record<string, {
            bbox: THREE.Box3;
            center: THREE.Vector3;
            size: THREE.Vector3;
            mesh: THREE.Mesh;
            initialPos: THREE.Vector3;
        }> = {};

        console.log('\n📦 ЕТАП 1: МАСШТАБУВАННЯ ГЕОМЕТРІЇ');
        console.log('-'.repeat(80));

        cloned.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const mesh = child as THREE.Mesh;

            if (!mesh.userData.originalGeometry) {
                mesh.userData.originalGeometry = mesh.geometry.clone();
            }

            mesh.geometry.dispose();
            mesh.geometry = mesh.userData.originalGeometry.clone();

            const geometry = mesh.geometry as THREE.BufferGeometry;
            const position = geometry.attributes.position as THREE.BufferAttribute;

            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox!;

            const geoWidth = bbox.max.x - bbox.min.x;
            const geoHeight = bbox.max.y - bbox.min.y;

            const holeZoneX = geoWidth * 0.25;
            const holeZoneY = geoHeight * 0.25;

            for (let i = 0; i < position.count; i++) {
                let x = position.getX(i);
                let y = position.getY(i);
                let z = position.getZ(i);

                // ГОРИЗОНТАЛЬНІ БАЛКИ
                if (mesh.name === BEAM_NAMES.TOP || mesh.name === BEAM_NAMES.BOTTOM) {
                    const isLeftZone = (x - bbox.min.x) < holeZoneX;
                    const isRightZone = (bbox.max.x - x) < holeZoneX;

                    if (isLeftZone) {
                        const dist = x - bbox.min.x;
                        x = bbox.min.x * scaleX + dist;
                    } else if (isRightZone) {
                        const dist = bbox.max.x - x;
                        x = bbox.max.x * scaleX - dist;
                    } else {
                        x *= scaleX;
                    }

                    z *= scaleZ;
                }

                if (mesh.name === BEAM_NAMES.LEFT || mesh.name === BEAM_NAMES.RIGHT) {
                    const isTopZone = (bbox.max.y - y) < holeZoneY;
                    const isBottomZone = (y - bbox.min.y) < holeZoneY;

                    if (isTopZone) {
                        const dist = bbox.max.y - y;
                        y = bbox.max.y * scaleY - dist;
                    } else if (isBottomZone) {
                        const dist = y - bbox.min.y;
                        y = bbox.min.y * scaleY + dist;
                    } else {
                        y *= scaleY;
                    }

                    z *= scaleZ;
                }

                position.setXYZ(i, x, y, z);
            }

            position.needsUpdate = true;
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();

            const newBbox = geometry.boundingBox!.clone();
            const center = new THREE.Vector3();
            newBbox.getCenter(center);
            const size = new THREE.Vector3();
            newBbox.getSize(size);

            beamsInfo[mesh.name] = {
                bbox: newBbox,
                center,
                size,
                mesh,
                initialPos: initialPositions[mesh.name]
            };

            console.log(`\n🔧 ${mesh.name}:`);
            console.log('   Геометрія center:', { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) });
            console.log('   Геометрія size:', { x: size.x.toFixed(2), y: size.y.toFixed(2) });
        });

        console.log('\n' + '='.repeat(80));
        console.log('📍 ЕТАП 2: РОЗРАХУНОК ПОЗИЦІЙ');
        console.log('='.repeat(80));

        cloned.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const mesh = child as THREE.Mesh;
            const info = beamsInfo[mesh.name];
            if (!info) return;

            const geomCenterX = info.center.x;
            const geomCenterY = info.center.y;
            const geomCenterZ = info.center.z;

            const beamWidth = info.size.x;
            const beamHeight = info.size.y;

            console.log(`\n📦 ${mesh.name}:`);
            console.log('   Початкова позиція з GLB:', {
                x: info.initialPos.x.toFixed(2),
                y: info.initialPos.y.toFixed(2),
                z: info.initialPos.z.toFixed(2)
            });

            let newPosX = 0;
            let newPosY = 0;
            let newPosZ = 0;

            if (mesh.name === BEAM_NAMES.LEFT) {
                // При original розмірах: центр балки на -originalWidth/2 + beamWidth/2
                // При target розмірах: центр балки на -targetWidth/2 + beamWidth/2
                // Зміна = нова позиція - стара позиція
                const originalCenterX = -originalDimensions.width / 2 + beamWidth / 2;
                const targetCenterX = -targetWidth / 2 + beamWidth / 2;
                const deltaX = targetCenterX - originalCenterX;

                newPosX = info.initialPos.x + deltaX - geomCenterX;
                newPosY = info.initialPos.y - geomCenterY;
                newPosZ = info.initialPos.z - geomCenterZ;

                console.log('   🔷 LEFT балка:');
                console.log('      Original center X:', originalCenterX.toFixed(2));
                console.log('      Target center X:', targetCenterX.toFixed(2));
                console.log('      Delta X:', deltaX.toFixed(2));
                console.log('      Фінальна mesh.position.x:', newPosX.toFixed(2));
            }
            else if (mesh.name === BEAM_NAMES.RIGHT) {
                const originalCenterX = originalDimensions.width / 2 - beamWidth / 2;
                const targetCenterX = targetWidth / 2 - beamWidth / 2;
                const deltaX = targetCenterX - originalCenterX;

                newPosX = info.initialPos.x + deltaX - geomCenterX;
                newPosY = info.initialPos.y - geomCenterY;
                newPosZ = info.initialPos.z - geomCenterZ;

                console.log('   🔷 RIGHT балка:');
                console.log('      Original center X:', originalCenterX.toFixed(2));
                console.log('      Target center X:', targetCenterX.toFixed(2));
                console.log('      Delta X:', deltaX.toFixed(2));
                console.log('      Фінальна mesh.position.x:', newPosX.toFixed(2));
            }
            else if (mesh.name === BEAM_NAMES.TOP) {
                const originalCenterY = originalDimensions.height / 2 - beamHeight / 2;
                const targetCenterY = targetHeight / 2 - beamHeight / 2;
                const deltaY = targetCenterY - originalCenterY;

                newPosX = info.initialPos.x - geomCenterX;
                newPosY = info.initialPos.y + deltaY - geomCenterY;
                newPosZ = info.initialPos.z - geomCenterZ;

                console.log('   🔷 TOP балка:');
                console.log('      Original center Y:', originalCenterY.toFixed(2));
                console.log('      Target center Y:', targetCenterY.toFixed(2));
                console.log('      Delta Y:', deltaY.toFixed(2));
                console.log('      Фінальна mesh.position.y:', newPosY.toFixed(2));
            }
            else if (mesh.name === BEAM_NAMES.BOTTOM) {
                const originalCenterY = -originalDimensions.height / 2 + beamHeight / 2;
                const targetCenterY = -targetHeight / 2 + beamHeight / 2;
                const deltaY = targetCenterY - originalCenterY;

                newPosX = info.initialPos.x - geomCenterX;
                newPosY = info.initialPos.y + deltaY - geomCenterY;
                newPosZ = info.initialPos.z - geomCenterZ;

                console.log('   🔷 BOTTOM балка:');
                console.log('      Original center Y:', originalCenterY.toFixed(2));
                console.log('      Target center Y:', targetCenterY.toFixed(2));
                console.log('      Delta Y:', deltaY.toFixed(2));
                console.log('      Фінальна mesh.position.y:', newPosY.toFixed(2));
            }

            mesh.position.set(newPosX, newPosY, newPosZ);
            console.log('   ✅ Встановлена позиція:', { x: newPosX.toFixed(2), y: newPosY.toFixed(2), z: newPosZ.toFixed(2) });
        });

        console.log('\n' + '='.repeat(80));
        console.log('✅ ЕТАП 3: ФІНАЛЬНА ПЕРЕВІРКА');
        console.log('='.repeat(80));

        const finalBox = new THREE.Box3().setFromObject(cloned);
        const finalSize = new THREE.Vector3();
        finalBox.getSize(finalSize);

        console.log('\n🌍 Фінальний BBox всієї рами:');
        console.log('   Min:', { x: finalBox.min.x.toFixed(2), y: finalBox.min.y.toFixed(2), z: finalBox.min.z.toFixed(2) });
        console.log('   Max:', { x: finalBox.max.x.toFixed(2), y: finalBox.max.y.toFixed(2), z: finalBox.max.z.toFixed(2) });
        console.log('   Size:', { x: finalSize.x.toFixed(2), y: finalSize.y.toFixed(2), z: finalSize.z.toFixed(2) });
        console.log('\n🎯 Очікувані розміри:');
        console.log('   Width:', targetWidth.toFixed(2));
        console.log('   Height:', targetHeight.toFixed(2));
        console.log('   Depth:', targetDepth.toFixed(2));
        console.log('\n📊 Різниця:');
        console.log('   ΔWidth:', (finalSize.x - targetWidth).toFixed(2));
        console.log('   ΔHeight:', (finalSize.y - targetHeight).toFixed(2));
        console.log('   ΔDepth:', (finalSize.z - targetDepth).toFixed(2));

        if (beamsInfo[BEAM_NAMES.LEFT] && beamsInfo[BEAM_NAMES.RIGHT]) {
            const leftMesh = beamsInfo[BEAM_NAMES.LEFT].mesh;
            const rightMesh = beamsInfo[BEAM_NAMES.RIGHT].mesh;

            const leftWorldPos = new THREE.Vector3();
            const rightWorldPos = new THREE.Vector3();
            leftMesh.getWorldPosition(leftWorldPos);
            rightMesh.getWorldPosition(rightWorldPos);

            console.log('\n📏 Світові позиції центрів балок:');
            console.log('   LEFT center:', leftWorldPos.x.toFixed(2));
            console.log('   RIGHT center:', rightWorldPos.x.toFixed(2));
            console.log('   Відстань між центрами:', Math.abs(rightWorldPos.x - leftWorldPos.x).toFixed(2));
        }

        console.log('\n' + '='.repeat(80) + '\n');

        return cloned;

    }, [model, originalDimensions, targetWidth, targetHeight, targetDepth]);

    const handleMeshClick = (event: ThreeEvent<MouseEvent>) => {
        if (event.object instanceof THREE.Mesh) {
            event.stopPropagation();
            onPartClick(event.object.name || 'unknown');
        }
    };

    if (!processedModel) return null;

    return (
        <>
            <group onClick={handleMeshClick}>
                <primitive object={processedModel} />
            </group>

            {selectedPart && (
                <SelectiveOutlines
                    model={processedModel}
                    selectedPartName={selectedPart}
                />
            )}
        </>
    );
}

function HandleMesh({beamThickness, frameWidth, frameHeight, hasHandle, handleSide, handleOffset, handlePosition, isSelected, onClick}: { beamThickness: number; frameWidth: number; frameHeight: number; hasHandle?: boolean; handleSide?: HandleSideEnum; handleOffset?: number; handlePosition?: number; isSelected: boolean; onClick: () => void; }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const outlineRef = useRef<THREE.LineSegments | null>(null);

    const { geo, pos } = useMemo(() => {
        const t = beamThickness;

        const handleWidth = handleOffset || 160;
        const side = handleSide ?? HandleSideEnum.RIGHT;
        const isVerticalBeam = side === HandleSideEnum.LEFT || side === HandleSideEnum.RIGHT;

        const backPlateThick = t * 0.05;
        const legDepth       = t * 0.55;
        const legThick       = t * 0.08;
        const profileHeight  = t * 0.90;
        const gap            = t * 0.015;

        let posX: number;
        let posY: number;
        const posZ = 0;

        if (isVerticalBeam) {
            const beamEdgeX = side === HandleSideEnum.RIGHT
                ?  frameWidth / 2
                : -frameWidth / 2;

            posX = side === HandleSideEnum.RIGHT
                ? beamEdgeX + gap + backPlateThick / 2
                : beamEdgeX - gap - backPlateThick / 2;

            const bottomEdge = -frameHeight / 2;
            posY = handlePosition != null ? bottomEdge + handlePosition : 0;
        } else {
            const beamEdgeY = side === HandleSideEnum.TOP
                ?  frameHeight / 2
                : -frameHeight / 2;

            posY = side === HandleSideEnum.TOP
                ? beamEdgeY + gap + backPlateThick / 2
                : beamEdgeY - gap - backPlateThick / 2;

            const leftEdge = -frameWidth / 2;
            posX = handlePosition != null ? leftEdge + handlePosition : 0;
        }

        let gBack: THREE.BoxGeometry;
        let gLeg1: THREE.BoxGeometry;
        let gLeg2: THREE.BoxGeometry;

        const dir = (side === HandleSideEnum.RIGHT || side === HandleSideEnum.TOP) ? 1 : -1;

        if (isVerticalBeam) {
            gBack = new THREE.BoxGeometry(backPlateThick, handleWidth, profileHeight);

            gLeg1 = new THREE.BoxGeometry(legDepth, handleWidth, legThick);
            gLeg1.translate(
                dir * (backPlateThick / 2 + legDepth / 2),
                0,
                profileHeight / 2 - legThick / 2
            );

            gLeg2 = new THREE.BoxGeometry(legDepth, handleWidth, legThick);
            gLeg2.translate(
                dir * (backPlateThick / 2 + legDepth / 2),
                0,
                -(profileHeight / 2 - legThick / 2)
            );
        } else {
            gBack = new THREE.BoxGeometry(handleWidth, backPlateThick, profileHeight);

            gLeg1 = new THREE.BoxGeometry(handleWidth, legDepth, legThick);
            gLeg1.translate(
                0,
                dir * (backPlateThick / 2 + legDepth / 2),
                profileHeight / 2 - legThick / 2
            );

            gLeg2 = new THREE.BoxGeometry(handleWidth, legDepth, legThick);
            gLeg2.translate(
                0,
                dir * (backPlateThick / 2 + legDepth / 2),
                -(profileHeight / 2 - legThick / 2)
            );
        }

        const merged = mergeGeometries([gBack, gLeg1, gLeg2], false);
        gBack.dispose(); gLeg1.dispose(); gLeg2.dispose();

        return {
            geo: merged,
            pos: [posX, posY, posZ] as [number, number, number],
        };
    }, [beamThickness, frameWidth, frameHeight, handleSide, handlePosition, handleOffset]);

    useEffect(() => {
        if (outlineRef.current) {
            outlineRef.current.parent?.remove(outlineRef.current);
            outlineRef.current.geometry.dispose();
            (outlineRef.current.material as THREE.Material).dispose();
            outlineRef.current = null;
        }

        if (!meshRef.current || !isSelected || !geo) return;

        const edges   = new THREE.EdgesGeometry(geo);
        const outline = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
        );

        meshRef.current.add(outline);
        outlineRef.current = outline;

        return () => {
            if (outlineRef.current) {
                outlineRef.current.parent?.remove(outlineRef.current);
                outlineRef.current.geometry.dispose();
                (outlineRef.current.material as THREE.Material).dispose();
                outlineRef.current = null;
            }
        };
    }, [isSelected, geo]);

    if (!hasHandle || !geo) return null;

    return (
        <mesh
            ref={meshRef}
            name="Ручка"
            geometry={geo}
            position={pos}
            castShadow
            receiveShadow
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <meshStandardMaterial
                color={0xC0C0C0}
                metalness={0.80}
                roughness={0.12}
            />
        </mesh>
    );
}

function GlassMesh({frameWidth, frameHeight, beamThickness, isSelected, onClick}: { frameWidth: number; frameHeight: number; beamThickness: number; isSelected: boolean; onClick: () => void; }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const outlineRef = useRef<THREE.LineSegments | null>(null);

    const glassWidth = frameWidth - beamThickness;
    const glassHeight = frameHeight - beamThickness;
    const glassDepth = beamThickness * 0.1;

    const geometry = useMemo(() => {
        return new THREE.BoxGeometry(glassWidth, glassHeight, glassDepth);
    }, [glassWidth, glassHeight, glassDepth]);

    useEffect(() => {
        if (!meshRef.current || !isSelected) {
            if (outlineRef.current) {
                outlineRef.current.parent?.remove(outlineRef.current);
                outlineRef.current.geometry.dispose();
                (outlineRef.current.material as THREE.Material).dispose();
                outlineRef.current = null;
            }
            return;
        }

        const edges = new THREE.EdgesGeometry(geometry);
        const outline = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
                color: 0x00ff00,
                linewidth: 2,
            })
        );

        meshRef.current.add(outline);
        outlineRef.current = outline;

        return () => {
            if (outlineRef.current) {
                outlineRef.current.parent?.remove(outlineRef.current);
                outlineRef.current.geometry.dispose();
                (outlineRef.current.material as THREE.Material).dispose();
                outlineRef.current = null;
            }
        };
    }, [isSelected, geometry]);

    return (
        <mesh
            ref={meshRef}
            name="Скло"
            geometry={geometry}
            position={[0, 0, 0]}
            castShadow
            receiveShadow
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <meshStandardMaterial
                color={0xccccff}
                metalness={0.1}
                roughness={0.1}
                transparent={true}
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

function HingeNotchesMesh({ frameWidth, frameHeight, beamThickness, handleSide, hasHandle }: { frameWidth: number; frameHeight: number; beamThickness: number; handleSide?: HandleSideEnum; hasHandle?: boolean; }) {
    const notches = useMemo(() => {
        if (!hasHandle || !handleSide) return [];

        const t = beamThickness;

        const notchLength = t * 0.55;
        const notchHeight = t * 0.18;
        const notchDepth  = t * 0.12;
        const edgeOffset  = t * 0.6;

        const halfW = frameWidth / 2;
        const halfH = frameHeight / 2;
        const frontZ = t / 2 + notchDepth / 2;

        const hingeSide =
            handleSide === HandleSideEnum.LEFT  ? HandleSideEnum.RIGHT  :
                handleSide === HandleSideEnum.RIGHT ? HandleSideEnum.LEFT   :
                    handleSide === HandleSideEnum.TOP   ? HandleSideEnum.BOTTOM :
                        HandleSideEnum.TOP;

        type Notch = {
            pos: [number, number, number];
            size: [number, number, number];
            rotZ?: number;
        };

        const result: Notch[] = [];

        if (hingeSide === HandleSideEnum.RIGHT || hingeSide === HandleSideEnum.LEFT) {
            const signX = hingeSide === HandleSideEnum.RIGHT ? 1 : -1;
            const beamCenterX = signX * (halfW - t / 2);

            result.push({
                pos: [beamCenterX, halfH - edgeOffset, frontZ],
                size: [notchHeight, notchLength, notchDepth],
            });
            result.push({
                pos: [beamCenterX, -halfH + edgeOffset, frontZ],
                size: [notchHeight, notchLength, notchDepth],
            });

            result.push({
                pos: [signX * (halfW - edgeOffset), halfH - t / 2, frontZ],
                size: [notchLength, notchHeight, notchDepth],
            });
            result.push({
                pos: [signX * (halfW - edgeOffset), -halfH + t / 2, frontZ],
                size: [notchLength, notchHeight, notchDepth],
            });
        }

        if (hingeSide === HandleSideEnum.TOP || hingeSide === HandleSideEnum.BOTTOM) {
            const signY = hingeSide === HandleSideEnum.TOP ? 1 : -1;
            const beamCenterY = signY * (halfH - t / 2);

            result.push({
                pos: [halfW - edgeOffset, beamCenterY, frontZ],
                size: [notchLength, notchHeight, notchDepth],
            });
            result.push({
                pos: [-halfW + edgeOffset, beamCenterY, frontZ],
                size: [notchLength, notchHeight, notchDepth],
            });

            result.push({
                pos: [halfW - t / 2, signY * (halfH - edgeOffset), frontZ],
                size: [notchHeight, notchLength, notchDepth],
            });
            result.push({
                pos: [-halfW + t / 2, signY * (halfH - edgeOffset), frontZ],
                size: [notchHeight, notchLength, notchDepth],
            });
        }

        return result;
    }, [frameWidth, frameHeight, beamThickness, handleSide, hasHandle]);

    return (
        <>
            {notches.map((n, i) => (
                <mesh key={i} position={n.pos}>
                    <boxGeometry args={n.size} />
                    <meshStandardMaterial
                        color={0x111111}
                        metalness={0.2}
                        roughness={0.95}
                        depthWrite={true}
                    />
                </mesh>
            ))}
        </>
    );
}

function FrameModel({frameWidth, frameHeight, beamThickness, viewMode = 'solid', onMeshesUpdate, onInfoUpdate, groupRef, onBeamClick, selectedBeamName, importedModel, originalDimensions, modelLoading, modelError, hasHandle, handleSide, handleOffset, handlePosition, drillParams }: {
        frameWidth: number;
        frameHeight: number;
        beamThickness: number;
        viewMode?: ViewMode;
        onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void;
        onInfoUpdate?: (info: string) => void;
        groupRef: React.MutableRefObject<THREE.Group | null>;
        onBeamClick?: (beamName: string | null) => void;
        selectedBeamName?: string | null;
        importedModel?: THREE.Group | null;
        originalDimensions?: ModelDimensions | null;
        modelLoading?: boolean;
        modelError?: string | null;
        hasHandle?: boolean;
        handleSide?: HandleSideEnum;
        handleOffset?: number;
        handlePosition?: number;
        drillParams?: DrillDefaultParameters;
    }) {
    const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);
    const [selectedModelPart, setSelectedModelPart] = useState<string | null>(null);

    const createHorizontalBeam45 = (
        width: number,
        thickness: number,
        depth: number,
        isTop: boolean,
        startCount: number,
        endCount: number,
        holeOffsetY?: number,
        startOffsets?: number[],
        endOffsets?: number[],
    ) => {
        const shape = new THREE.Shape();
        const t = thickness;

        if (isTop) {
            shape.moveTo(0, thickness);
            shape.lineTo(t, 0);
            shape.lineTo(width - t, 0);
            shape.lineTo(width, thickness);
            shape.lineTo(width, thickness);
            shape.lineTo(0, thickness);
        } else {
            shape.moveTo(0, 0);
            shape.lineTo(width, 0);
            shape.lineTo(width - t, thickness);
            shape.lineTo(t, thickness);
            shape.lineTo(0, 0);
        }

        const holeRadius = thickness * 0.15;
        const holeY      = holeOffsetY ?? thickness * 0.5;
        const edgeOffset = thickness * 1.5;
        const spacing    = thickness * 0.8;

        for (let i = 0; i < startCount; i++) {
            const hole = new THREE.Path();
            const offsetX = startOffsets?.[i] ?? (edgeOffset + i * spacing);
            hole.absarc(offsetX, holeY, holeRadius, 0, Math.PI * 2, false);
            shape.holes.push(hole);
        }

        for (let i = 0; i < endCount; i++) {
            const hole = new THREE.Path();
            const offsetX = endOffsets?.[i] ?? (edgeOffset + i * spacing);
            hole.absarc(width - offsetX, holeY, holeRadius, 0, Math.PI * 2, false);
            shape.holes.push(hole);
        }

        const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        geometry.center();
        return geometry;
    };

    const createVerticalBeam45 = (
        height: number,
        thickness: number,
        depth: number,
        isLeft: boolean,
        startCount: number,
        endCount: number,
        holeOffsetY?: number,
        startOffsets?: number[],
        endOffsets?: number[],
    ) => {
        const shape = new THREE.Shape();
        const t = thickness;

        if (isLeft) {
            shape.moveTo(0, 0);
            shape.lineTo(thickness - t, 0);
            shape.lineTo(thickness, t);
            shape.lineTo(thickness, height - t);
            shape.lineTo(thickness - t, height);
            shape.lineTo(0, height);
            shape.lineTo(0, 0);
        } else {
            shape.moveTo(thickness, 0);
            shape.lineTo(t, 0);
            shape.lineTo(0, t);
            shape.lineTo(0, height - t);
            shape.lineTo(t, height);
            shape.lineTo(thickness, height);
            shape.lineTo(thickness, 0);
        }

        const holeRadius = thickness * 0.15;
        const holeX      = holeOffsetY ?? thickness * 0.5;
        const edgeOffset = thickness * 1.5;
        const spacing    = thickness * 0.8;

        for (let i = 0; i < endCount; i++) {
            const hole = new THREE.Path();
            const offsetY = endOffsets?.[i] ?? (edgeOffset + i * spacing);
            hole.absarc(holeX, height - offsetY, holeRadius, 0, Math.PI * 2, false);
            shape.holes.push(hole);
        }

        for (let i = 0; i < startCount; i++) {
            const hole = new THREE.Path();
            const offsetY = startOffsets?.[i] ?? (edgeOffset + i * spacing);
            hole.absarc(holeX, offsetY, holeRadius, 0, Math.PI * 2, false);
            shape.holes.push(hole);
        }

        const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        geometry.center();
        return geometry;
    };

    const getPartPriority = (name: string): number => {
        const priority: Record<string, number> = {
            [BEAM_NAMES.TOP]: 1,
            [BEAM_NAMES.LEFT]: 2,
            [BEAM_NAMES.BOTTOM]: 3,
            [BEAM_NAMES.RIGHT]: 4,
            'Стекло': 0
        };
        return priority[name] ?? 99;
    };

    const beamColors: Record<string, number> = {
        [BEAM_NAMES.TOP]:    0xC0C0C0,
        [BEAM_NAMES.BOTTOM]: 0xC0C0C0,
        [BEAM_NAMES.LEFT]:   0xD0D0D0,
        [BEAM_NAMES.RIGHT]:  0xD0D0D0,
    };

    useEffect(() => {
        if (!groupRef.current) return;

        const meshArray: THREE.Mesh[] = [];
        groupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
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
    }, [frameWidth, frameHeight, beamThickness, importedModel]);

    useEffect(() => {
        meshes.forEach((mesh) => {
            const material = mesh.material as THREE.MeshStandardMaterial;
            mesh.visible = true;
            material.wireframe = viewMode === 'wireframe';
        });
    }, [viewMode, meshes]);

    const handleBeamClick = (beamName: string) => {
        setSelectedModelPart(null);
        onBeamClick?.(beamName);
    };

    const handleModelPartClick = (partName: string) => {
        setSelectedModelPart(partName);
        onBeamClick?.(null);
    };

    if (importedModel && !modelError && originalDimensions) {
        return (
            <ImportedModelWrapper
                model={importedModel}
                originalDimensions={originalDimensions}
                targetWidth={frameWidth}
                targetHeight={frameHeight}
                targetDepth={beamThickness}
                selectedPart={selectedModelPart}
                onPartClick={handleModelPartClick}
            />
        );
    }

    const topEdge    = drillParams?.TOP?.edge;
    const bottomEdge = drillParams?.BOTTOM?.edge;
    const leftEdge   = drillParams?.LEFT?.edge;
    const rightEdge  = drillParams?.RIGHT?.edge;

    const extractOffsets = (edge: Record<string, number | undefined> | undefined, prefix: 'startOffsetX' | 'endOffsetX', count: number): number[] => {
        if (!edge) return [];
        return Array.from({ length: count }, (_, i) => edge[`${prefix}${i + 1}`] as number).filter(v => v != null);
    };

    return (
        <>
            <BeamWithOutline
                name={BEAM_NAMES.TOP}
                geometry={createHorizontalBeam45(
                    frameWidth, beamThickness, beamThickness,
                    true,
                    Number(topEdge?.countEnd   ?? 3),
                    Number(topEdge?.countStart ?? 2),
                    topEdge?.offsetY,
                    extractOffsets(topEdge, 'endOffsetX',   Number(topEdge?.countEnd   ?? 3)),
                    extractOffsets(topEdge, 'startOffsetX', Number(topEdge?.countStart ?? 2)),
                )}
                position={[0, frameHeight/2 - beamThickness/2, 0]}
                color={beamColors[BEAM_NAMES.TOP]}
                isSelected={selectedBeamName === BEAM_NAMES.TOP}
                onClick={() => onBeamClick?.(BEAM_NAMES.TOP)}
            />
            <BeamWithOutline
                name={BEAM_NAMES.BOTTOM}
                geometry={createHorizontalBeam45(
                    frameWidth, beamThickness, beamThickness,
                    false,
                    Number(bottomEdge?.countStart ?? 3),
                    Number(bottomEdge?.countEnd   ?? 2),
                    bottomEdge?.offsetY,
                    extractOffsets(bottomEdge, 'startOffsetX', Number(bottomEdge?.countStart ?? 3)),
                    extractOffsets(bottomEdge, 'endOffsetX',   Number(bottomEdge?.countEnd   ?? 2)),
                )}
                position={[0, -frameHeight/2 + beamThickness/2, 0]}
                color={beamColors[BEAM_NAMES.BOTTOM]}
                isSelected={selectedBeamName === BEAM_NAMES.BOTTOM}
                onClick={() => onBeamClick?.(BEAM_NAMES.BOTTOM)}
            />
            <BeamWithOutline
                name={BEAM_NAMES.LEFT}
                geometry={createVerticalBeam45(
                    frameHeight, beamThickness, beamThickness,
                    true,
                    Number(leftEdge?.countStart ?? 2),
                    Number(leftEdge?.countEnd   ?? 2),
                    leftEdge?.offsetY,
                    extractOffsets(leftEdge, 'startOffsetX', Number(leftEdge?.countStart ?? 2)),
                    extractOffsets(leftEdge, 'endOffsetX',   Number(leftEdge?.countEnd   ?? 2)),
                )}
                position={[-frameWidth/2 + beamThickness/2, 0, 0]}
                color={beamColors[BEAM_NAMES.LEFT]}
                isSelected={selectedBeamName === BEAM_NAMES.LEFT}
                onClick={() => onBeamClick?.(BEAM_NAMES.LEFT)}
            />
            <BeamWithOutline
                name={BEAM_NAMES.RIGHT}
                geometry={createVerticalBeam45(
                    frameHeight, beamThickness, beamThickness,
                    false,
                    Number(rightEdge?.countStart ?? 1),
                    Number(rightEdge?.countEnd   ?? 1),
                    rightEdge?.offsetY,
                    extractOffsets(rightEdge, 'startOffsetX', Number(rightEdge?.countStart ?? 1)),
                    extractOffsets(rightEdge, 'endOffsetX',   Number(rightEdge?.countEnd   ?? 1)),
                )}
                position={[frameWidth/2 - beamThickness/2, 0, 0]}
                color={beamColors[BEAM_NAMES.RIGHT]}
                isSelected={selectedBeamName === BEAM_NAMES.RIGHT}
                onClick={() => onBeamClick?.(BEAM_NAMES.RIGHT)}
            />
            <HandleMesh
                beamThickness={beamThickness}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                hasHandle={hasHandle}
                handleSide={handleSide}
                handleOffset={handleOffset}
                handlePosition={handlePosition}
                isSelected={selectedBeamName === 'Ручка'}
                onClick={() => handleBeamClick('Ручка')}
            />
            <GlassMesh
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                beamThickness={beamThickness}
                isSelected={selectedBeamName === 'Скло'}
                onClick={() => handleBeamClick('Скло')}
            />
            {/*<HingeNotchesMesh*/}
            {/*    frameWidth={frameWidth}*/}
            {/*    frameHeight={frameHeight}*/}
            {/*    beamThickness={beamThickness}*/}
            {/*    handleSide={handleSide}*/}
            {/*    hasHandle={hasHandle}*/}
            {/*/>*/}
        </>
    );
}

function CameraAndControls({frameWidth, frameHeight, beamThickness}: { frameWidth: number; frameHeight: number; beamThickness: number; }) {
    const { camera } = useThree<{ camera: THREE.PerspectiveCamera }>();
    const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

    useEffect(() => {
        const maxDim = Math.max(frameWidth, frameHeight, beamThickness);
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        cameraDistance *= 2.2;

        camera.position.set(0, 0, cameraDistance * 1.0);
        camera.near = cameraDistance / 100;
        camera.far = cameraDistance * 100;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);

        if (orbitRef.current) {
            orbitRef.current.target.set(0, 0, 0);
            orbitRef.current.update();
        }
    }, [frameWidth, frameHeight, beamThickness, camera]);

    return <OrbitControls ref={orbitRef} />;
}

function AxesWithLabels({ size = 100 }: { size?: number }) {
    return (
        <group>
            {/* X axis - Red */}
            <arrowHelper args={[
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, 0, 0),
                size,
                0xff0000,
                size * 0.2,
                size * 0.1
            ]} />
            <Html position={[size * 1.1, 0, 0]} center>
                <div style={{
                    color: '#ff0000',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    fontFamily: 'Arial',
                    userSelect: 'none',
                    pointerEvents: 'none'
                }}>
                    X
                </div>
            </Html>

            {/* Y axis - Green */}
            <arrowHelper args={[
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(0, 0, 0),
                size,
                0x00ff00,
                size * 0.2,
                size * 0.1
            ]} />
            <Html position={[0, size * 1.1, 0]} center>
                <div style={{
                    color: '#00ff00',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    fontFamily: 'Arial',
                    userSelect: 'none',
                    pointerEvents: 'none'
                }}>
                    Y
                </div>
            </Html>

            {/* Z axis - Blue */}
            <arrowHelper args={[
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(0, 0, 0),
                size,
                0x0000ff,
                size * 0.2,
                size * 0.1
            ]} />
            <Html position={[0, 0, size * 1.1]} center>
                <div style={{
                    color: '#0000ff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    fontFamily: 'Arial',
                    userSelect: 'none',
                    pointerEvents: 'none'
                }}>
                    Z
                </div>
            </Html>
        </group>
    );
}

function DimensionLines({
                            frameWidth, frameHeight, beamThickness,
                            hasHandle, handleSide, handleOffset, handlePosition,
                            drillParams,
                        }: {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    drillParams?: DrillDefaultParameters;
}) {
    const { camera, size } = useThree();

    type Pt = { x: number; y: number };

    const [hoveredHole, setHoveredHole] = useState<{
        pt: Pt;
        label: string;
        direction: 'top' | 'bottom' | 'left' | 'right';
    } | null>(null);

    const [lines, setLines] = useState<{
        topLeft:       Pt;
        topRight:      Pt;
        botLeft:       Pt;
        botRight:      Pt;
        rtTopOuter:    Pt;
        handleCenter?:   Pt;
        handleStart?:    Pt;
        handleEnd?:      Pt;
        handlePosStart?: Pt;
        handlePosEnd?:   Pt;
        topHoles:    Pt[];
        bottomHoles: Pt[];
        leftHoles:   Pt[];
        rightHoles:  Pt[];
    } | null>(null);

    useFrame(() => {
        const project = (x: number, y: number, z = 0): Pt => {
            const v = new THREE.Vector3(x, y, z).project(camera);
            return {
                x: (v.x * 0.5 + 0.5) * size.width,
                y: (-v.y * 0.5 + 0.5) * size.height,
            };
        };

        const hw = frameWidth / 2;
        const hh = frameHeight / 2;
        const bt = beamThickness;

        const extractOffsets = (
            edge: Record<string, number | undefined> | undefined,
            prefix: 'startOffsetX' | 'endOffsetX',
            count: number,
        ): number[] => {
            if (!edge) return [];
            return Array.from({ length: count }, (_, i) => edge[`${prefix}${i + 1}`] as number)
                .filter(v => v != null);
        };

        const topEdge    = drillParams?.TOP?.edge;
        const bottomEdge = drillParams?.BOTTOM?.edge;
        const leftEdge   = drillParams?.LEFT?.edge;
        const rightEdge  = drillParams?.RIGHT?.edge;

        const topStartOffsets = extractOffsets(topEdge, 'endOffsetX',   Number(topEdge?.countEnd   ?? 0));
        const topEndOffsets   = extractOffsets(topEdge, 'startOffsetX', Number(topEdge?.countStart ?? 0));
        const topBeamY = hh - bt / 2;
        const topHoles: Pt[] = [
            ...topStartOffsets.map(ox => project(ox - hw, topBeamY)),
            ...topEndOffsets  .map(ox => project(hw - ox, topBeamY)),
        ];

        const botStartOffsets = extractOffsets(bottomEdge, 'startOffsetX', Number(bottomEdge?.countStart ?? 0));
        const botEndOffsets   = extractOffsets(bottomEdge, 'endOffsetX',   Number(bottomEdge?.countEnd   ?? 0));
        const botBeamY = -hh + bt / 2;
        const bottomHoles: Pt[] = [
            ...botStartOffsets.map(ox => project(ox - hw, botBeamY)),
            ...botEndOffsets  .map(ox => project(hw - ox, botBeamY)),
        ];

        const leftStartOffsets = extractOffsets(leftEdge, 'startOffsetX', Number(leftEdge?.countStart ?? 0));
        const leftEndOffsets   = extractOffsets(leftEdge, 'endOffsetX',   Number(leftEdge?.countEnd   ?? 0));
        const leftBeamX = -hw + bt / 2;
        const leftHoles: Pt[] = [
            ...leftStartOffsets.map(oy => project(leftBeamX, oy - hh)),
            ...leftEndOffsets  .map(oy => project(leftBeamX, hh - oy)),
        ];

        const rightStartOffsets = extractOffsets(rightEdge, 'startOffsetX', Number(rightEdge?.countStart ?? 0));
        const rightEndOffsets   = extractOffsets(rightEdge, 'endOffsetX',   Number(rightEdge?.countEnd   ?? 0));
        const rightBeamX = hw - bt / 2;
        const rightHoles: Pt[] = [
            ...rightStartOffsets.map(oy => project(rightBeamX, oy - hh)),
            ...rightEndOffsets  .map(oy => project(rightBeamX, hh - oy)),
        ];

        let handleCenter:   Pt | undefined;
        let handleStart:    Pt | undefined;
        let handleEnd:      Pt | undefined;
        let handlePosStart: Pt | undefined;
        let handlePosEnd:   Pt | undefined;

        if (hasHandle && handleSide) {
            const handleWidth = handleOffset || 160;
            const isVertical  = handleSide === 'LEFT' || handleSide === 'RIGHT';

            if (isVertical) {
                const posX        = handleSide === 'RIGHT' ? hw : -hw;
                const bottomEdgeY = -hh;
                const posY        = handlePosition != null ? bottomEdgeY + handlePosition : 0;

                handleCenter   = project(posX, posY);
                handleStart    = project(posX, posY - handleWidth / 2);
                handleEnd      = project(posX, posY + handleWidth / 2);
                handlePosStart = project(posX, bottomEdgeY);
                handlePosEnd   = project(posX, posY);
            } else {
                const posY      = handleSide === 'TOP' ? hh : -hh;
                const leftEdgeX = -hw;
                const posX      = handlePosition != null ? leftEdgeX + handlePosition : 0;

                handleCenter   = project(posX, posY);
                handleStart    = project(posX - handleWidth / 2, posY);
                handleEnd      = project(posX + handleWidth / 2, posY);
                handlePosStart = project(leftEdgeX, posY);
                handlePosEnd   = project(posX, posY);
            }
        }

        setLines({
            topLeft:    project(-hw, hh),
            topRight:   project(hw,  hh),
            botLeft:    project(-hw, -hh),
            botRight:   project(hw,  -hh),
            rtTopOuter: project(hw,  hh - bt),
            handleCenter, handleStart, handleEnd,
            handlePosStart, handlePosEnd,
            topHoles, bottomHoles, leftHoles, rightHoles,
        });
    });

    if (!lines) return null;

    const {
        topLeft, topRight, botLeft, botRight, rtTopOuter,
        handleCenter, handleStart, handleEnd,
        handlePosStart, handlePosEnd,
        topHoles, bottomHoles, leftHoles, rightHoles,
    } = lines;

    const offset = 36;
    const isVerticalHandle = handleSide === 'LEFT' || handleSide === 'RIGHT';

    const holeTopOffset    = offset * 1.2;
    const holeBottomOffset = offset * 1.2;
    const holeSideOffset   = offset * 1.2;

    const extractOffsets = (
        edge: Record<string, number | undefined> | undefined,
        prefix: 'startOffsetX' | 'endOffsetX',
        count: number,
    ): number[] => {
        if (!edge) return [];
        return Array.from({ length: count }, (_, i) => edge[`${prefix}${i + 1}`] as number)
            .filter(v => v != null);
    };

    const getHoverLabelPos = (
        pt: Pt,
        direction: 'top' | 'bottom' | 'left' | 'right'
    ): { x: number; y: number; textY: number } => {
        switch (direction) {
            case 'top':
                return { x: pt.x - 30, y: pt.y - holeTopOffset - 22, textY: pt.y - holeTopOffset - 8 };
            case 'bottom':
                return { x: pt.x - 30, y: pt.y + holeBottomOffset, textY: pt.y + holeBottomOffset + 14 };
            case 'left':
                return { x: pt.x - holeSideOffset - 52, y: pt.y - 10, textY: pt.y + 4 };
            case 'right':
                return { x: pt.x + holeSideOffset - 8, y: pt.y - 10, textY: pt.y + 4 };
        }
    };

    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <svg
                width={size.width}
                height={size.height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 50
                }}
            >
                <defs>
                    <marker id="arr"         markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/></marker>
                    <marker id="arr-r"       markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/></marker>
                    <marker id="arr-blue"    markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa"/></marker>
                    <marker id="arr-blue-r"  markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa"/></marker>
                    <marker id="arr-green"   markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#34d399"/></marker>
                    <marker id="arr-green-r" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#34d399"/></marker>
                    <marker id="arr-amber"   markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/></marker>
                    <marker id="arr-amber-r" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/></marker>
                    <marker id="arr-hole"    markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#a78bfa"/></marker>
                    <marker id="arr-hole-r"  markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#a78bfa"/></marker>
                </defs>

                {/* ── Ширина рамки ── */}
                <DimLine
                    x1={topLeft.x}  y1={topLeft.y  - offset}
                    x2={topRight.x} y2={topRight.y - offset}
                    label={`${frameWidth} мм`}
                    tickFromY1={topLeft.y} tickFromY2={topRight.y}
                    color="#94a3b8" markerId="arr" markerIdR="arr-r"
                />

                {/* ── Висота рамки ── */}
                <DimLine
                    x1={(hasHandle && handleSide === 'LEFT') ? topRight.x + offset : topLeft.x - offset}
                    y1={(hasHandle && handleSide === 'LEFT') ? topRight.y          : topLeft.y}
                    x2={(hasHandle && handleSide === 'LEFT') ? botRight.x + offset : botLeft.x - offset}
                    y2={(hasHandle && handleSide === 'LEFT') ? botRight.y          : botLeft.y}
                    label={`${frameHeight} мм`}
                    tickFromX1={(hasHandle && handleSide === 'LEFT') ? topRight.x : topLeft.x}
                    tickFromX2={(hasHandle && handleSide === 'LEFT') ? botRight.x : botLeft.x}
                    color="#94a3b8" markerId="arr" markerIdR="arr-r"
                    vertical
                />

                {/* ── Товщина балки ── */}
                <DimLine
                    x1={topRight.x + offset} y1={topRight.y}
                    x2={topRight.x + offset} y2={rtTopOuter.y}
                    label={`${beamThickness} мм`}
                    tickFromX1={topRight.x} tickFromX2={topRight.x}
                    color="#60a5fa" markerId="arr-blue" markerIdR="arr-blue-r"
                    vertical
                />

                {/* ── Ручка ── */}
                {hasHandle && handleStart && handleEnd && handleCenter && (
                    <g>
                        <DimLine
                            x1={isVerticalHandle ? handleStart.x + (handleSide === 'RIGHT' ? offset : -offset) : handleStart.x}
                            y1={isVerticalHandle ? handleStart.y : handleStart.y - offset}
                            x2={isVerticalHandle ? handleEnd.x   + (handleSide === 'RIGHT' ? offset : -offset) : handleEnd.x}
                            y2={isVerticalHandle ? handleEnd.y   : handleEnd.y - offset}
                            label={`${handleOffset || 160} мм`}
                            tickFromX1={isVerticalHandle ? handleStart.x : undefined}
                            tickFromX2={isVerticalHandle ? handleEnd.x   : undefined}
                            tickFromY1={!isVerticalHandle ? handleStart.y : undefined}
                            tickFromY2={!isVerticalHandle ? handleEnd.y   : undefined}
                            color="#34d399" markerId="arr-green" markerIdR="arr-green-r"
                            vertical={isVerticalHandle}
                        />
                        <circle cx={handleCenter.x} cy={handleCenter.y} r={4} fill="#34d399" opacity={0.9} />
                        <circle cx={handleCenter.x} cy={handleCenter.y} r={8} fill="none" stroke="#34d399" strokeWidth={1.5} opacity={0.5} />
                        <rect
                            x={handleSide === 'RIGHT' ? handleCenter.x + 12 : handleCenter.x - 76}
                            y={handleCenter.y - 11}
                            width={64} height={20} rx={4}
                            fill="rgba(10,15,30,0.88)"
                        />
                        <text
                            x={handleSide === 'RIGHT' ? handleCenter.x + 44 : handleCenter.x - 44}
                            y={handleCenter.y + 4}
                            textAnchor="middle" fill="#34d399" fontSize={11} fontFamily="monospace" fontWeight="700"
                        >
                            Ручка
                        </text>
                    </g>
                )}

                {/* ── Позиція ручки ── */}
                {hasHandle && handlePosStart && handlePosEnd && handlePosition != null && (
                    <DimLine
                        x1={isVerticalHandle ? handlePosStart.x + (handleSide === 'RIGHT' ? offset * 2 : -offset * 2) : handlePosStart.x}
                        y1={isVerticalHandle ? handlePosStart.y : handlePosStart.y + offset * 2}
                        x2={isVerticalHandle ? handlePosEnd.x   + (handleSide === 'RIGHT' ? offset * 2 : -offset * 2) : handlePosEnd.x}
                        y2={isVerticalHandle ? handlePosEnd.y   : handlePosEnd.y + offset * 2}
                        label={`${handlePosition} мм`}
                        tickFromX1={isVerticalHandle ? handlePosStart.x : undefined}
                        tickFromX2={isVerticalHandle ? handlePosEnd.x   : undefined}
                        tickFromY1={!isVerticalHandle ? handlePosStart.y : undefined}
                        tickFromY2={!isVerticalHandle ? handlePosEnd.y   : undefined}
                        color="#f59e0b" markerId="arr-amber" markerIdR="arr-amber-r"
                        vertical={isVerticalHandle}
                    />
                )}

                {/* ── TOP отвори ── */}
                {topHoles.map((pt, i) => {
                    const allTopOffsets = [
                        ...extractOffsets(drillParams?.TOP?.edge, 'endOffsetX',   Number(drillParams?.TOP?.edge?.countEnd   ?? 0)),
                        ...extractOffsets(drillParams?.TOP?.edge, 'startOffsetX', Number(drillParams?.TOP?.edge?.countStart ?? 0)),
                    ];
                    const mmValue = allTopOffsets[i];
                    const label = mmValue != null ? `${mmValue}мм` : `T${i + 1}`;
                    return (
                        <g
                            key={`th-${i}`}
                            style={{ pointerEvents: 'all', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredHole({ pt, label, direction: 'top' })}
                            onMouseLeave={() => setHoveredHole(null)}
                        >
                            <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y - holeTopOffset} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
                            <circle cx={pt.x} cy={pt.y} r={3} fill="#a78bfa" opacity={0.8} />
                            <rect x={pt.x - 22} y={pt.y - holeTopOffset - 18} width={44} height={16} rx={3} fill="rgba(10,15,30,0.85)" />
                            <text x={pt.x} y={pt.y - holeTopOffset - 6} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily="monospace" fontWeight="700">
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* ── BOTTOM отвори ── */}
                {bottomHoles.map((pt, i) => {
                    const allBotOffsets = [
                        ...extractOffsets(drillParams?.BOTTOM?.edge, 'startOffsetX', Number(drillParams?.BOTTOM?.edge?.countStart ?? 0)),
                        ...extractOffsets(drillParams?.BOTTOM?.edge, 'endOffsetX',   Number(drillParams?.BOTTOM?.edge?.countEnd   ?? 0)),
                    ];
                    const mmValue = allBotOffsets[i];
                    const label = mmValue != null ? `${mmValue}мм` : `B${i + 1}`;
                    return (
                        <g
                            key={`bh-${i}`}
                            style={{ pointerEvents: 'all', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredHole({ pt, label, direction: 'bottom' })}
                            onMouseLeave={() => setHoveredHole(null)}
                        >
                            <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y + holeBottomOffset} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
                            <circle cx={pt.x} cy={pt.y} r={3} fill="#a78bfa" opacity={0.8} />
                            <rect x={pt.x - 22} y={pt.y + holeBottomOffset + 2} width={44} height={16} rx={3} fill="rgba(10,15,30,0.85)" />
                            <text x={pt.x} y={pt.y + holeBottomOffset + 14} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily="monospace" fontWeight="700">
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* ── LEFT отвори ── */}
                {leftHoles.map((pt, i) => {
                    const allLeftOffsets = [
                        ...extractOffsets(drillParams?.LEFT?.edge, 'startOffsetX', Number(drillParams?.LEFT?.edge?.countStart ?? 0)),
                        ...extractOffsets(drillParams?.LEFT?.edge, 'endOffsetX',   Number(drillParams?.LEFT?.edge?.countEnd   ?? 0)),
                    ];
                    const mmValue = allLeftOffsets[i];
                    const label = mmValue != null ? `${mmValue}мм` : `L${i + 1}`;
                    return (
                        <g
                            key={`lh-${i}`}
                            style={{ pointerEvents: 'all', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredHole({ pt, label, direction: 'left' })}
                            onMouseLeave={() => setHoveredHole(null)}
                        >
                            <line x1={pt.x} y1={pt.y} x2={pt.x - holeSideOffset} y2={pt.y} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
                            <circle cx={pt.x} cy={pt.y} r={3} fill="#a78bfa" opacity={0.8} />
                            <rect x={pt.x - holeSideOffset - 44} y={pt.y - 8} width={44} height={16} rx={3} fill="rgba(10,15,30,0.85)" />
                            <text x={pt.x - holeSideOffset - 22} y={pt.y + 4} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily="monospace" fontWeight="700">
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* ── RIGHT отвори ── */}
                {rightHoles.map((pt, i) => {
                    const allRightOffsets = [
                        ...extractOffsets(drillParams?.RIGHT?.edge, 'startOffsetX', Number(drillParams?.RIGHT?.edge?.countStart ?? 0)),
                        ...extractOffsets(drillParams?.RIGHT?.edge, 'endOffsetX',   Number(drillParams?.RIGHT?.edge?.countEnd   ?? 0)),
                    ];
                    const mmValue = allRightOffsets[i];
                    const label = mmValue != null ? `${mmValue}мм` : `R${i + 1}`;
                    return (
                        <g
                            key={`rh-${i}`}
                            style={{ pointerEvents: 'all', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredHole({ pt, label, direction: 'right' })}
                            onMouseLeave={() => setHoveredHole(null)}
                        >
                            <line x1={pt.x} y1={pt.y} x2={pt.x + holeSideOffset} y2={pt.y} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
                            <circle cx={pt.x} cy={pt.y} r={3} fill="#a78bfa" opacity={0.8} />
                            <rect x={pt.x + holeSideOffset} y={pt.y - 8} width={44} height={16} rx={3} fill="rgba(10,15,30,0.85)" />
                            <text x={pt.x + holeSideOffset + 22} y={pt.y + 4} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily="monospace" fontWeight="700">
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* ── HOVER шар — завжди поверх всього ── */}
                {hoveredHole && (() => {
                    const { pt, label, direction } = hoveredHole;
                    const pos = getHoverLabelPos(pt, direction);
                    return (
                        <g style={{ pointerEvents: 'none' }}>
                            <circle cx={pt.x} cy={pt.y} r={6} fill="#a78bfa" opacity={1} />
                            <circle cx={pt.x} cy={pt.y} r={10} fill="none" stroke="#a78bfa" strokeWidth={1.5} opacity={0.6} />
                            <rect
                                x={pos.x} y={pos.y}
                                width={60} height={20} rx={4}
                                fill="rgba(88,28,220,0.9)"
                                stroke="#a78bfa" strokeWidth={1}
                            />
                            <text
                                x={pos.x + 30} y={pos.textY}
                                textAnchor="middle" fill="#ffffff"
                                fontSize={13} fontFamily="monospace" fontWeight="700"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })()}

            </svg>
        </Html>
    );
}

function DimLine({x1, y1, x2, y2, label, vertical = false, tickFromY1, tickFromY2, tickFromX1, tickFromX2, color, markerId, markerIdR}: { x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean; tickFromY1?: number; tickFromY2?: number; tickFromX1?: number; tickFromX2?: number; color: string; markerId: string; markerIdR: string; }) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const tickLen = 7;

    return (
        <g>
            {!vertical && tickFromY1 !== undefined && (
                <>
                    <line x1={x1} y1={tickFromY1} x2={x1} y2={y1} stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
                    <line x1={x2} y1={tickFromY2} x2={x2} y2={y2} stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
                </>
            )}
            {vertical && tickFromX1 !== undefined && (
                <>
                    <line x1={tickFromX1} y1={y1} x2={x1} y2={y1} stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
                    <line x1={tickFromX2} y1={y2} x2={x2} y2={y2} stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
                </>
            )}

            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color} strokeWidth={1.5}
                markerStart={`url(#${markerIdR})`}
                markerEnd={`url(#${markerId})`}
            />

            {!vertical ? (
                <>
                    <line x1={x1} y1={y1 - tickLen} x2={x1} y2={y1 + tickLen} stroke={color} strokeWidth={1.5} />
                    <line x1={x2} y1={y2 - tickLen} x2={x2} y2={y2 + tickLen} stroke={color} strokeWidth={1.5} />
                </>
            ) : (
                <>
                    <line x1={x1 - tickLen} y1={y1} x2={x1 + tickLen} y2={y1} stroke={color} strokeWidth={1.5} />
                    <line x1={x2 - tickLen} y1={y2} x2={x2 + tickLen} y2={y2} stroke={color} strokeWidth={1.5} />
                </>
            )}

            <rect x={mx - 30} y={my - 11} width={60} height={20} rx={4} fill="rgba(10,15,30,0.88)" />
            <text
                x={mx} y={my + 4}
                textAnchor="middle"
                fill={color}
                fontSize={11}
                fontFamily="monospace"
                fontWeight="700"
            >
                {label}
            </text>
        </g>
    );
}

function SceneContent({
                          frameWidth,
                          frameHeight,
                          beamThickness,
                          sawThickness,
                          viewMode,
                          transformMode,
                          onMeshesUpdate,
                          onInfoUpdate,
                          onBeamClick,
                          groupRef,
                          selectedBeamName,
                          importedModel,
                          originalDimensions,
                          modelLoading,
                          modelError,
                          drillParams,
                          hasHandle, handleSide, handleOffset, handlePosition, hideDimensions
}: Canvas3DAdvancedProps & {
    groupRef: React.MutableRefObject<THREE.Group | null>;
    selectedBeamName?: string | null;
    importedModel?: THREE.Group | null;
    originalDimensions?: ModelDimensions | null;
    modelLoading?: boolean;
    modelError?: string | null;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    hideDimensions?: boolean;
    handlePosition?: number;
    drillParams?: DrillDefaultParameters;
}) {
    const transformRef = useRef<React.ComponentRef<typeof TransformControls>>(null);

    useEffect(() => {
        const transform = transformRef.current;
        if (!transform || !groupRef.current) return;

        transform.attach(groupRef.current);

        return () => {
            transform.detach();
        };
    }, []);

    return (
        <>
            <CameraAndControls frameWidth={frameWidth} frameHeight={frameHeight} beamThickness={beamThickness} />
            {/*<AxesWithLabels size={Math.max(frameWidth, frameHeight) * 0.8} />*/}

            {/*<gridHelper*/}
            {/*    args={[*/}
            {/*        Math.max(frameWidth, frameHeight) * 1.5,*/}
            {/*        20,*/}
            {/*        0x444444,*/}
            {/*        0x222222*/}
            {/*    ]}*/}
            {/*    rotation={[Math.PI / 2, 0, 0]}*/}
            {/*/>*/}

            <group ref={groupRef}>
                <FrameModel
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    beamThickness={beamThickness}
                    viewMode={viewMode}
                    onMeshesUpdate={onMeshesUpdate}
                    onInfoUpdate={onInfoUpdate}
                    groupRef={groupRef}
                    drillParams={drillParams}
                    onBeamClick={onBeamClick}
                    selectedBeamName={selectedBeamName}
                    importedModel={importedModel}
                    originalDimensions={originalDimensions}
                    modelLoading={modelLoading}
                    modelError={modelError}
                    hasHandle={hasHandle}
                    handleSide={handleSide}
                    handleOffset={handleOffset}
                    handlePosition={handlePosition}
                />

                {!hideDimensions && (
                    <DimensionLines
                        frameWidth={frameWidth}
                        frameHeight={frameHeight}
                        beamThickness={beamThickness}
                        hasHandle={hasHandle}
                        handleSide={handleSide}
                        handleOffset={handleOffset}
                        handlePosition={handlePosition}
                        drillParams={drillParams}
                    />
                )}
            </group>
            {transformMode !== 'none' && (
                <TransformControls ref={transformRef} mode={transformMode} />
            )}
        </>
    );
}

interface Canvas3DAdvancedWithModelProps extends Canvas3DAdvancedProps {
    selectedMeshName?: string | null;
    profileSystemFileUrl?: string;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    drillParams?: DrillDefaultParameters;
    hideDimensions?: boolean;
}

export default function Canvas3DAdvanced({frameWidth, frameHeight, drillParams, beamThickness, hideDimensions, hasHandle, handleSide, handleOffset, handlePosition, sawThickness, viewMode = 'solid', transformMode = 'none', onMeshesUpdate, onInfoUpdate, onBeamClick, selectedMeshName, profileSystemFileUrl}: Canvas3DAdvancedWithModelProps) {
    const groupRef = useRef<THREE.Group | null>(null);
    const [importedModel, setImportedModel] = useState<THREE.Group | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<ModelDimensions | null>(null);
    const [modelLoading, setModelLoading] = useState(false);
    const [modelError, setModelError] = useState<string | null>(null);

    useEffect(() => {
        if (!profileSystemFileUrl) {
            setImportedModel(null);
            setOriginalDimensions(null);
            setModelError(null);
            return;
        }

        const loadModel = async () => {
            setModelLoading(true);
            setModelError(null);

            try {
                const result = await loadGLBModel(profileSystemFileUrl);
                if (result) {
                    setImportedModel(result.model);
                    setOriginalDimensions(result.dimensions);
                    setModelError(null);
                    console.log('✅ Model and dimensions saved:', result.dimensions);
                } else {
                    setImportedModel(null);
                    setOriginalDimensions(null);
                    setModelError('Не вдалося завантажити модель');
                }
            } catch (error) {
                console.error('Error loading model:', error);
                setImportedModel(null);
                setOriginalDimensions(null);
                setModelError(error instanceof Error ? error.message : 'Невідома помилка');
            } finally {
                setModelLoading(false);
            }
        };

        loadModel();
    }, [profileSystemFileUrl]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas>
                <color attach="background" args={[0x23272f]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <SceneContent
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    beamThickness={beamThickness}
                    sawThickness={sawThickness}
                    viewMode={viewMode}
                    drillParams={drillParams}
                    transformMode={transformMode}
                    onMeshesUpdate={onMeshesUpdate}
                    onInfoUpdate={onInfoUpdate}
                    onBeamClick={onBeamClick}
                    groupRef={groupRef}
                    selectedBeamName={selectedMeshName}
                    importedModel={importedModel}
                    originalDimensions={originalDimensions}
                    modelLoading={modelLoading}
                    modelError={modelError}
                    hasHandle={hasHandle}
                    handleSide={handleSide}
                    handleOffset={handleOffset}
                    handlePosition={handlePosition}
                    hideDimensions={hideDimensions}
                />
            </Canvas>

            {/*<div style={{*/}
            {/*    position: 'absolute',*/}
            {/*    top: '10px',*/}
            {/*    right: '10px',*/}
            {/*    display: 'flex',*/}
            {/*    flexDirection: 'column',*/}
            {/*    gap: '8px',*/}
            {/*    zIndex: 1000*/}
            {/*}}>*/}
            {/*    <button*/}
            {/*        style={{*/}
            {/*            padding: '8px 16px',*/}
            {/*            backgroundColor: '#4CAF50',*/}
            {/*            color: 'white',*/}
            {/*            border: 'none',*/}
            {/*            borderRadius: '4px',*/}
            {/*            cursor: 'pointer',*/}
            {/*            fontSize: '14px',*/}
            {/*            fontWeight: 'bold',*/}
            {/*            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',*/}
            {/*            transition: 'all 0.3s'*/}
            {/*        }}*/}
            {/*        onClick={() => {*/}
            {/*            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);*/}
            {/*            exportToOBJ(groupRef.current, `frame_${frameWidth}x${frameHeight}_${timestamp}.obj`);*/}
            {/*        }}*/}
            {/*        onMouseEnter={(e) => {*/}
            {/*            e.currentTarget.style.backgroundColor = '#45a049';*/}
            {/*            e.currentTarget.style.transform = 'scale(1.05)';*/}
            {/*        }}*/}
            {/*        onMouseLeave={(e) => {*/}
            {/*            e.currentTarget.style.backgroundColor = '#4CAF50';*/}
            {/*            e.currentTarget.style.transform = 'scale(1)';*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        Експорт GLB*/}
            {/*    </button>*/}
            {/*</div>*/}
        </div>
    );
}