'use client'

import * as THREE from 'three';
import React, {useRef, useEffect, useState, useMemo} from 'react';
import {Canvas, ThreeEvent, useThree} from '@react-three/fiber';
import {Html, OrbitControls, TransformControls} from '@react-three/drei';
import {Canvas3DAdvancedProps, ConstructionMesh, ViewMode} from "@/screens/construction/type/editor/ThreeMesh";
import {BEAM_NAMES} from "@/screens/construction/constants/beamConstants";

interface ModelDimensions {
    width: number;
    height: number;
    depth: number;
}

const MODEL_TO_BEAM_NAME_MAP: Record<string, string> = {
    'NYZHNYA_BALKA': BEAM_NAMES.BOTTOM,
    'VERKHNYA_BALKA': BEAM_NAMES.TOP,
    'PRAVA_BALKA': BEAM_NAMES.RIGHT,
    'LIVA_BALKA': BEAM_NAMES.LEFT
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

function ImportedModelWrapper({
                                  model,
                                  originalDimensions,
                                  targetWidth,
                                  targetHeight,
                                  targetDepth,
                                  selectedPart,
                                  onPartClick
                              }: {
    model: THREE.Group | null;
    originalDimensions: ModelDimensions | null;
    targetWidth: number;
    targetHeight: number;
    targetDepth: number;
    selectedPart: string | null;
    onPartClick: (partName: string) => void;
}) {
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

        // Зберігаємо початкові позиції балок з GLB файлу
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

        // Зберігаємо інформацію про балки
        const beamsInfo: Record<string, {
            bbox: THREE.Box3;
            center: THREE.Vector3;
            size: THREE.Vector3;
            mesh: THREE.Mesh;
            initialPos: THREE.Vector3;
        }> = {};

        // ЕТАП 1: МАСШТАБУВАННЯ ГЕОМЕТРІЇ
        console.log('\n📦 ЕТАП 1: МАСШТАБУВАННЯ ГЕОМЕТРІЇ');
        console.log('-'.repeat(80));

        cloned.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const mesh = child as THREE.Mesh;

            // Зберігаємо оригінальну геометрію
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

                // ВЕРТИКАЛЬНІ БАЛКИ
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

            // Зберігаємо інформацію ПІСЛЯ масштабування
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

        // ЕТАП 2: РОЗРАХУНОК ПОЗИЦІЙ З УРАХУВАННЯМ ДЕФОЛТНИХ РОЗМІРІВ
        console.log('\n' + '='.repeat(80));
        console.log('📍 ЕТАП 2: РОЗРАХУНОК ПОЗИЦІЙ');
        console.log('='.repeat(80));

        // КЛЮЧОВА ЛОГІКА:
        // При дефолтних розмірах (originalDimensions) балки мають свої початкові позиції
        // Нам потрібно обчислити, як змінюються позиції при зміні розмірів рами

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

        // ЕТАП 3: ФІНАЛЬНА ПЕРЕВІРКА
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

function FrameModel({frameWidth, frameHeight, beamThickness, viewMode = 'solid', onMeshesUpdate, onInfoUpdate, groupRef, onBeamClick, selectedBeamName, importedModel, originalDimensions, modelLoading, modelError}: { frameWidth: number; frameHeight: number; beamThickness: number; viewMode?: ViewMode; onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void; onInfoUpdate?: (info: string) => void; groupRef: React.MutableRefObject<THREE.Group | null>; onBeamClick?: (beamName: string | null) => void; selectedBeamName?: string | null; importedModel?: THREE.Group | null; originalDimensions?: ModelDimensions | null; modelLoading?: boolean; modelError?: string | null; }) {
    const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);
    const [selectedModelPart, setSelectedModelPart] = useState<string | null>(null);

    const createHorizontalBeamTop45 = (width: number, thickness: number, depth: number) => {
        const shape = new THREE.Shape();
        const t = thickness;
        shape.moveTo(0, thickness);
        shape.lineTo(t, 0);
        shape.lineTo(width - t, 0);
        shape.lineTo(width, thickness);
        shape.lineTo(width, thickness);
        shape.lineTo(0, thickness);

        // Додаємо отвори
        const holeRadius = thickness * 0.15;
        const offset = thickness * 0.8;
        const edgeOffset = thickness * 1.5; // Відступ від краю балки

        // Два отвори зліва
        const hole1 = new THREE.Path();
        hole1.absarc(edgeOffset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole1);

        const hole2 = new THREE.Path();
        hole2.absarc(edgeOffset + offset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole2);

        // Два отвори справа
        const hole3 = new THREE.Path();
        hole3.absarc(width - edgeOffset - offset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole3);

        const hole4 = new THREE.Path();
        hole4.absarc(width - edgeOffset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole4);

        const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
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

        // Додаємо отвори
        const holeRadius = thickness * 0.15;
        const offset = thickness * 0.8;
        const edgeOffset = thickness * 1.5; // Відступ від краю балки

        // Два отвори зліва
        const hole1 = new THREE.Path();
        hole1.absarc(edgeOffset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole1);

        const hole2 = new THREE.Path();
        hole2.absarc(edgeOffset + offset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole2);

        // Два отвори справа
        const hole3 = new THREE.Path();
        hole3.absarc(width - edgeOffset - offset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole3);

        const hole4 = new THREE.Path();
        hole4.absarc(width - edgeOffset, thickness * 0.5, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole4);

        const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
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

        // Додаємо отвори
        const holeRadius = thickness * 0.15;
        const offset = thickness * 0.8;
        const edgeOffset = thickness * 1.5; // Відступ від краю балки

        // Два отвори зверху
        const hole1 = new THREE.Path();
        hole1.absarc(thickness * 0.5, height - edgeOffset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole1);

        const hole2 = new THREE.Path();
        hole2.absarc(thickness * 0.5, height - edgeOffset - offset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole2);

        // Два отвори знизу
        const hole3 = new THREE.Path();
        hole3.absarc(thickness * 0.5, edgeOffset + offset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole3);

        const hole4 = new THREE.Path();
        hole4.absarc(thickness * 0.5, edgeOffset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole4);

        const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
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

        // Додаємо отвори
        const holeRadius = thickness * 0.15;
        const offset = thickness * 0.8;
        const edgeOffset = thickness * 1.5; // Відступ від краю балки

        // Два отвори зверху
        const hole1 = new THREE.Path();
        hole1.absarc(thickness * 0.5, height - edgeOffset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole1);

        const hole2 = new THREE.Path();
        hole2.absarc(thickness * 0.5, height - edgeOffset - offset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole2);

        // Два отвори знизу
        const hole3 = new THREE.Path();
        hole3.absarc(thickness * 0.5, edgeOffset + offset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole3);

        const hole4 = new THREE.Path();
        hole4.absarc(thickness * 0.5, edgeOffset, holeRadius, 0, Math.PI * 2, false);
        shape.holes.push(hole4);

        const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        geometry.center();
        return geometry;
    };

    const getPartPriority = (name: string): number => {
        const priority: Record<string, number> = {
            [BEAM_NAMES.TOP]: 1,
            [BEAM_NAMES.LEFT]: 2,
            [BEAM_NAMES.BOTTOM]: 3,
            [BEAM_NAMES.RIGHT]: 4
        };
        return priority[name] ?? 99;
    };

    const beamColors: Record<string, number> = {
        [BEAM_NAMES.TOP]: 0xC0C0C0,      // Світлий сірий металічний
        [BEAM_NAMES.BOTTOM]: 0xC0C0C0,   // Світлий сірий металічний
        [BEAM_NAMES.LEFT]: 0xD0D0D0,     // Дуже світлий сірий
        [BEAM_NAMES.RIGHT]: 0xD0D0D0     // Дуже світлий сірий
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

    return (
        <>
            <BeamWithOutline
                name={BEAM_NAMES.TOP}
                geometry={createHorizontalBeamTop45(frameWidth, beamThickness, beamThickness)}
                position={[0, frameHeight / 2 - beamThickness / 2, 0]}
                color={beamColors[BEAM_NAMES.TOP]}
                isSelected={selectedBeamName === BEAM_NAMES.TOP}
                onClick={() => handleBeamClick(BEAM_NAMES.TOP)}
            />
            <BeamWithOutline
                name={BEAM_NAMES.BOTTOM}
                geometry={createHorizontalBeamBottom45(frameWidth, beamThickness, beamThickness)}
                position={[0, -frameHeight / 2 + beamThickness / 2, 0]}
                color={beamColors[BEAM_NAMES.BOTTOM]}
                isSelected={selectedBeamName === BEAM_NAMES.BOTTOM}
                onClick={() => handleBeamClick(BEAM_NAMES.BOTTOM)}
            />
            <BeamWithOutline
                name={BEAM_NAMES.LEFT}
                geometry={createVerticalBeamLeft45(frameHeight, beamThickness, beamThickness)}
                position={[-frameWidth / 2 + beamThickness / 2, 0, 0]}
                color={beamColors[BEAM_NAMES.LEFT]}
                isSelected={selectedBeamName === BEAM_NAMES.LEFT}
                onClick={() => handleBeamClick(BEAM_NAMES.LEFT)}
            />
            <BeamWithOutline
                name={BEAM_NAMES.RIGHT}
                geometry={createVerticalBeamRight45(frameHeight, beamThickness, beamThickness)}
                position={[frameWidth / 2 - beamThickness / 2, 0, 0]}
                color={beamColors[BEAM_NAMES.RIGHT]}
                isSelected={selectedBeamName === BEAM_NAMES.RIGHT}
                onClick={() => handleBeamClick(BEAM_NAMES.RIGHT)}
            />
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

function SceneContent({frameWidth, frameHeight, beamThickness, sawThickness, viewMode, transformMode, onMeshesUpdate, onInfoUpdate, onBeamClick, groupRef, selectedBeamName, importedModel, originalDimensions, modelLoading, modelError}: Canvas3DAdvancedProps & { groupRef: React.MutableRefObject<THREE.Group | null>; selectedBeamName?: string | null; importedModel?: THREE.Group | null; originalDimensions?: ModelDimensions | null; modelLoading?: boolean; modelError?: string | null; }) {
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
                    onBeamClick={onBeamClick}
                    selectedBeamName={selectedBeamName}
                    importedModel={importedModel}
                    originalDimensions={originalDimensions}
                    modelLoading={modelLoading}
                    modelError={modelError}
                />
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
}

export default function Canvas3DAdvanced({frameWidth, frameHeight, beamThickness, sawThickness, viewMode = 'solid', transformMode = 'none', onMeshesUpdate, onInfoUpdate, onBeamClick, selectedMeshName, profileSystemFileUrl}: Canvas3DAdvancedWithModelProps) {
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
                />
            </Canvas>

            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 1000
            }}>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#45a049';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Експорт GLB
                </button>
            </div>
        </div>
    );
}