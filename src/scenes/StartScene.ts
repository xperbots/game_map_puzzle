import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xfff0f0).setOrigin(0);

        // Title
        const titleText = this.add.text(this.scale.width / 2, this.scale.height / 3, '拼拼中国', {
            fontSize: '80px',
            fontStyle: 'bold',
            color: '#333333',
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(this.scale.width / 2, titleText.y + 80, '磁力拼图 · 趣味识地', {
            fontSize: '32px',
            color: '#666666'
        }).setOrigin(0.5);

        // Play Button
        // Create container at the center position
        const btnX = this.scale.width / 2;
        const btnY = this.scale.height * 0.7;

        const btnBg = this.add.rectangle(0, 0, 200, 80, 0xffaa00);
        const btnText = this.add.text(0, 0, '开始游戏', {
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Interactive Button
        const btnContainer = this.add.container(btnX, btnY, [btnBg, btnText]);

        // Make the background interactive (it's at 0,0 inside the container)
        // We need to set hit area correctly because relative 0,0 is center of rect
        btnBg.setInteractive({ useHandCursor: true });

        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0xffcc00);
            this.tweens.add({ targets: btnContainer, scale: 1.1, duration: 100 });
        });

        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0xffaa00);
            this.tweens.add({ targets: btnContainer, scale: 1.0, duration: 100 });
        });

        btnBg.on('pointerdown', () => {
            // Play Button Click
            const mapData = this.cache.json.get('mapData');
            this.registry.set('startTime', Date.now()); // Start Global Timer
            this.scene.start('GameScene', { mapData });
        });

        // Add some animation to title
        this.tweens.add({
            targets: titleText,
            y: titleText.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
