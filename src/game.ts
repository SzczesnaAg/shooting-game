import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";

window.onload = () => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#2d2d2d",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: GameScene,
    parent: "game",
  };

  new Phaser.Game(config);
};
