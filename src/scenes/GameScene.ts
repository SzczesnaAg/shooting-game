import "phaser";
import { Player } from "../entities/Player";
import { Zombie } from "../entities/Zombie";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private zombies: Zombie[] = [];
  private spawnInterval: number = 3000; // Initial spawn every 3 seconds
  private minSpawnInterval: number = 500; // Minimum spawn interval
  private difficultyIncrease: number = 100; // Reduce spawn interval by 100ms every 10 seconds
  private gameOver: boolean = false;
  private restartButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Empty preload - we'll create shapes directly in the game
  }

  create() {
    // Reset game state
    this.gameOver = false;
    this.zombies = [];
    this.spawnInterval = 3000; // Reset spawn interval

    // Initialize keyboard
    if (this.input && this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Create player in the middle of the screen
    this.player = new Player(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY
    );

    // Setup shooting on mouse click
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.gameOver) {
        this.player.shoot(pointer.x, pointer.y);
      }
    });

    // Start spawning zombies
    this.time.addEvent({
      delay: this.spawnInterval,
      callback: () => {
        if (!this.gameOver) {
          this.spawnZombie();
        }
      },
      callbackScope: this,
      loop: true,
    });

    // Increase difficulty over time
    this.time.addEvent({
      delay: 10000,
      callback: () => {
        if (!this.gameOver) {
          this.increaseDifficulty();
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (this.gameOver) {
      // Still allow restart button interaction when game is over
      return;
    }

    if (this.cursors) {
      this.player.update(this.cursors);
    }

    // Update zombies - use filter instead of forEach
    this.zombies = this.zombies.filter((zombie) => {
      if (!zombie.active) {
        zombie.destroy(); // Make sure to destroy the zombie
        return false;
      }
      zombie.update();
      return true;
    });

    // Check collisions every frame
    if (!this.gameOver) {
      // Player getting hit by zombie bullets
      this.zombies.forEach((zombie) => {
        zombie.getBullets().forEach((bullet) => {
          if (this.physics.overlap(this.player.getSprite(), bullet)) {
            bullet.destroy();
            this.handlePlayerHit();
          }
        });
      });

      // Zombies getting hit by player bullets
      this.player.getBullets().forEach((bullet) => {
        this.zombies.forEach((zombie) => {
          if (this.physics.overlap(bullet, zombie.getSprite())) {
            bullet.destroy();
            zombie.active = false; // Mark zombie for removal
            zombie.getSprite().destroy(); // Destroy the sprite immediately
          }
        });
      });
    }
  }

  private spawnZombie() {
    const side = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (side) {
      case 0: // top
        x = Phaser.Math.Between(0, this.cameras.main.width);
        y = 0;
        break;
      case 1: // right
        x = this.cameras.main.width;
        y = Phaser.Math.Between(0, this.cameras.main.height);
        break;
      case 2: // bottom
        x = Phaser.Math.Between(0, this.cameras.main.width);
        y = this.cameras.main.height;
        break;
      default: // left
        x = 0;
        y = Phaser.Math.Between(0, this.cameras.main.height);
    }

    const zombie = new Zombie(this, x, y, this.player);
    this.zombies.push(zombie);
  }

  private increaseDifficulty() {
    if (this.spawnInterval > this.minSpawnInterval) {
      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        this.spawnInterval - this.difficultyIncrease
      );
    }
  }

  private handlePlayerHit() {
    if (this.gameOver) return;

    this.gameOver = true;

    // Clean up all zombies
    this.zombies.forEach((zombie) => {
      zombie.destroy();
    });
    this.zombies = [];

    // Create popup background
    const popupBg = this.add
      .rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        400,
        300,
        0x000000,
        0.8
      )
      .setOrigin(0.5);

    // Add hearts to the popup
    const leftHeart = this.add
      .text(
        this.cameras.main.centerX - 150,
        this.cameras.main.centerY - 80,
        "❤️",
        { fontSize: "40px" }
      )
      .setOrigin(0.5);

    const rightHeart = this.add
      .text(
        this.cameras.main.centerX + 150,
        this.cameras.main.centerY - 80,
        "❤️",
        { fontSize: "40px" }
      )
      .setOrigin(0.5);

    // Show game over text with style
    const gameOverText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        "GAME OVER",
        {
          fontSize: "64px",
          color: "#ff0000",
          stroke: "#ffffff",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5);

    // Add restart button with style
    this.restartButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 50,
        "Play Again",
        {
          fontSize: "32px",
          color: "#ffffff",
          backgroundColor: "#4CAF50",
          padding: { x: 20, y: 10 },
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.restart();
      })
      .on("pointerover", () => this.restartButton.setScale(1.1))
      .on("pointerout", () => this.restartButton.setScale(1));

    // Create confetti
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const confetti = this.add.rectangle(
        x,
        -10,
        10,
        10,
        Phaser.Display.Color.HSVToRGB(Math.random(), 1, 1).color
      );

      this.tweens.add({
        targets: confetti,
        y: this.cameras.main.height + 10,
        x: x + Phaser.Math.Between(-100, 100),
        angle: 360,
        duration: Phaser.Math.Between(2000, 3000),
        ease: "Cubic.easeOut",
        onComplete: () => confetti.destroy(),
      });
    }

    // Add made with love text
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 120,
        "Made with ❤️ for Kuba",
        {
          fontSize: "20px",
          color: "#ff69b4",
          fontStyle: "italic",
        }
      )
      .setOrigin(0.5);

    // Add popup animation
    this.tweens.add({
      targets: [
        popupBg,
        gameOverText,
        this.restartButton,
        leftHeart,
        rightHeart,
      ],
      scale: { from: 0, to: 1 },
      duration: 500,
      ease: "Back.easeOut",
    });
  }

  private handleZombieHit(zombie: Zombie) {
    zombie.active = false;
    zombie.getSprite().destroy();
  }
}
