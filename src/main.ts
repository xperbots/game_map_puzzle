import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import Level2Scene from './scenes/Level2Scene';

import StartScene from './scenes/StartScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'app',
    backgroundColor: '#fff0f0', // Macaron pinkish
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: true
        }
    },
    scene: [BootScene, StartScene, GameScene, Level2Scene]
};

new Phaser.Game(config);
