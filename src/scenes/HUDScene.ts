import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
    private timeText!: Phaser.GameObjects.Text;
    private startTime: number = 0;

    constructor() {
        super({ key: 'HUDScene', active: false });
    }

    create() {
        this.startTime = this.registry.get('startTime') || Date.now();

        // Display in top-right corner
        this.add.rectangle(this.scale.width - 120, 30, 220, 50, 0x000000, 0.5);

        this.timeText = this.add.text(this.scale.width - 120, 30, 'Time: 0s', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    update() {
        if (!this.startTime) return;

        const now = Date.now();
        const diff = Math.floor((now - this.startTime) / 1000);
        this.timeText.setText(`时间: ${diff}秒`);
    }
}
