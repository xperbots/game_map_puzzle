import Phaser from 'phaser';
import { ProvinceData } from '../types';
import { soundManager } from '../utils/SoundManager';

export default class MapPiece extends Phaser.GameObjects.Container {
    private sprite: Phaser.GameObjects.Sprite;
    // State
    public isSnapped: boolean = false;
    public isDragging: boolean = false;
    private baseColor: number = 0xffffff;

    private label: Phaser.GameObjects.Text;
    private labelOffsetX = 0;
    private labelOffsetY = 0;

    constructor(scene: Phaser.Scene, public provinceData: ProvinceData, private baseScale: number, public originalPosition: { x: number, y: number }) {
        super(scene, 0, 0); // Initial position 0,0, will be set by originalPosition later
        this.setData('province', provinceData.name);

        // ...
        this.setData('province', provinceData.name);

        // Set initial position of the container
        this.x = originalPosition.x;
        this.y = originalPosition.y;
        this.setScale(baseScale);

        const textureKey = `province_piece_${provinceData.adcode}`;
        this.sprite = scene.add.sprite(0, 0, textureKey);
        this.add(this.sprite);

        // Alignment Logic:
        // Texture generation used PADDING = 4 and scale = 1.0 (for 3D effect)
        const PADDING = 4; // Must match MapTextureGenerator
        const GEN_SCALE = 1.0;

        // Calculate where the "Center" pixel is in the texture
        const centerPixelX = (provinceData.center.x - provinceData.bounds.minX) * GEN_SCALE + PADDING;
        const centerPixelY = (provinceData.center.y - provinceData.bounds.minY) * GEN_SCALE + PADDING;

        // Verify texture dims
        const texW = this.sprite.width;
        const texH = this.sprite.height;

        // Optimize Origin
        this.sprite.setOrigin(centerPixelX / texW, centerPixelY / texH);

        // Adjust sprite position so (0,0) is the geographic center
        this.sprite.setPosition(0, 0);
        // Sprite Origin was set in MapTextureGenerator logic (or MapPiece.ts previously)
        // Wait, sprite origin is set in MapPiece.ts lines 26-28 based on calculation.
        // We need to keep that.

        // Add Label
        const boundsW = provinceData.bounds.maxX - provinceData.bounds.minX;
        const boundsH = provinceData.bounds.maxY - provinceData.bounds.minY;
        const isSmall = (boundsW < 60 || boundsH < 60); // Threshold for "Small"

        // Special handling for small pieces or specific shapes
        if (isSmall) {
            this.labelOffsetX = boundsW / 2 + 20; // Move to right
        }

        // Short Name Logic
        let displayName = provinceData.name;
        if (provinceData.name.includes('内蒙古')) displayName = '内蒙古';
        else if (provinceData.name.includes('黑龙江')) displayName = '黑龙江';
        else displayName = provinceData.name.substring(0, 2);

        // Create Label on Scene (NOT in Container)
        this.label = scene.add.text(0, 0, displayName, {
            fontSize: '14px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 3,
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        });
        this.label.setOrigin(isSmall ? 0 : 0.5, 0.5);
        this.label.setDepth(2000); // Always on top

        // Hook Scene Update
        this.scene.events.on('update', this.updateLabel, this);
        this.on('destroy', () => {
            if (this.label) this.label.destroy();
            this.scene.events.off('update', this.updateLabel, this);
        });

        // Initialize Label Position
        this.updateLabel();

        // Interactive Hit Area
        // Use sprite texture dimensions (offset by origin logic implicitly handled by Container rect?)
        // No, Container hitArea is relative to Container center (0,0).
        // Sprite is at 0,0 but its top-left is at (-centerPixelX, -centerPixelY) relative to 0,0 due to origin.
        // The HitRect should match the Sprite's visible bounds.
        // Bounds: x = -centerPixelX, y = -centerPixelY, width = texW, height = texH.
        const hitRect = new Phaser.Geom.Rectangle(
            -centerPixelX,
            -centerPixelY,
            texW,
            texH
        );
        this.setInteractive(hitRect, Phaser.Geom.Rectangle.Contains);

        scene.input.setDraggable(this);

        this.on('pointerover', this.onHover, this);
        this.on('pointerout', this.onOut, this);
        this.on('dragstart', this.onDragStart, this);
        this.on('drag', this.onDrag, this);
        this.on('dragend', this.onDragEnd, this);
    }

    // Removed getRelativePoints() as we no longer draw manually

    public setBaseScale(scale: number) {
        this.baseScale = scale;
        this.setScale(scale);
    }

    private onHover() {
        if (this.isSnapped || this.isDragging) return;
        this.sprite.setAlpha(0.8);
        this.setScale(this.baseScale * 1.1);
        this.scene.children.bringToTop(this);
    }

    private onOut() {
        if (this.isSnapped || this.isDragging) return;
        this.sprite.setAlpha(1);
        this.setScale(this.baseScale);
    }

    public setTintUnsnapped(color: number) {
        this.baseColor = color;
        this.sprite.setTint(color);
    }

    private updateLabel() {
        if (!this.active || !this.label) return;
        // Calculate World Position of this Container
        // Since MapPiece is in Scene Update loop, we can just use this.x, this.y relative to parent?
        // If MapPiece is child of Scene, x/y is world.
        // Logic:
        this.label.setPosition(this.x + this.labelOffsetX * this.scaleX, this.y + this.labelOffsetY * this.scaleY);
        this.label.setScale(this.scaleX);
        this.label.setAlpha(this.alpha);
        this.label.setVisible(this.visible);
    }

    // Removed updateGraphicsWithOffset()

    private onDragStart() {
        if (this.isSnapped) return;
        this.isDragging = true;
        soundManager.playPop();
        this.scene.children.bringToTop(this);

        // If we were hovering, we are already scaled 1.1
        // If we drag without hover (touch?), we might need to scale.
        // Assuming mouse, we are hovering.
        // Let's ensure we are at "Drag Scale" which is Base * 1.1 roughly.
        // Simplest logic: If not hovering (scale=1), scale up. If hovering (scale=1.1), keep it?
        // Let's just create a distinct visual state for dragging.

        // Actually, preventing onOut during drag is the key.
        // And we want a slightly larger scale for drag maybe?
        // Let's just keep the hover scale.
        this.setScale(this.baseScale * 1.1);
        this.sprite.setTint(0xffeeee);
    }

    private onDrag(_pointer: any, dragX: number, dragY: number) {
        if (this.isSnapped) return;
        this.x = dragX;
        this.y = dragY;
        this.emit('drag-update', this);
    }

    private onDragEnd() {
        if (this.isSnapped) return;
        this.isDragging = false;

        // Reset visual state
        // If pointer is still over, remain hovered?
        // Phaser input is tricky.
        // Let's just ensure we reset any "extra" scale if we added any.
        // Since we didn't add extra scale in onDragStart, just relies on Hover scale.

        // But what if we dragged out and released outside? onOut didn't run because isDragging=true.
        // So we are still scaled 1.1. 
        // We should check bounds check or just reset to 1.0 if not hovering?
        // Easier: Just reset scale to 1.0 (divide 1.1) and let onHover trigger again if needed?
        // No, if mouse is over, it will flicker.

        // Safe approach: 
        // Restore Tint.
        this.sprite.setTint(this.baseColor);

        // We need to manually check if pointer is Over to decide scale.
        const pointer = this.scene.input.activePointer;
        const isOver = this.getBounds().contains(pointer.x, pointer.y);

        if (!isOver) {
            this.sprite.setAlpha(1);
            this.setScale(this.baseScale);
        } else {
            // If still over, keep hover scale
            this.setScale(this.baseScale * 1.1);
        }

        this.emit('ids-dropped', this);
    }

    public snapTo(x: number, y: number, isCorrect: boolean) {
        this.isSnapped = true;
        this.disableInteractive();
        soundManager.playSnap();
        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            scaleX: this.baseScale, // Shrink to fit!
            scaleY: this.baseScale,
            duration: 200,
            ease: 'Back.Out',
            onComplete: () => {
                if (isCorrect) {
                    this.scene.events.emit('piece-snapped', this);
                    // Switch to Flag Visuals
                    this.visualizeCompletion();
                } else {
                    // If not correct, maybe revert tint or do nothing special
                    this.sprite.setTint(0xffd700); // Gold
                }
            }
        });
    }

    private visualizeCompletion() {
        // Switch texture to Flag (Flat)
        const flagKey = `province_flag_${this.provinceData.adcode}`;
        this.sprite.setTexture(flagKey);

        // Remove 3D Scale/Depth compensation
        // Flat Flag texture is smaller (no depth), PADDING=4
        const PADDING = 4;
        const GEN_SCALE = 1.0;

        // Recalculate Origin for Flat Texture
        const texW = this.sprite.width;
        const texH = this.sprite.height;

        // Center of province relative to texture top-left
        const centerPixelX = (this.provinceData.center.x - this.provinceData.bounds.minX) * GEN_SCALE + PADDING;
        const centerPixelY = (this.provinceData.center.y - this.provinceData.bounds.minY) * GEN_SCALE + PADDING;

        this.sprite.setOrigin(centerPixelX / texW, centerPixelY / texH);

        // Clear Tint (Show Red Flag)
        this.sprite.clearTint();

        // Reset Scale to base (1.0 relative)
        this.setScale(this.baseScale);

        // Update Label Style
        if (this.label) {
            this.label.setColor('#FFFFFF');
            this.label.setStroke('#000000', 2);
            // Ensure depth is still high?
            this.label.setDepth(2001);
        }
    }
}
