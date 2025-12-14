import Phaser from 'phaser';
import { ProvinceData } from '../types';
import { soundManager } from '../utils/SoundManager';

export default class MapPiece extends Phaser.GameObjects.Container {
    public provinceData: ProvinceData;
    private graphics: Phaser.GameObjects.Graphics;

    // Snapping state
    public isSnapped: boolean = false;
    public originalPosition: { x: number, y: number };

    constructor(scene: Phaser.Scene, x: number, y: number, data: ProvinceData) {
        super(scene, x, y);
        this.provinceData = data;
        this.originalPosition = { x, y };

        // Create graphics
        this.graphics = scene.add.graphics();
        // Default color (greyish)
        this.updateGraphicsWithOffset(0xcccccc, 1);
        this.add(this.graphics);

        // Enable physics/input
        this.setSize(this.provinceData.bounds.maxX - this.provinceData.bounds.minX, this.provinceData.bounds.maxY - this.provinceData.bounds.minY);

        // Update graphics with color
        this.updateGraphicsWithOffset(0x88cc88, 1);

        // Interactive
        // Use Rectangle for better reliability/performance than Polygon for now
        // The bounds are calculated from the points, so width/height should be correct.
        this.setSize(this.provinceData.bounds.maxX - this.provinceData.bounds.minX, this.provinceData.bounds.maxY - this.provinceData.bounds.minY);
        this.setInteractive(); // Uses the setSize size (Rectangle) centered on container (if container)
        // Container setInteractive usually requires a hit area or setSize. 
        // setSize sets the width/height, but Container hit area is default strict.
        // Let's use a Circle or Rect explicitly relative to 0,0
        // this.setInteractive(new Phaser.Geom.Rectangle(-this.width/2, -this.height/2, this.width, this.height), Phaser.Geom.Rectangle.Contains);

        scene.input.setDraggable(this);

        this.on('pointerover', this.onHover, this);
        this.on('pointerout', this.onOut, this);
        this.on('dragstart', this.onDragStart, this);
        this.on('drag', this.onDrag, this);
        this.on('dragend', this.onDragEnd, this);
    }

    private getRelativePoints(): Phaser.Geom.Point[] {
        return this.provinceData.points.map(p => new Phaser.Geom.Point(
            p.x - this.provinceData.center.x,
            p.y - this.provinceData.center.y
        ));
    }

    private onHover() {
        if (this.isSnapped) return;
        this.graphics.alpha = 0.8;
        this.scaleX *= 1.1;
        this.scaleY *= 1.1;
        this.scene.children.bringToTop(this);
    }

    private onOut() {
        if (this.isSnapped) return;
        this.graphics.alpha = 1;
        this.scaleX /= 1.1;
        this.scaleY /= 1.1;
    }

    public setTintUnsnapped(color: number) {
        this.updateGraphicsWithOffset(color, 1);
        // Store this color as "base color"? 
        // Actually updateGraphicsWithOffset clears it. 
        // We really need a property to store the assigned color.
        this.baseColor = color;
    }

    private baseColor: number = 0x88cc88;

    private updateGraphicsWithOffset(color: number, alpha: number) {
        this.graphics.clear();

        const relativePoints = this.getRelativePoints();

        // 1. Draw "Thickness" / Shadow (Offset Y slightly)
        this.graphics.fillStyle(0x000000, 0.2);
        const shadowOffset = 4;
        const shadowPoints = relativePoints.map(p => new Phaser.Geom.Point(p.x, p.y + shadowOffset));
        this.graphics.fillPoints(shadowPoints, true);

        // 2. Draw Main Body
        this.graphics.fillStyle(color, alpha);
        this.graphics.lineStyle(2, 0xffffff, 0.8); // White rim check
        this.graphics.fillPoints(relativePoints, true);
        this.graphics.strokePoints(relativePoints, true);

        // 3. Draw Eyes (Cute Face)
        // Simple heuristic: Eyes around (0,0) which is center
        this.graphics.fillStyle(0xffffff, 1);
        // Left Eye
        this.graphics.fillCircle(-10, -5, 4);
        // Right Eye
        this.graphics.fillCircle(10, -5, 4);

        // Pupils
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillCircle(-10, -5, 1.5);
        this.graphics.fillCircle(10, -5, 1.5);
    }

    private onDragStart() {
        if (this.isSnapped) return;
        soundManager.playPop();
        this.scene.children.bringToTop(this);
        // Base scale for map is 1.2
        // We want to scale up slightly from that.
        // But we don't know the "GameScene" MAP_SCALE here directly unless passed.
        // However, we rely on the current scale.
        // If current scale is 1.2, set to 1.3?
        // Or just multiply existing scale.
        this.setScale(this.scaleX * 1.1);
        this.updateGraphicsWithOffset(0xaaffaa, 1); // Highlight
    }

    private onDrag(_pointer: any, dragX: number, dragY: number) {
        if (this.isSnapped) return;
        this.x = dragX;
        this.y = dragY;
    }

    private onDragEnd() {
        if (this.isSnapped) return;
        // Restore to 1.2 (Hardcoded for now or stored?)
        // Better to store initial scale?
        // Let's assume 1.2 is the standard.
        this.setScale(1.2);
        this.updateGraphicsWithOffset(this.baseColor, 1);
        // Emit event for GameScene to check snapping
        this.emit('ids-dropped', this);
    }

    public snapTo(x: number, y: number) {
        this.isSnapped = true;
        this.disableInteractive();
        soundManager.playSnap();
        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            duration: 200,
            ease: 'Back.Out',
            onComplete: () => {
                this.updateGraphicsWithOffset(0xffd700, 1); // Gold color when snapped
            }
        });
    }
}
