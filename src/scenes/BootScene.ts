import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load the generated map data
        this.load.json('mapData', './map_data.json'); // Loaded from public/ folder
    }

    create() {
        console.log('BootScene started');
        const mapData = this.cache.json.get('mapData');

        if (!mapData) {
            console.error('Failed to load map data');
            return;
        }

        console.log(`Loaded map data: ${mapData.provinces.length} provinces`);

        // Go to StartScene
        this.scene.start('StartScene');
    }
}
