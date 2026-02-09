import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {ConstructionMesh} from "@/screens/construction/type/editor/three-mesh";

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

interface Canvas3DOptions {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void;
    onSelectedMeshChange?: (mesh: ConstructionMesh | null) => void;
    onInfoUpdate?: (info: string) => void;
}

interface UpdateModelParams {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    sawThickness: number;
}

class Canvas3D {
    private canvas: HTMLCanvasElement;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private orbit: OrbitControls;
    private readonly transform: TransformControls;

    private readonly modelGroup: THREE.Group;
    private model: THREE.Group | null = null;
    private meshes: THREE.Mesh[] = [];
    private orderedMeshes: THREE.Mesh[] = [];
    private selectedMesh: THREE.Mesh | null = null;
    private readonly vertexPoints: THREE.Group;

    private viewMode = 'solid';
    private transformMode = 'none';

    private frameWidth: number;
    private frameHeight: number;
    private beamThickness: number;
    private globalDy: number = 1.344;

    private raycaster: THREE.Raycaster;
    private readonly mouse: THREE.Vector2;

    private readonly onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void;
    private readonly onSelectedMeshChange?: (mesh: ConstructionMesh | null) => void;
    private readonly onInfoUpdate?: (info: string) => void;

    private currentOutline?: THREE.LineSegments;

    private animationId: number | null = null;

    constructor(canvas: HTMLCanvasElement, options: Canvas3DOptions) {
        this.canvas = canvas;
        this.frameWidth = options.frameWidth;
        this.frameHeight = options.frameHeight;
        this.beamThickness = options.beamThickness;
        this.onMeshesUpdate = options.onMeshesUpdate;
        this.onSelectedMeshChange = options.onSelectedMeshChange;
        this.onInfoUpdate = options.onInfoUpdate;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x202020);

        this.camera = new THREE.PerspectiveCamera(
            50,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(4, 4, 6);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbit.enableDamping = true;

        this.transform = new TransformControls(this.camera, this.renderer.domElement);
        this.scene.add(this.transform as unknown as THREE.Object3D);
        this.transform.setTranslationSnap(null);
        this.transform.setRotationSnap(null);
        this.transform.setScaleSnap(null);
        this.transform.setSpace('local');
        this.transform.addEventListener('dragging-changed', (e) => {
            this.orbit.enabled = !e.value;
        });

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 10, 5);
        this.scene.add(dir);

        this.modelGroup = new THREE.Group();
        this.scene.add(this.modelGroup);

        this.vertexPoints = new THREE.Group();
        this.scene.add(this.vertexPoints);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.setupEventListeners();
        this.createModel();
        this.animate();
    }

    private setupEventListeners(): void {
        window.addEventListener('click', (event) => {
            this.onCanvasClick(event);
        });

        window.addEventListener('resize', () => {
            this.onWindowResize();
        });

        window.addEventListener('keydown', (e) => {
            this.onKeyDown(e);
        });
    }

    private onCanvasClick = (event: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.meshes, false);
        if (intersects.length === 0) return;

        const hit = intersects[0].object;
        if (hit instanceof THREE.Mesh) {
            const idx = this.orderedMeshes.indexOf(hit);
            if (idx !== -1) {
                this.selectMesh(hit);
            }
        }
    };

    private onWindowResize(): void {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (!this.model) return;
        if (e.key === '1') this.setTransformMode('translate');
        if (e.key === '2') this.setTransformMode('rotate');
        if (e.key === '3') this.setTransformMode('scale');
        if (e.key === '0') this.setTransformMode('none');
    }

    private createModel(): void {
        if (this.model) this.modelGroup.remove(this.model);
        this.meshes = [];

        this.model = new THREE.Group();

        const frameMaterial = new THREE.MeshStandardMaterial({
            metalness: 0.3,
            roughness: 0.4
        });

        // Top beam
        const topGeo = new THREE.BoxGeometry(this.frameWidth, this.beamThickness, this.beamThickness);
        const topMat = frameMaterial.clone();
        topMat.color.setHex(0xff6b6b);
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.name = 'Верхня балка';
        topMesh.position.set(0, this.frameHeight / 2 - this.beamThickness / 2, 0);
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        this.model.add(topMesh);

        // Bottom beam
        const bottomGeo = new THREE.BoxGeometry(this.frameWidth, this.beamThickness, this.beamThickness);
        const bottomMat = frameMaterial.clone();
        bottomMat.color.setHex(0xff6b6b);
        const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
        bottomMesh.name = 'Нижня балка';
        bottomMesh.position.set(0, -this.frameHeight / 2 + this.beamThickness / 2, 0);
        bottomMesh.castShadow = true;
        bottomMesh.receiveShadow = true;
        this.model.add(bottomMesh);

        // Left beam
        const leftGeo = new THREE.BoxGeometry(this.beamThickness, this.frameHeight, this.beamThickness);
        const leftMat = frameMaterial.clone();
        leftMat.color.setHex(0x4aa3ff);
        const leftMesh = new THREE.Mesh(leftGeo, leftMat);
        leftMesh.name = 'Ліва балка';
        leftMesh.position.set(-this.frameWidth / 2 + this.beamThickness / 2, 0, 0);
        leftMesh.castShadow = true;
        leftMesh.receiveShadow = true;
        this.model.add(leftMesh);

        // Right beam
        const rightGeo = new THREE.BoxGeometry(this.beamThickness, this.frameHeight, this.beamThickness);
        const rightMat = frameMaterial.clone();
        rightMat.color.setHex(0x4aa3ff);
        const rightMesh = new THREE.Mesh(rightGeo, rightMat);
        rightMesh.name = 'Права балка';
        rightMesh.position.set(this.frameWidth / 2 - this.beamThickness / 2, 0, 0);
        rightMesh.castShadow = true;
        rightMesh.receiveShadow = true;
        this.model.add(rightMesh);

        this.setupModel();
    }

    private setupModel(): void {
        this.model?.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                this.meshes.push(child);
                child.material = new THREE.MeshStandardMaterial({
                    color: (child.material as THREE.MeshStandardMaterial).color,
                    metalness: 0.2,
                    roughness: 0.6
                });
            }
        });

        this.orderedMeshes = this.meshes.sort((a, b) => {
            return this.getPartPriority(a.name) - this.getPartPriority(b.name);
        });

        this.modelGroup.add(this.model!);
        this.transform.attach(this.modelGroup);
        this.centerModel();
        this.updateViewMode();

        if (this.onMeshesUpdate) {
            const constructionMeshes = this.meshes.map(threeMeshToConstructionMesh);
            const orderedConstructionMeshes = this.orderedMeshes.map(threeMeshToConstructionMesh);
            this.onMeshesUpdate(constructionMeshes, orderedConstructionMeshes);
        }

        this.updateInfo();
    }

    private getPartPriority(name: string): number {
        const priority: { [key: string]: number } = {
            'Верхня балка': 1,
            'Ліва балка': 2,
            'Нижня балка': 3,
            'Права балка': 4
        };
        return priority[name] ?? 99;
    }

    private centerModel(): void {
        if (!this.model) return;

        const box = new THREE.Box3().setFromObject(this.model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        this.model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        cameraDistance *= 1.4;

        this.camera.position.set(0, 0, cameraDistance);
        this.camera.near = cameraDistance / 100;
        this.camera.far = cameraDistance * 100;
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(0, 0, 0);

        this.orbit.target.set(0, 0, 0);
        this.orbit.update();
    }

    private removeOutline(): void {
        if (!this.currentOutline) return;

        this.currentOutline.geometry.dispose();
        (this.currentOutline.material as THREE.Material).dispose();
        this.currentOutline.removeFromParent();
        this.currentOutline = undefined;
    }

    public selectMesh(mesh: ConstructionMesh | THREE.Mesh): void {
        let threeMesh: THREE.Mesh | undefined;

        if (mesh instanceof THREE.Mesh) {
            threeMesh = mesh;
        } else {
            threeMesh = this.meshes.find(m => m.name === mesh.name);
        }

        if (!threeMesh) return;

        this.selectedMesh = threeMesh;

        if (this.onSelectedMeshChange) {
            this.onSelectedMeshChange(threeMeshToConstructionMesh(threeMesh));
        }

        this.removeOutline();

        const edges = new THREE.EdgesGeometry(threeMesh.geometry as THREE.BufferGeometry);
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const outline = new THREE.LineSegments(edges, material);
        outline.userData.isOutline = true;

        threeMesh.add(outline);
        this.currentOutline = outline;
    }

    private updateViewMode(): void {
        this.vertexPoints.clear();

        this.meshes.forEach((mesh) => {
            const material = mesh.material as THREE.MeshStandardMaterial;

            if (this.viewMode === 'solid') {
                mesh.visible = true;
                material.wireframe = false;
            } else if (this.viewMode === 'wireframe') {
                mesh.visible = true;
                material.wireframe = true;
            } else if (this.viewMode === 'vertices') {
                mesh.visible = false;
                this.addVertexPoints(mesh);
            } else if (this.viewMode === 'mixed') {
                mesh.visible = true;
                material.wireframe = false;
                this.addVertexPoints(mesh);
            }
        });
    }

    private addVertexPoints(mesh: THREE.Mesh): void {
        const geometry = mesh.geometry as THREE.BufferGeometry;
        const positions = geometry.attributes.position.array as Float32Array;

        const mat = new THREE.PointsMaterial({
            color: 0xff00ff,
            size: 0.05,
            sizeAttenuation: true
        });

        const ptGeo = new THREE.BufferGeometry();
        ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const pts = new THREE.Points(ptGeo, mat);
        pts.position.copy(mesh.position);
        pts.rotation.copy(mesh.rotation);
        pts.scale.copy(mesh.scale);

        this.vertexPoints.add(pts);
    }

    private updateInfo(): void {
        if (!this.model || !this.onInfoUpdate) return;

        const box3 = new THREE.Box3().setFromObject(this.model);
        const size = new THREE.Vector3();
        box3.getSize(size);

        let selInfo = 'Виберіть частину';
        if (this.selectedMesh) {
            const mbox = new THREE.Box3().setFromObject(this.selectedMesh);
            const msize = new THREE.Vector3();
            mbox.getSize(msize);
            selInfo = `Вибрана: ${this.selectedMesh.name}\nРозміри: ${msize.x.toFixed(2)}×${msize.y.toFixed(2)}×${msize.z.toFixed(2)}\nПозиція: (${this.selectedMesh.position.x.toFixed(2)}, ${this.selectedMesh.position.y.toFixed(2)}, ${this.selectedMesh.position.z.toFixed(2)})`;
        }

        const info = `МОДЕЛЬ (Рамка ${this.frameWidth}×${this.frameHeight})
Розміри: ${size.x.toFixed(2)}×${size.y.toFixed(2)}×${size.z.toFixed(2)}

${selInfo}

Режими моделі:
1 - Переміщення
2 - Обертання
3 - Масштабування
0 - Відключити редагування`;

        this.onInfoUpdate(info);
    }

    public setViewMode(mode: string): void {
        this.viewMode = mode;
        this.updateViewMode();
    }

    public setTransformMode(mode: 'translate' | 'rotate' | 'scale' | 'none'): void {
        this.transformMode = mode;

        if (mode === 'none') {
            this.transform.detach();
            this.transform.enabled = false;
            return;
        }

        this.transform.enabled = true;
        this.transform.setMode(mode);
    }

    public scaleSelected(factor: number, axis: string): void {
        if (!this.selectedMesh) return;
        const scale = this.selectedMesh.scale;
        if (axis === 'x') scale.x *= factor;
        if (axis === 'y') scale.y *= factor;
        if (axis === 'z') scale.z *= factor;
    }

    public moveSelected(amount: number, axis: string): void {
        if (!this.selectedMesh) return;
        if (axis === 'x') this.selectedMesh.position.x += amount;
        if (axis === 'y') this.selectedMesh.position.y += amount;
        if (axis === 'z') this.selectedMesh.position.z += amount;
    }

    public getBeamLength(meshName: string): number {
        if (meshName === 'Верхня балка' || meshName === 'Нижня балка') {
            return this.frameWidth;
        } else if (meshName === 'Ліва балка' || meshName === 'Права балка') {
            return this.frameHeight;
        }
        return 0;
    }

    public generateGcodeForPart(mesh: ConstructionMesh | THREE.Mesh): string {
        const meshName = mesh instanceof THREE.Mesh ? mesh.name : mesh.name;
        const dy = this.globalDy;
        const beamThickness = this.beamThickness;

        let gcode = '%\n';
        gcode += 'G90\n';
        gcode += 'G55\n';
        gcode += 'G49\n';
        gcode += 'M13 S3000\n\n';

        if (meshName === 'Верхня балка' || meshName === 'Нижня балка') {
            const beamLength = this.frameWidth;

            const xStart1 = beamThickness - dy;
            const yStart1 = dy;
            const xEnd1 = -yStart1;
            const yEnd1 = -xStart1;

            gcode += `G0 X${xStart1.toFixed(3)} Y${yStart1.toFixed(3)} Z60.000 A45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${xEnd1.toFixed(3)} Y${yEnd1.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;

            const xStart2 = beamLength - beamThickness + dy;
            const yStart2 = dy;
            const xEnd2 = beamLength + dy;
            const yEnd2 = yEnd1;

            gcode += `G0 X${xStart2.toFixed(3)} Y${yStart2.toFixed(3)} Z60.000 A-45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${xEnd2.toFixed(3)} Y${yEnd2.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A-45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A-45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;
        } else if (meshName === 'Ліва балка' || meshName === 'Права балка') {
            const beamLength = this.frameHeight;

            const xStart1 = beamThickness - dy;
            const yStart1 = dy;
            const xEnd1 = -xStart1;
            const yEnd1 = -yStart1;

            gcode += `G0 X${xStart1.toFixed(3)} Y${yStart1.toFixed(3)} Z60.000 A45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${yEnd1.toFixed(3)} Y${xEnd1.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;

            const xStart2 = beamLength - beamThickness + dy;
            const yStart2 = dy;
            const xEnd2 = beamLength + dy;
            const yEnd2 = xEnd1;

            gcode += `G0 X${xStart2.toFixed(3)} Y${yStart2.toFixed(3)} Z60.000 A-45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${xEnd2.toFixed(3)} Y${yEnd2.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A-45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A-45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;
        }

        gcode += 'G49\nG54\nM15\nM02\n%\n';
        return gcode;
    }

    public updateModel(params: UpdateModelParams): void {
        this.frameWidth = params.frameWidth;
        this.frameHeight = params.frameHeight;
        this.beamThickness = params.beamThickness;
        this.globalDy = params.sawThickness;

        this.createModel();
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);

        this.orbit.update();
        this.updateInfo();
        this.renderer.render(this.scene, this.camera);
    };

    public dispose(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.renderer.dispose();
        window.removeEventListener('click', this.onCanvasClick);
        window.removeEventListener('resize', () => this.onWindowResize());
        window.removeEventListener('keydown', (e) => this.onKeyDown(e));
    }
}

export default Canvas3D;