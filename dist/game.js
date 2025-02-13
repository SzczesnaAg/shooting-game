import { GameScene } from "./scenes/GameScene.js";
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: true,
        },
    },
    scene: GameScene,
    parent: "game",
};
new Phaser.Game(config);
