export class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.speed = 200;
        this.bullets = [];
        this.bulletSpeed = 400;
        // Create circle directly instead of using loader
        this.sprite = scene.add.circle(0, 0, 15, 0x00ff00);
        this.add(this.sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // Enable physics body
        const body = this.body;
        body.setCollideWorldBounds(true);
    }
    update(cursors) {
        const body = this.body;
        // Reset velocity
        body.setVelocity(0);
        // Handle movement
        if (cursors.left.isDown) {
            body.setVelocityX(-this.speed);
        }
        if (cursors.right.isDown) {
            body.setVelocityX(this.speed);
        }
        if (cursors.up.isDown) {
            body.setVelocityY(-this.speed);
        }
        if (cursors.down.isDown) {
            body.setVelocityY(this.speed);
        }
        // Update bullets
        this.bullets.forEach((bullet, index) => {
            if (!bullet.active) {
                this.bullets.splice(index, 1);
                bullet.destroy();
            }
        });
    }
    shoot(targetX, targetY) {
        const bullet = this.scene.add.circle(this.x, this.y, 5, 0xff0000);
        this.bullets.push(bullet);
        this.scene.physics.add.existing(bullet);
        // Calculate direction to target
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        // Set bullet velocity
        const bulletBody = bullet.body;
        this.scene.physics.velocityFromRotation(angle, this.bulletSpeed, bulletBody.velocity);
        // Destroy bullet after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            bullet.destroy();
        });
    }
}
