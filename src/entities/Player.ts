export class Player extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Arc;
  private speed: number = 200;
  private bullets: Phaser.GameObjects.Arc[] = [];
  private bulletSpeed: number = 400;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.sprite = scene.add.circle(x, y, 15, 0x00ff00);
    scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (cursors.left.isDown) {
      body.setVelocityX(-this.speed);
    } else if (cursors.right.isDown) {
      body.setVelocityX(this.speed);
    }

    if (cursors.up.isDown) {
      body.setVelocityY(-this.speed);
    } else if (cursors.down.isDown) {
      body.setVelocityY(this.speed);
    }

    this.x = this.sprite.x;
    this.y = this.sprite.y;

    // Update bullets
    this.bullets.forEach((bullet, index) => {
      if (!bullet.active) {
        this.bullets.splice(index, 1);
        bullet.destroy();
      }
    });
  }

  shoot(targetX: number, targetY: number) {
    const bullet = this.scene.add.circle(this.x, this.y, 5, 0xff0000);
    this.bullets.push(bullet);

    this.scene.physics.add.existing(bullet);
    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
    bulletBody.setCollideWorldBounds(false);

    // Rotate bullet to face direction
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    bullet.setRotation(angle);

    this.scene.physics.velocityFromRotation(
      angle,
      this.bulletSpeed,
      bulletBody.velocity
    );

    this.scene.time.delayedCall(2000, () => {
      bullet.destroy();
    });
  }

  getSprite(): Phaser.GameObjects.Arc {
    return this.sprite;
  }

  getBullets(): Phaser.GameObjects.Arc[] {
    return this.bullets;
  }
}
