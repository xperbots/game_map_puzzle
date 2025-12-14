import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xfff0f0).setOrigin(0);

        // Title
        const titleText = this.add.text(this.scale.width / 2, this.scale.height / 3, 'PinPin China', {
            fontSize: '80px',
            fontStyle: 'bold',
            color: '#333333',
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(this.scale.width / 2, titleText.y + 80, 'Magnetic Map Puzzle', {
            fontSize: '32px',
            color: '#666666'
        }).setOrigin(0.5);

        // Play Button
        const btnBg = this.add.rectangle(this.scale.width / 2, this.scale.height * 0.7, 200, 80, 0xffaa00);
        const btnText = this.add.text(this.scale.width / 2, this.scale.height * 0.7, 'PLAY', {
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Interactive Button
        const btnContainer = this.add.container(0, 0, [btnBg, btnText]);
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
            // Get loaded map data from Cache (since BootScene loaded it)
            // Actually, we need to pass it. BootScene passed it to StartScene?
            // BootScene loaded it into Cache?
            // BootScene: load.json('mapData', ...)
            // So it IS in cache.
            const mapData = this.cache.json.get('mapData');
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
