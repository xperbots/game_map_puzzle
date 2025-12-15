import Phaser from 'phaser';
import { ProvinceData } from '../types';

export default class MapSlot extends Phaser.GameObjects.Container {
    public provinceData: ProvinceData;
    private sprite: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, data: ProvinceData) {
        super(scene, x, y);
        this.provinceData = data;

        const textureKey = `province_slot_${data.adcode}`;
        this.sprite = scene.add.sprite(0, 0, textureKey);
        this.add(this.sprite);

        // Alignment Logic (Matching MapPiece and TextureGenerator)
        const PADDING = 4;
        const GEN_SCALE = 1.0;

        // Calculate where the "Center" pixel is in the texture
        const centerPixelX = (data.center.x - data.bounds.minX) * GEN_SCALE + PADDING;
        const centerPixelY = (data.center.y - data.bounds.minY) * GEN_SCALE + PADDING;

        const texW = this.sprite.width;
        const texH = this.sprite.height;

        this.sprite.setOrigin(centerPixelX / texW, centerPixelY / texH);

        // Visual Style for Slot (Target)
        // White Base Map style
        this.sprite.setTint(0xffffff);
        this.sprite.setAlpha(1);
    }

    public highlight() {
        this.sprite.setTintFill(0xffd700); // Gold fill
        this.sprite.setAlpha(0.8);
    }

    public reset() {
        this.sprite.clearTint();
        this.sprite.setTint(0xffffff); // Back to white
        this.sprite.setAlpha(1);
    }
}
