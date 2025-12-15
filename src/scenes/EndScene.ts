import Phaser from 'phaser';

export default class EndScene extends Phaser.Scene {
    private finalTime: string = '';

    constructor() {
        super('EndScene');
    }

    init(data: { finalTime?: string }) {
        this.finalTime = data.finalTime || '';
    }

    create() {
        this.cameras.main.fadeIn(500, 255, 255, 255);
        this.scene.stop('HUDScene'); // Stop the timer overlay immediately

        const W = this.scale.width;
        const H = this.scale.height;

        // Background
        this.add.rectangle(0, 0, W, H, 0xfff0f0).setOrigin(0);

        // Title
        this.add.text(W / 2, H * 0.3, '恭喜通关！', {
            fontSize: '80px',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Time Message
        let timeStr = this.finalTime;
        if (!timeStr) {
            const startTime = this.registry.get('startTime') as number;
            if (startTime) {
                const duration = Date.now() - startTime;
                const seconds = Math.floor(duration / 1000);
                timeStr = `${seconds} 秒`;
            } else {
                timeStr = "N/A";
            }
        }

        this.add.text(W / 2, H * 0.5, `总耗时: ${timeStr}`, {
            fontSize: '48px',
            color: '#333333'
        }).setOrigin(0.5);

        // Replay Button
        const btnBg = this.add.rectangle(W / 2, H * 0.7, 240, 80, 0x44cc44);
        this.add.text(W / 2, H * 0.7, '再来一次', {
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);

        btnBg.setInteractive({ useHandCursor: true });

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x66dd66));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x44cc44));

        btnBg.on('pointerdown', () => {
            // Restart Game Flow
            this.scene.start('StartScene');
        });
    }
}
