import { Player } from "../entities/Player.js";
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }
    preload() {
        // Instead of using circle loader (which doesn't exist), we'll create circles in create
    }
    create() {
        // Initialize keyboard
        if (this.input && this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
        // Create player in the middle of the screen
        this.player = new Player(this, this.cameras.main.centerX, this.cameras.main.centerY);
        // Setup shooting on mouse click
        this.input.on("pointerdown", (pointer) => {
            this.player.shoot(pointer.x, pointer.y);
        });
    }
    update() {
        if (this.cursors) {
            this.player.update(this.cursors);
        }
    }
}
