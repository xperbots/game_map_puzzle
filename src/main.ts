import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import Level2Scene from './scenes/Level2Scene';
import Level2HardScene from './scenes/Level2HardScene';
import TransitionScene from './scenes/TransitionScene';
import TestScene from './scenes/TestScene';

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
            debug: false
        }
    },
    scene: [BootScene, StartScene, GameScene, TransitionScene, Level2HardScene, Level2Scene, TestScene]
};

new Phaser.Game(config);
