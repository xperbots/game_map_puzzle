import Phaser from 'phaser';

export type FallingType = 'shape' | 'text';

export default class FallingObject extends Phaser.GameObjects.Container {
    public type: FallingType;
    public adcode: number; // For matching
    public textValue: string; // The capital name or province name (for debug)

    private speed: number;
    private background: Phaser.GameObjects.Rectangle | null = null;
    private graphics: Phaser.GameObjects.Graphics | null = null;
    private label: Phaser.GameObjects.Text | null = null;

    public isSelected: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, type: FallingType, adcode: number, value: string, shapePoints?: { x: number, y: number }[]) {
        super(scene, x, y);
        this.type = type;
        this.adcode = adcode;
        this.textValue = value;
        this.speed = Phaser.Math.Between(50, 150); // Pixels per second

        // Visuals
        if (type === 'text') {
            // Capital Name Block
            const width = 100;
            const height = 40;
            this.background = scene.add.rectangle(0, 0, width, height, 0x4488ff);
            this.add(this.background);

            this.label = scene.add.text(0, 0, value, { fontSize: '20px', color: '#ffffff' });
            this.label.setOrigin(0.5);
            this.add(this.label);

            this.setSize(width, height);
        } else {
            // Province Shape
            // We need to draw the shape centered.
            // Using a circle background for the icon feel? Or just the shape?
            // Spec says "Province Shape".
            this.graphics = scene.add.graphics();
            this.add(this.graphics);

            if (shapePoints) {
                this.graphics.fillStyle(0xffaa00, 1);
                this.graphics.fillPoints(shapePoints, true);
                this.graphics.lineStyle(1, 0xffffff, 1);
                this.graphics.strokePoints(shapePoints, true);

                // Approximate size for interaction
                // We could calculate bounds but for now let's set a standard click area
                this.setSize(100, 100);
            }
        }

        // Interactive
        this.setInteractive();
        this.on('pointerdown', this.onClicked, this);
    }

    private onClicked() {
        this.emit('object-clicked', this);
    }

    public update(delta: number) {
        this.y += this.speed * (delta / 1000);
    }

    public setSelected(selected: boolean) {
        this.isSelected = selected;
        if (this.type === 'text' && this.background) {
            this.background.setFillStyle(selected ? 0xff0000 : 0x4488ff);
        } else if (this.type === 'shape' && this.graphics) {
            this.graphics.alpha = selected ? 0.5 : 1;
        }
    }
}
