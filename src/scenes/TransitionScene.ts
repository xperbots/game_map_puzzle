import Phaser from 'phaser';
import { GameMapData } from '../types';

/**
 * TransitionScene: Handles visual transition between levels.
 * Shows celebration, fade, and intro text for the next level.
 */
export default class TransitionScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private nextLevel!: string; // 'Level2HardScene' or 'Level3Scene'
    private levelTitle!: string;
    private levelSubtitle!: string;

    constructor() {
        super('TransitionScene');
    }

    init(data: { mapData: GameMapData; nextLevel: string; title: string; subtitle: string }) {
        this.mapData = data.mapData;
        this.nextLevel = data.nextLevel;
        this.levelTitle = data.title || 'Next Level';
        this.levelSubtitle = data.subtitle || '';
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // 1. Background (starts transparent, will fade in)
        const bg = this.add.rectangle(0, 0, W, H, 0xffffff, 0).setOrigin(0);

        // 2. Celebration Text (fades in immediately)
        const celebrationText = this.add.text(W / 2, H / 2 - 50, '🎉 恭喜完成!', {
            fontSize: '48px',
            color: '#ff4444',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        // 3. Next Level Title (appears after fade)
        const titleText = this.add.text(W / 2, H / 2, this.levelTitle, {
            fontSize: '56px',
            color: '#333333',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        // 4. Subtitle
        const subtitleText = this.add.text(W / 2, H / 2 + 60, this.levelSubtitle, {
            fontSize: '24px',
            color: '#666666',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setAlpha(0);

        // --- Animation Timeline ---

        // Step 1: Show Celebration (0-2s)
        this.tweens.add({
            targets: celebrationText,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.Out'
        });

        // Step 2: Fade to White (2-2.5s)
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: bg,
                alpha: 1,
                duration: 500,
                ease: 'Cubic.In'
            });
            this.tweens.add({
                targets: celebrationText,
                alpha: 0,
                duration: 300
            });
        });

        // Step 3: Show Level Title (2.5s-4s)
        this.time.delayedCall(2200, () => {
            this.tweens.add({
                targets: [titleText, subtitleText],
                alpha: 1,
                duration: 400,
                ease: 'Cubic.Out'
            });
        });

        // Step 4: Start Next Level (4s)
        this.time.delayedCall(4000, () => {
            this.cameras.main.fadeOut(500, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(this.nextLevel, { mapData: this.mapData });
            });
        });
    }
}
