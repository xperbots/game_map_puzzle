import Phaser from 'phaser';
import { GameMapData } from '../types';
import MapPiece from '../objects/MapPiece';
import MapSlot from '../objects/MapSlot';

export default class GameScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private slots: MapSlot[] = [];
    private pieces: MapPiece[] = [];

    constructor() {
        super('GameScene');
    }

    init(data: { mapData: GameMapData }) {
        this.mapData = data.mapData;
    }

    create() {
        // Soft gradient or solid pastel color
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xfff5f5); // Soft Pink
        bg.setOrigin(0);

        if (!this.mapData) {
            console.error("Map Data missing in GameScene!");
            return;
        }

        // Map Sizing Calculation
        // Original Data is 1600x1200 (approx)
        // We want the MAP (Slots) to fit in the center, maybe 600px height.
        // Scale = 600 / 1200 = 0.5
        // Scale = 1.2 for Mainland focus (Islands might be cut off but puzzle is better)
        const MAP_SCALE = 1.2;
        const SCREEN_CX = this.scale.width / 2;
        const SCREEN_CY = this.scale.height / 2;

        // Shift Map Center slightly UP because China's shape is top-heavy relative to center
        // Center of map data is approx 800, 600.
        const MAP_DATA_CX = 800;
        const MAP_DATA_CY = 500; // Shifted UP (was 600)

        // Colors for pieces
        const PALETTE = [0xffadad, 0xffd6a5, 0xfdffb6, 0xcaffbf, 0x9bf6ff, 0xa0c4ff, 0xbdb2ff, 0xffc6ff];

        this.mapData.provinces.forEach((province, index) => {
            // 1. Create Slot (The Target)
            const slotX = (province.center.x - MAP_DATA_CX) * MAP_SCALE + SCREEN_CX;
            const slotY = (province.center.y - MAP_DATA_CY) * MAP_SCALE + SCREEN_CY;

            const slot = new MapSlot(this, slotX, slotY, province);
            slot.setScale(MAP_SCALE);
            slot.setDepth(0); // Background
            this.add.existing(slot);
            this.slots.push(slot);

            // 2. Create Piece (The Draggable)
            // Scatter logic: Left and Right Columns
            let pieceX, pieceY;
            const MARGIN_X = 50;
            const COLUMN_WIDTH = 250;

            const isLeft = index % 2 === 0;
            if (isLeft) {
                // Left Side
                pieceX = Phaser.Math.Between(MARGIN_X, COLUMN_WIDTH);
            } else {
                // Right Side
                pieceX = Phaser.Math.Between(this.scale.width - COLUMN_WIDTH, this.scale.width - MARGIN_X);
            }
            pieceY = Phaser.Math.Between(100, this.scale.height - 100);

            const piece = new MapPiece(this, pieceX, pieceY, province);
            piece.setScale(MAP_SCALE);
            piece.setDepth(100); // Foreground

            // Random Color
            const color = PALETTE[index % PALETTE.length];
            piece.setTintUnsnapped(color);

            this.add.existing(piece);
            this.pieces.push(piece);

            // Listen for checks
            piece.on('ids-dropped', this.checkSnapping, this);
        });

        // Debug Helper for Automating Verification
        (window as any).solveLevel1 = () => {
            this.pieces.forEach(p => {
                const slot = this.slots.find(s => s.provinceData.adcode === p.provinceData.adcode);
                if (slot) {
                    p.x = slot.x;
                    p.y = slot.y;
                    p.snapTo(slot.x, slot.y);
                }
            });
        };
        (window as any).getDragTargets = () => {
            return this.pieces.filter(p => !p.isSnapped).map(p => {
                const slot = this.slots.find(s => s.provinceData.adcode === p.provinceData.adcode);
                return {
                    pieceX: p.x, pieceY: p.y,
                    targetX: slot?.x, targetY: slot?.y,
                    adcode: p.provinceData.adcode
                };
            });
        };

        this.add.text(10, 10, 'Level 1: Magnetic Map', { fontSize: '24px', color: '#000' });
    }

    private checkSnapping(piece: MapPiece) {
        // Find corresponding slot
        const slot = this.slots.find(s => s.provinceData.adcode === piece.provinceData.adcode);
        if (!slot) return;

        // Calculate distance
        const dist = Phaser.Math.Distance.Between(piece.x, piece.y, slot.x, slot.y);
        const SNAP_THRESHOLD = 50; // pixels

        if (dist < SNAP_THRESHOLD) {
            piece.snapTo(slot.x, slot.y);
            console.log(`Snapped ${piece.provinceData.name}!`);
            this.checkWinCondition();
        }
    }

    private checkWinCondition() {
        const allSnapped = this.pieces.every(p => p.isSnapped);
        if (allSnapped) {
            console.log("All pieces placed! Transitioning...");
            // Slight delay then transition
            this.time.delayedCall(2000, () => {
                this.scene.start('Level2Scene', { mapData: this.mapData });
            });
        }
    }
}
