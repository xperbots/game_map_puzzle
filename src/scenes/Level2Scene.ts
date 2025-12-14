import Phaser from 'phaser';
import { GameMapData, ProvinceData } from '../types';
import { CAPITALS } from '../data/capitals';
import FallingObject from '../objects/FallingObject';
import { soundManager } from '../utils/SoundManager';

export default class Level2Scene extends Phaser.Scene {
    private mapData!: GameMapData;
    private fallingObjects: Phaser.GameObjects.Group;
    private selectedObject: FallingObject | null = null;

    // Game State
    private score: number = 0;
    private lives: number = 5;
    private spawnTimer: number = 0;
    private spawnInterval: number = 2000; // ms

    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;

    constructor() {
        super('Level2Scene');
        this.fallingObjects = null!; // strict null check hack
    }

    init(data: { mapData: GameMapData }) {
        this.mapData = data.mapData;
    }

    create() {
        // Background - maybe the completed map faded out?
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe0e0ff).setOrigin(0);

        // UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', color: '#000' });
        this.livesText = this.add.text(20, 50, 'Lives: 5', { fontSize: '24px', color: '#ff0000' });

        this.fallingObjects = this.add.group({
            runChildUpdate: true
        });

        // Debug start
        console.log("Level 2 Started");
    }

    update(_time: number, delta: number) {
        // Spawning
        this.spawnTimer += delta;
        if (this.spawnTimer > this.spawnInterval) {
            this.spawnPair();
            this.spawnTimer = 0;
            // Increase difficulty
            if (this.spawnInterval > 500) this.spawnInterval -= 50;
        }

        // Check Bottom Bounds
        this.fallingObjects.children.entries.forEach((child) => {
            const obj = child as FallingObject;
            if (obj.y > this.scale.height) {
                this.handleMiss(obj);
            }
        });
    }

    private spawnPair() {
        if (!this.mapData) return;

        // Pick a random province
        const province = Phaser.Utils.Array.GetRandom(this.mapData.provinces) as ProvinceData;
        const capitalName = CAPITALS[province.name];

        if (!capitalName) {
            console.warn(`No capital found for ${province.name}`);
            return;
        }

        // Spawn Shape
        // Random X
        const shapeX = Phaser.Math.Between(100, this.scale.width - 100);
        // We need points centered relative to (0,0) for the FallingObject
        // Since province.points are absolute, we need to shift them by province.center
        const centeredPoints = province.points.map(p => ({
            x: p.x - province.center.x,
            y: p.y - province.center.y
        }));

        const shapeObj = new FallingObject(this, shapeX, -100, 'shape', province.adcode, province.name, centeredPoints);
        this.add.existing(shapeObj);
        this.fallingObjects.add(shapeObj);

        shapeObj.on('object-clicked', this.onObjectClicked, this);

        // Spawn Name (Delay slightly or same time? Same time for now)
        const textX = Phaser.Math.Between(100, this.scale.width - 100);
        const textObj = new FallingObject(this, textX, -200, 'text', province.adcode, capitalName);
        this.add.existing(textObj);
        this.fallingObjects.add(textObj);

        textObj.on('object-clicked', this.onObjectClicked, this);
    }

    private onObjectClicked(obj: FallingObject) {
        soundManager.playClick(); // Click sound on selection
        if (!this.selectedObject) {
            // Select first
            this.selectedObject = obj;
            obj.setSelected(true);
        } else {
            // Check match
            if (this.selectedObject === obj) {
                // Deselect
                this.selectedObject.setSelected(false);
                this.selectedObject = null;
                return;
            }

            // Check if types are different (Shape vs Text) and adcodes match
            if (this.selectedObject.type !== obj.type && this.selectedObject.adcode === obj.adcode) {
                // Match!
                this.handleMatch(this.selectedObject, obj);
            } else {
                // Mismatch or same type
                console.log("Mismatch!");
                soundManager.playError(); // Error sound
                this.cameras.main.shake(100, 0.01);
                this.selectedObject.setSelected(false);
                this.selectedObject = null;
                // Maybe penalty?
            }
        }
    }

    private handleMatch(obj1: FallingObject, obj2: FallingObject) {
        // Destroy both
        obj1.destroy();
        obj2.destroy();
        this.selectedObject = null;

        soundManager.playDing(); // Success sound
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        // Sound and Particles here
    }

    private handleMiss(obj: FallingObject) {
        obj.destroy();
        if (this.selectedObject === obj) this.selectedObject = null;

        soundManager.playError(); // Error/Miss sound
        this.lives--;
        this.livesText.setText(`Lives: ${this.lives}`);
        this.cameras.main.flash(200, 255, 0, 0);

        if (this.lives <= 0) {
            this.scene.pause();
            this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { fontSize: '64px', color: '#ff0000' }).setOrigin(0.5);
        }
    }
}
