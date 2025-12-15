import Phaser from 'phaser';
import { GameMapData } from '../types';
import MapPiece from '../objects/MapPiece';
import MapSlot from '../objects/MapSlot';
import { MapTextureGenerator } from '../utils/MapTextureGenerator';

export default class GameScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private slots: MapSlot[] = [];
    private pieces: MapPiece[] = [];
    private slotMap: Map<number, MapSlot> = new Map();
    private currentMapScale: number = 1.0;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(data: { mapData: GameMapData }) {
        this.mapData = data.mapData;
        console.log('GameScene: Starting Level 1');

        // Launch HUD (Timer)
        this.scene.launch('HUDScene');

        // Soft gradient or solid pastel color
        // Light Cyan to contrast with White Map
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe0f7fa);
        bg.setOrigin(0);

        // 0. Generate Textures (Optimized Rendering)
        const textureGen = new MapTextureGenerator(this, this.mapData);
        textureGen.generateTextures();

        // 1. Calculate Content Bounds to Fit Screen
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.mapData.provinces.forEach(p => {
            if (p.bounds.minX < minX) minX = p.bounds.minX;
            if (p.bounds.minY < minY) minY = p.bounds.minY;
            if (p.bounds.maxX > maxX) maxX = p.bounds.maxX;
            if (p.bounds.maxY > maxY) maxY = p.bounds.maxY;
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const cx = minX + contentWidth / 2;
        const cy = minY + contentHeight / 2;

        const SCREEN_W = this.scale.width;
        const SCREEN_H = this.scale.height;
        const TARGET_HEIGHT = SCREEN_H * 0.85;

        // Calculate Scale
        const MAP_SCALE = TARGET_HEIGHT / contentHeight;
        this.currentMapScale = MAP_SCALE;

        // Center Offset
        const SCREEN_CX = SCREEN_W / 2;
        const SCREEN_CY = SCREEN_H / 2;

        // Colors for pieces (Soft Pastel Palette)
        const PALETTE = [
            0xffadad, 0xffd6a5, 0xfdffb6, 0xcaffbf,
            0x9bf6ff, 0xa0c4ff, 0xbdb2ff, 0xffc6ff
        ];
        let colorIndex = 0;

        this.mapData.provinces.forEach((province, index) => {
            // 2. Create Slot (The Target)
            const slotX = (province.center.x - cx) * MAP_SCALE + SCREEN_CX;
            const slotY = (province.center.y - cy) * MAP_SCALE + SCREEN_CY;

            const slot = new MapSlot(this, slotX, slotY, province);
            slot.setScale(MAP_SCALE);
            this.add.existing(slot);
            this.slots.push(slot);
            this.slotMap.set(province.adcode, slot);

            // 3. Create Piece (The Draggable)
            // Fix Layout: Ensure pieces are strictly in the side columns.
            // Map is roughly 85% height centered.
            // Safe side width is approx (1280 - (0.85 * 720 * 1.35)) / 2 ~= 220px.
            // Let's use 200px width for scatter area.
            const isLeft = index % 2 === 0;
            const scatterX = isLeft
                ? Phaser.Math.Between(50, 200)
                : Phaser.Math.Between(SCREEN_W - 200, SCREEN_W - 50);
            const scatterY = Phaser.Math.Between(50, SCREEN_H - 50);

            const piece = new MapPiece(this, province, MAP_SCALE, { x: scatterX, y: scatterY });

            // Base Scale is set in constructor now
            // piece.setBaseScale(MAP_SCALE);

            // Assign color
            const color = PALETTE[colorIndex % PALETTE.length];
            colorIndex++;
            piece.setTintUnsnapped(color);

            this.add.existing(piece);
            this.pieces.push(piece);

            // Setup Event Listeners
            piece.on('ids-dropped', this.checkSnapping, this);
            piece.on('drag-update', this.handleDragUpdate, this);
        });

        this.add.text(10, 10, '省份拼拼看-简单模式', { fontSize: '24px', color: '#000' }).setDepth(100);

        // Debug Helper for Automating Verification
        (window as any).solveLevel1 = () => {
            this.pieces.forEach(p => {
                const slot = this.slotMap.get(p.provinceData.adcode);
                if (slot) {
                    p.x = slot.x;
                    p.y = slot.y;
                    p.snapTo(slot.x, slot.y, true);
                }
            });
            // Trigger win condition check after a short delay
            this.time.delayedCall(500, () => {
                this.checkWinCondition();
            });
        };
    }

    private handleDragUpdate(piece: MapPiece) {
        const slot = this.slotMap.get(piece.provinceData.adcode);
        if (!slot) return;

        // Check distance for "Magnetic Hint"
        const dist = Phaser.Math.Distance.Between(piece.x, piece.y, slot.x, slot.y);
        const HINT_THRESHOLD = 100 * this.currentMapScale;

        if (dist < HINT_THRESHOLD) {
            slot.highlight();
        } else {
            slot.reset();
        }
    }

    private checkSnapping(piece: MapPiece) {
        const slot = this.slotMap.get(piece.provinceData.adcode);
        if (!slot) return;

        const dist = Phaser.Math.Distance.Between(piece.x, piece.y, slot.x, slot.y);
        const SNAP_THRESHOLD = 50 * this.currentMapScale;

        if (dist < SNAP_THRESHOLD) {
            // Correct placement
            piece.snapTo(slot.x, slot.y, true);
            slot.reset(); // Clear highlight

            this.checkWinCondition();
        }
    }

    private checkWinCondition() {
        const allSnapped = this.pieces.every(p => p.isSnapped);
        if (allSnapped) {
            console.log("Level 1 Complete! Transitioning to Level 2...");
            this.time.delayedCall(1500, () => {
                // Route to TransitionScene with Level 2 Hard info
                this.scene.start('TransitionScene', {
                    mapData: this.mapData,
                    nextLevel: 'Level2HardScene',
                    title: '省份拼拼看-挑战模式',
                    subtitle: '无边界提示 · 精准释放'
                });
            });
        }
    }

    // Helper to get scale for external use if needed (e.g. MapPiece used to ask for it)
    public getMapScale() { return this.currentMapScale; }
}
