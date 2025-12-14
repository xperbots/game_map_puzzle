import Phaser from 'phaser';
import { ProvinceData } from '../types';

export default class MapSlot extends Phaser.GameObjects.Container {
    public provinceData: ProvinceData;
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, data: ProvinceData) {
        super(scene, x, y);
        this.provinceData = data;

        this.graphics = scene.add.graphics();
        this.add(this.graphics);

        this.drawOutline();
    }

    private drawOutline() {
        // Cleaner, thicker outline
        this.graphics.lineStyle(2, 0xaaaaaa, 0.5); // Greyish
        this.graphics.fillStyle(0xffffff, 0.3); // More visible fill

        // Offset points relative to center (because container is at center)
        const relativePoints = this.provinceData.points.map(p => ({
            x: p.x - this.provinceData.center.x,
            y: p.y - this.provinceData.center.y
        }));

        this.graphics.fillPoints(relativePoints, true);
        this.graphics.strokePoints(relativePoints, true);

        // Inner shadow effect (fake) by drawing slightly smaller? 
        // Or just keep it simple. Simple is clean.
    }
}
