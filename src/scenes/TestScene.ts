import Phaser from 'phaser';
import { GameMapData, ProvinceData } from '../types';

/**
 * TestScene - Simple scene with ONLY Inner Mongolia (内蒙古)
 * for debugging drag functionality
 */
export default class TestScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private innerMongolia: ProvinceData | null = null;
    private graphics!: Phaser.GameObjects.Graphics;
    private debugText!: Phaser.GameObjects.Text;

    constructor() {
        super('TestScene');
    }

    init(data: { mapData: GameMapData }) {
        this.mapData = data.mapData;
    }

    create() {
        // Light blue background
        this.cameras.main.setBackgroundColor(0xe0f0ff);

        // Find Inner Mongolia (内蒙古, adcode: 150000)
        this.innerMongolia = this.mapData.provinces.find(p => p.adcode === 150000) || null;

        if (!this.innerMongolia) {
            this.add.text(100, 100, 'ERROR: 内蒙古 not found in map data!', { color: '#ff0000', fontSize: '24px' });
            return;
        }

        // Debug info
        console.log('Inner Mongolia data:', this.innerMongolia);
        console.log('Center:', this.innerMongolia.center);
        console.log('Bounds:', this.innerMongolia.bounds);
        console.log('Points count:', this.innerMongolia.points.length);

        // Create graphics object (NOT using scene.add.graphics!)
        this.graphics = new Phaser.GameObjects.Graphics(this);
        this.add.existing(this.graphics);

        // Draw the province
        this.drawProvince(this.innerMongolia, 400, 300);

        // Make it interactive
        const bounds = this.innerMongolia.bounds;
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;

        // Add invisible draggable rectangle as hit zone (alpha 0.001 to be almost invisible but interactive)
        const hitZone = this.add.rectangle(400, 300, width / 2, height / 2, 0xff0000, 0.001);
        hitZone.setInteractive({ draggable: true });

        // Drag events
        hitZone.on('dragstart', () => {
            console.log('Drag started!');
        });

        hitZone.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            hitZone.x = dragX;
            hitZone.y = dragY;
            // Redraw graphics at new position
            this.drawProvince(this.innerMongolia!, dragX, dragY);
            this.debugText.setText(`Dragging to: (${Math.round(dragX)}, ${Math.round(dragY)})`);
        });

        hitZone.on('dragend', () => {
            console.log('Drag ended at:', hitZone.x, hitZone.y);
        });

        this.input.setDraggable(hitZone);

        // Debug text
        this.debugText = this.add.text(10, 10, '内蒙古 Test Scene\nDrag the red area to move the province', {
            fontSize: '18px',
            color: '#333333',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 10 }
        });

        // Instructions
        this.add.text(10, 80, `Province: ${this.innerMongolia.name}\nCenter: (${Math.round(this.innerMongolia.center.x)}, ${Math.round(this.innerMongolia.center.y)})\nBounds: ${Math.round(width)} x ${Math.round(height)}`, {
            fontSize: '14px',
            color: '#666666'
        });
    }

    private drawProvince(province: ProvinceData, centerX: number, centerY: number) {
        this.graphics.clear();

        // Scale factor to fit on screen (0.8 for high-res 8000x6000 data)
        const SCALE = 0.8;

        // Calculate relative points (相对于省份中心点)
        const relativePoints = province.points.map(p => ({
            x: (p.x - province.center.x) * SCALE + centerX,
            y: (p.y - province.center.y) * SCALE + centerY
        }));

        // Draw shadow
        this.graphics.fillStyle(0x000000, 0.2);
        const shadowPoints = relativePoints.map(p => ({ x: p.x + 5, y: p.y + 5 }));
        this.graphics.fillPoints(shadowPoints, true);

        // Draw main shape
        this.graphics.fillStyle(0x88cc88, 1);
        this.graphics.lineStyle(3, 0x336633, 1); // Thicker line
        this.graphics.fillPoints(relativePoints, true);
        this.graphics.strokePoints(relativePoints, true);

        // Removed debug eyes and center marker
    }
}
