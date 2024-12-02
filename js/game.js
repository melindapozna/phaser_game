let game;

const gameOptions = {
    catSpeed: 300,
    bulletSpeed: 1000,
    spawnChance: 20
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#000022",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 1000,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    
                }
            }
        },
        scene: PlayGame
    }

    game = new Phaser.Game(gameConfig)
    window.focus();
}



class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
        this.score = 0;
        this.health = 9;
        this.bulletGroup;
    }


    preload() {
        this.load.spritesheet("cat", "assets/cat.png", {frameWidth: 64, frameHeight: 58})
        this.load.image("enemy", "assets/ufo.png")
        this.load.image("bullet", "assets/bullet.png")
        this.load.image("potion", "assets/potion.png")
        this.load.image("explosive", "assets/explosion.png")
    }

    create() {
        
        this.add.text(5,10, "Score:", {fontSize: "20px", fill: "#ffffff"})
        this.scoreText = this.add.text(100, 3, "0", {fontSize: "30px", fill: "#ffffff"})
        this.add.text(150,10, "Lives:", {fontSize: "20px", fill: "#ffffff"})
        this.healthText = this.add.text(240, 3, "9", {fontSize: "30px", fill: "#ffffff"})
        this.add.text(game.config.width - 350, 10, "Movement: arrows, shoot: mouse click")

        this.enemyGroup = this.physics.add.group({
            immovable: false,
            allowGravity: false
        })

    

        for(let i = 0; i < 10; i++) {
            this.enemyGroup.create(Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height), "enemy");
        }
      

        this.cat = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "cat")

        //healing items
        this.potionGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        //explosive items group
        this.explosiveGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })
        
        this.bulletGroup = new bulletGroup(this);
		this.addEvents();

        this.physics.add.overlap(this.bulletGroup, this.enemyGroup, this.killEnemy, null, this)
        this.physics.add.overlap(this.cat, this.enemyGroup, this.decreaseHealth, null, this)

        this.physics.add.collider(this.potionGroup, this.cat, this.healCat, null, this)
        this.physics.add.collider(this.explosiveGroup, this.cat, this.explode, null, this)




        this.cursors = this.input.keyboard.createCursorKeys()

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("cat", {start: 0, end: 1}),
            frameRate: 7,
            repeat: -1
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("cat", {start: 2, end: 3}),
            frameRate: 7,
            repeat: -1
        })

        this.triggerTimer = this.time.addEvent({
            callback: this.addEnemy,
            callbackScope: this,
            delay: 200,
            loop: true
        })
    }

    
    killEnemy (bullet, enemy) {
        if (Phaser.Math.Between(0, 100) < gameOptions.spawnChance){
            this.potionGroup.create(enemy.x, enemy.y, "potion")
        } else if (Phaser.Math.Between(0, 100) < gameOptions.spawnChance) {
            this.explosiveGroup.create(enemy.x, enemy.y, "explosive")
        }
        enemy.disableBody(true, true)
        bullet.destroy()
        this.score += 1
        this.scoreText.setText(this.score)
        
    }

    addEnemy() {
        console.log("Adding new stuff!")
        this.enemyGroup.create(Phaser.Math.Between(0, game.config.width), 0, "enemy")
        this.enemyGroup.setVelocityY(gameOptions.catSpeed)
    }

    healCat(cat, potion) {
        this.health += 1
        this.healthText.setText(this.health)
        potion.disableBody(true, true)
    }

    explode(cat, explosive) {
        explosive.disableBody(true, true)
        this.shootbullet(-900, 0)
        this.shootbullet(900, 0)
        this.shootbullet(0, 900)
        this.shootbullet(0, -900)
        var v = Math.trunc(900 / Math.sqrt(2))
        var speeds = [v, -v]
        for (const vx in speeds) {
            for (const vy in speeds) {
                this.shootbullet(speeds[vx], speeds[vy])
            }
        }
    }
    decreaseHealth(cat, start) {
        start.disableBody(true, true)
        
        this.health -= 1
        this.healthText.setText(this.health)
        this.score += 1
        this.scoreText.setText(this.score)
        if (this.health == 0) {
            this.health = 9
            this.score = 0
            this.scene.start("PlayGame")
        }
    }


    addEvents() {
        this.input.on('pointerdown', pointer => {
            this.shootbullet(-900, 0);
        });
    }
    

    shootbullet(velocityY, velocityX) {
        this.bulletGroup.firebullet(this.cat.x, this.cat.y - 20, velocityY, velocityX);
    }

    
    update() {
        if(this.cursors.left.isDown) {
            this.cat.body.velocity.x = -gameOptions.catSpeed
           this.cat.anims.play("left", true)
        }
        else if(this.cursors.right.isDown) {
            this.cat.body.velocity.x = gameOptions.catSpeed
            this.cat.anims.play("right", true)
        }
        else {
            this.cat.body.velocity.x = 0
        }

        if(this.cursors.up.isDown) {
            this.cat.body.velocity.y = -gameOptions.catSpeed
        }
        else if (this.cursors.down.isDown) {
            this.cat.body.velocity.y = gameOptions.catSpeed
        }
        else {
            this.cat.body.velocity.y = 0
            
        }

        if(this.cat.body.velocity.x === 0 && this.cat.body.velocity.y === 0) {
            this.cat.anims.stop()
        }
        
        if(this.cat.y > game.config.height || this.cat.y < 0) {
            this.scene.start("PlayGame")
        }

    }

}


//source code for creating shooting:
//https://codecaptain.io/blog/game-development/shooting-bullets-phaser-3-using-arcade-physics-groups/696
class bulletGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene) {
		
		super(scene.physics.world, scene);
		this.createMultiple({
			classType: Bullet,
			frameQuantity: 50,
			active: false,
			visible: false,
			key: 'bullet'
		})
	}
    firebullet(x, y, velocityY, velocityX) {
        // Get the first available sprite in the group
        const bullet = this.getFirstDead(true);
        if (bullet) {
            bullet.fire(x, y, velocityY, velocityX);
        }
    }
    
 
}
 
class Bullet extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, 'bullet');
	}
    fire(x, y, velocityY, velocityX) {
		this.body.reset(x, y);
 
		this.setActive(true);
		this.setVisible(true);
 
		this.setVelocityY(velocityY);
        this.setVelocityX(velocityX)
	}
    preUpdate(time, delta) {
		super.preUpdate(time, delta);
 
		if (this.y <= 0) {
			this.setActive(false);
			this.setVisible(false);
		}
    }
}