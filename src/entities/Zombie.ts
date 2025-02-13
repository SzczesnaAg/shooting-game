import "phaser";

export class Zombie extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Arc;
  private speed: number = 100;
  private bullets: Phaser.GameObjects.Arc[] = [];
  private bulletSpeed: number = 200;
  private shootInterval: number = 2000; // Shoot every 2 seconds
  private target: Phaser.GameObjects.Container;
  private shootTimer: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Phaser.GameObjects.Container
  ) {
    super(scene, x, y);

    this.target = target;
    this.sprite = scene.add.circle(x, y, 15, 0xff0000);
    scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    this.shootTimer = this.scene.time.addEvent({
      delay: this.shootInterval,
      callback: this.shoot,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      this.target.x,
      this.target.y
    );

    this.scene.physics.velocityFromRotation(angle, this.speed, body.velocity);
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

  private shoot() {
    const bullet = this.scene.add.circle(
      this.sprite.x,
      this.sprite.y,
      5,
      0x00ff00
    ); // Green bullets for zombies
    this.bullets.push(bullet);

    this.scene.physics.add.existing(bullet);
    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
    bulletBody.setCollideWorldBounds(false);

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      this.target.x,
      this.target.y
    );

    this.scene.physics.velocityFromRotation(
      angle,
      this.bulletSpeed,
      bulletBody.velocity
    );

    // Destroy bullet after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      bullet.destroy();
    });
  }

  destroy() {
    if (this.shootTimer) {
      this.shootTimer.destroy();
    }

    this.bullets.forEach((bullet) => bullet.destroy());

    if (this.sprite) {
      this.sprite.destroy();
    }

    super.destroy();
  }

  getSprite(): Phaser.GameObjects.Arc {
    return this.sprite;
  }

  getBullets(): Phaser.GameObjects.Arc[] {
    return this.bullets;
  }
}
