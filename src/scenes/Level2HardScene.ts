import Phaser from 'phaser';
import { GameMapData } from '../types';
import MapPiece from '../objects/MapPiece';
import MapSlot from '../objects/MapSlot';
import { MapTextureGenerator } from '../utils/MapTextureGenerator';

/**
 * Level2HardScene: Hard Mode version of the map puzzle.
 * - No internal province borders on the base map
 * - Labels hidden until snapped (except 直辖市 + 港澳)
 * - No hover hints
 * - Precision snap (90% overlap required on release)
 */
export default class Level2HardScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private slots: MapSlot[] = [];
    private pieces: MapPiece[] = [];
    private slotMap: Map<number, MapSlot> = new Map();
    private currentMapScale: number = 1.0;

    // Always visible labels (直辖市 + 港澳)
    private static readonly ALWAYS_VISIBLE_LABELS = [
        '北京市', '上海市', '天津市', '重庆市',
        '香港特别行政区', '澳门特别行政区'
    ];

    constructor() {
        super({ key: 'Level2HardScene' });
    }

    create(data: { mapData: GameMapData }) {
        this.mapData = data.mapData;
        console.log('Level2HardScene: Starting Level 2 (Hard Mode)');

        // Camera fade in
        this.cameras.main.fadeIn(500, 255, 255, 255);

        // Background
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xf5f0e8);
        bg.setOrigin(0);
        bg.setDepth(-100); // Ensure background is behind everything

        // Generate Textures (including outer-border-only for background)
        const textureGen = new MapTextureGenerator(this, this.mapData);
        textureGen.generateTextures();
        textureGen.generateOuterBorderSlot(); // Generate outer border texture

        // Calculate Content Bounds
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
        const MAP_SCALE = TARGET_HEIGHT / contentHeight;
        this.currentMapScale = MAP_SCALE;

        const SCREEN_CX = SCREEN_W / 2;
        const SCREEN_CY = SCREEN_H / 2;

        // HARD MODE: Add outer border background (no internal province lines)
        const outerBorderSprite = this.add.sprite(SCREEN_CX, SCREEN_CY, 'china_outer_border');
        outerBorderSprite.setScale(MAP_SCALE);
        outerBorderSprite.setDepth(-1); // Behind pieces (Depth -1 ensures it is background)

        // Pastel Palette (same as Level 1)
        const PALETTE = [
            0xffadad, 0xffd6a5, 0xfdffb6, 0xcaffbf,
            0x9bf6ff, 0xa0c4ff, 0xbdb2ff, 0xffc6ff
        ];
        let colorIndex = 0;

        // Create Slots (invisible, for collision detection only) and Pieces
        this.mapData.provinces.forEach((province, index) => {
            // Slot Position (center of screen, scaled)
            const slotX = SCREEN_CX + (province.center.x - cx) * MAP_SCALE;
            const slotY = SCREEN_CY + (province.center.y - cy) * MAP_SCALE;

            // Create Slot (INVISIBLE in hard mode - only for snap detection)
            const slot = new MapSlot(this, slotX, slotY, province);
            slot.setScale(MAP_SCALE);
            slot.setVisible(false); // Hide individual slots in hard mode
            this.add.existing(slot);
            this.slots.push(slot);
            this.slotMap.set(province.adcode, slot);

            // Create Piece (scattered to sides)
            const isLeft = index % 2 === 0;
            const scatterX = isLeft ? Phaser.Math.Between(50, 300) : Phaser.Math.Between(SCREEN_W - 300, SCREEN_W - 50);
            const scatterY = Phaser.Math.Between(50, SCREEN_H - 50);

            const piece = new MapPiece(this, province, MAP_SCALE, { x: scatterX, y: scatterY }, 'hard');

            // Assign color
            const color = PALETTE[colorIndex % PALETTE.length];
            colorIndex++;
            piece.setTintUnsnapped(color);

            // HARD MODE: Conditional Label Visibility
            const showLabel = Level2HardScene.ALWAYS_VISIBLE_LABELS.includes(province.name);
            if (!showLabel) {
                piece.setLabelVisible(false);
            }

            this.add.existing(piece);
            this.pieces.push(piece);

            // Listen for drop event (HARD MODE: Only check on release)
            piece.on('ids-dropped', this.checkSnappingHard, this);
        });

        // Debug helper
        (window as any).solveLevel2 = () => {
            this.pieces.forEach(piece => {
                const slot = this.slotMap.get(piece.provinceData.adcode);
                if (slot && !piece.isSnapped) {
                    piece.snapTo(slot.x, slot.y, true);
                }
            });
        };
    }

    /**
     * HARD MODE: Snap check only on release, requires close center alignment.
     * Uses distance-based detection instead of bounding box overlap.
     */
    private checkSnappingHard(piece: MapPiece) {
        if (piece.isSnapped) return;

        const slot = this.slotMap.get(piece.provinceData.adcode);
        if (!slot) return;

        // Calculate distance between piece center and slot center
        const distance = Phaser.Math.Distance.Between(piece.x, piece.y, slot.x, slot.y);

        // Threshold: 15% of the piece's diagonal size (scaled)
        // This is more forgiving than 90% bounding box overlap for irregular shapes
        const bounds = piece.provinceData.bounds;
        const pieceWidth = (bounds.maxX - bounds.minX) * this.currentMapScale;
        const pieceHeight = (bounds.maxY - bounds.minY) * this.currentMapScale;
        const pieceDiagonal = Math.sqrt(pieceWidth * pieceWidth + pieceHeight * pieceHeight);
        const SNAP_THRESHOLD = pieceDiagonal * 0.15; // 15% of diagonal

        console.log(`Snap check: distance=${distance.toFixed(1)}, threshold=${SNAP_THRESHOLD.toFixed(1)}`);

        if (distance <= SNAP_THRESHOLD) {
            // Success! Snap to correct position
            console.log(`✅ Snapped: ${piece.provinceData.name}`);
            piece.snapTo(slot.x, slot.y, true);
            this.checkWinCondition();
        } else {
            // Fail! Return to original position
            console.log(`❌ Too far: ${piece.provinceData.name} (${distance.toFixed(1)} > ${SNAP_THRESHOLD.toFixed(1)})`);
            piece.returnToStart();
        }
    }

    private checkWinCondition() {
        const allSnapped = this.pieces.every(p => p.isSnapped);
        if (allSnapped) {
            console.log("Level 2 Complete! Transitioning to Level 3...");
            this.time.delayedCall(2000, () => {
                // Transition to Level 3 (Capital Rain)
                this.scene.start('TransitionScene', {
                    mapData: this.mapData,
                    nextLevel: 'Level2Scene', // This is the Capital Rain scene (now Level 3)
                    title: 'Level 3: 省会雨',
                    subtitle: '匹配省份与省会'
                });
            });
        }
    }

    public getMapScale() { return this.currentMapScale; }
}
