import Phaser from 'phaser';
import { GameMapData, ProvinceData } from '../types';

/**
 * Generates textures from map data vectors.
 * Optimizes performance by pre-rendering complex graphics into sprites.
 */
export class MapTextureGenerator {
    private scene: Phaser.Scene;
    private mapData: GameMapData;

    constructor(scene: Phaser.Scene, mapData: GameMapData) {
        this.scene = scene;
        this.mapData = mapData;
    }

    public generateTextures(): void {
        console.log('Generating map textures from vector data...');
        const startTime = performance.now();

        // Base resolution is 8000x6000. 
        // We want textures to be high res but not insane.
        // A scale of 0.2 down from 8000 would be 1600 width (still big).
        // Let's generate reasonably sized textures for 2x retina quality on 1280 screen.
        // Screen width 1280. Max province width might be 1/5 of screen ~250px.
        // 8000 / 250 = 32. 
        // Actually, let's keep the texture generation scale relative to the raw data.
        // Raw bounds width for Inner Mongolia is ~474.
        // If we generate at 1.0 scale, texture is 474x375. This is perfect.
        // Not too big, enough detail.

        this.mapData.provinces.forEach(province => {
            this.generatePieceTexture(province);
            this.generateSlotTexture(province);
            this.generateFlagTexture(province);
        });

        console.log(`Generated ${this.mapData.provinces.length * 2} textures in ${Math.round(performance.now() - startTime)}ms`);
    }

    private generatePieceTexture(province: ProvinceData) {
        const key = `province_piece_${province.adcode}`;
        if (this.scene.textures.exists(key)) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const scale = 1.0;

        const width = (province.bounds.maxX - province.bounds.minX) * scale;
        const height = (province.bounds.maxY - province.bounds.minY) * scale;

        const PADDING = 4;
        const DEPTH = 6;

        const relativePoints = province.points.map(p => ({
            x: (p.x - province.bounds.minX) * scale + PADDING,
            y: (p.y - province.bounds.minY) * scale + PADDING
        }));

        // 1. Extrusion (Sides)
        graphics.fillStyle(0xcccccc, 1);
        graphics.lineStyle(1, 0xbbbbbb, 1);
        for (let i = DEPTH; i > 0; i--) {
            const offsetPoints = relativePoints.map(p => ({ x: p.x, y: p.y + i }));
            graphics.fillPoints(offsetPoints, true);
            graphics.strokePoints(offsetPoints, true);
        }

        // 2. Top Face
        graphics.fillStyle(0xffffff, 1);
        graphics.lineStyle(1, 0x999999, 1); // Dark stroke for definition

        graphics.fillPoints(relativePoints, true);
        graphics.strokePoints(relativePoints, true);

        // 3. Highlight
        graphics.lineStyle(2, 0xffffff, 0.6);
        graphics.strokePoints(relativePoints, true);

        const texWidth = width + PADDING * 2;
        const texHeight = height + PADDING * 2 + DEPTH;
        graphics.generateTexture(key, texWidth, texHeight);

        graphics.destroy();
    }

    private generateSlotTexture(province: ProvinceData) {
        const key = `province_slot_${province.adcode}`;
        if (this.scene.textures.exists(key)) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const scale = 1.0;

        const width = (province.bounds.maxX - province.bounds.minX) * scale;
        const height = (province.bounds.maxY - province.bounds.minY) * scale;

        const PADDING = 4;
        // No Depth for Slot

        const relativePoints = province.points.map(p => ({
            x: (p.x - province.bounds.minX) * scale + PADDING,
            y: (p.y - province.bounds.minY) * scale + PADDING
        }));

        // Flat White Top only
        graphics.fillStyle(0xffffff, 1);
        graphics.lineStyle(1, 0xcccccc, 1); // Lighter stroke for base map

        graphics.fillPoints(relativePoints, true);
        graphics.strokePoints(relativePoints, true);

        // Inner Shadow Simulation? 
        // Maybe just a simple flat shape is cleaner as per user request.
        // User said: "Flat effect is fine".

        const texWidth = width + PADDING * 2;
        const texHeight = height + PADDING * 2; // No depth included
        graphics.generateTexture(key, texWidth, texHeight);

        graphics.destroy();
    }

    private generateFlagTexture(province: ProvinceData) {
        const key = `province_flag_${province.adcode}`;
        if (this.scene.textures.exists(key)) return;

        const scale = 1.0;
        const PADDING = 4;
        const width = (province.bounds.maxX - province.bounds.minX) * scale;
        const height = (province.bounds.maxY - province.bounds.minY) * scale;
        const texWidth = Math.ceil(width + PADDING * 2);
        const texHeight = Math.ceil(height + PADDING * 2);

        // Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = texWidth;
        canvas.height = texHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Path for Clipping
        ctx.beginPath();
        const relativePoints = province.points.map(p => ({
            x: (p.x - province.bounds.minX) * scale + PADDING,
            y: (p.y - province.bounds.minY) * scale + PADDING
        }));

        if (relativePoints.length > 0) {
            ctx.moveTo(relativePoints[0].x, relativePoints[0].y);
            for (let i = 1; i < relativePoints.length; i++) {
                ctx.lineTo(relativePoints[i].x, relativePoints[i].y);
            }
            ctx.closePath();
        }

        ctx.clip(); // Clip everything to province shape

        // Draw Flag Background (Red)
        ctx.fillStyle = '#DE2910';
        ctx.fillRect(0, 0, texWidth, texHeight);

        // Calculate Map Content Bounds (for precise Flag Alignment)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.mapData.provinces.forEach(p => {
            // Assuming p.bounds is accurate projection
            if (p.bounds.minX < minX) minX = p.bounds.minX;
            if (p.bounds.minY < minY) minY = p.bounds.minY;
            if (p.bounds.maxX > maxX) maxX = p.bounds.maxX;
            if (p.bounds.maxY > maxY) maxY = p.bounds.maxY;
        });

        // Calculate Offset relative to Map Content Origin
        // mapOffsetX = The X position of this province's Top-Left relative to the Canvas (0,0)?
        // No, relativePoints are constructed as: p.x - province.bounds.minX.
        // We draw the flag. We want the Flag's (0,0) to coincide with (minX, minY) of the MAP.
        // This province's (0,0) corresponds to (province.bounds.minX, province.bounds.minY).
        // So the offset of "Map Origin" from "Province Origin" is:
        // deltaX = province.bounds.minX - minX.
        // deltaY = province.bounds.minY - minY.

        // We translate the context by (-deltaX, -deltaY) to bring Map Origin to (0,0).
        // Then we draw the stars.

        const contentW = (maxX - minX) * scale;
        // const contentH = (maxY - minY) * scale;

        const deltaX = (province.bounds.minX - minX) * scale - PADDING;
        const deltaY = (province.bounds.minY - minY) * scale - PADDING;

        // Draw Stars (Global Map Coordinates -> Local Canvas)
        this.drawChinaFlagStars(ctx, contentW, deltaX, deltaY);

        // Add to Texture Manager
        this.scene.textures.addCanvas(key, canvas);
    }

    private drawChinaFlagStars(ctx: CanvasRenderingContext2D, mapW: number, offX: number, offY: number) {
        // Flag Specs: 
        // 5 Stars. Large Star at (5,5) of 30x20 grid.
        // PROBLEM: The Map Bounding Box starts at Heilongjiang (North).
        // Xinjiang is South of Heilongjiang. (Lat diff ~13 degrees).
        // So (0,0) of Flag (Top-Left) is in Siberia/Mongolia relative to Xinjiang.
        // We need to shift the stars DOWN to hit Xinjiang.
        // And slightly Right to avoid border cuts.

        const flagW = mapW;
        const unit = flagW / 30; // Grid Unit

        // Shift Deltas (in units)
        const shiftX = 2;
        const shiftY = 6; // Move down significant amount (from y=5 to y=11)

        // Star Definitions (Grid Coords, Radius, Angle)
        // Angle 0 points right (standard canvas arc). 
        // China flag stars rotate to point to big star.
        const stars = [
            { x: 5 + shiftX, y: 5 + shiftY, r: 3, a: -Math.PI / 2 }, // Big Star points Up
            { x: 10 + shiftX, y: 2 + shiftY, r: 1, a: Math.atan2(2 - 5, 10 - 5) },
            { x: 12 + shiftX, y: 4 + shiftY, r: 1, a: Math.atan2(4 - 5, 12 - 5) },
            { x: 12 + shiftX, y: 7 + shiftY, r: 1, a: Math.atan2(7 - 5, 12 - 5) },
            { x: 10 + shiftX, y: 9 + shiftY, r: 1, a: Math.atan2(9 - 5, 10 - 5) }
        ];

        ctx.fillStyle = '#FFDE00';

        ctx.save();
        ctx.translate(-offX, -offY); // Move 'World' to match our crop

        for (const s of stars) {
            this.drawStar(ctx, s.x * unit, s.y * unit, s.r * unit, s.a);
        }

        ctx.restore();
    }

    private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r,
                -Math.sin((18 + i * 72) * Math.PI / 180) * r);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * r * 0.4,
                -Math.sin((54 + i * 72) * Math.PI / 180) * r * 0.4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
