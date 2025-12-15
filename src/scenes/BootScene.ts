import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load the generated map data
        this.load.json('mapData', 'src/assets/map_data.json'); // Note: In build, this should be consistent with base URL
    }

    create() {
        console.log('BootScene started');
        const mapData = this.cache.json.get('mapData');

        if (!mapData) {
            console.error('Failed to load map data');
            return;
        }

        console.log(`Loaded map data: ${mapData.provinces.length} provinces`);

        // Go to GameScene
        this.scene.start('GameScene', { mapData: mapData });
    }
}
