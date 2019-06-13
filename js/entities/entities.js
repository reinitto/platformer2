/**
 * a player entity
 */
game.PlayerEntity = me.Entity.extend({
  /**
   * constructor
   */
  init: function(x, y, settings) {
    // call the constructor
    settings.image = 'mainChar';
    this._super(me.Entity, 'init', [x, y, settings]);

    // max walking & jumping speed
    this.body.setMaxVelocity(3.5, 20);
    this.body.setFriction(0.4, 0);
    // set the display to follow our position on both axis
    me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true;
    // define a basic walking animation (using all frames)
    //translaste rect to match the hitbox
    // this.renderable.translate(-16, 0);
    // this.renderable.addAnimation('walk', [0, 1, 2, 3, 4, 5, 6, 7]);
    this.renderable.translate(-16, 3);
    this.renderable.addAnimation('walk', [
      143,
      144,
      145,
      146,
      147,
      148,
      149,
      150,
      151
    ]);
    this.renderable.setCurrentAnimation('walk');
    // define a standing animation (using the first frame)
    this.renderable.addAnimation('stand', [143]);

    // set the standing animation as default
    this.renderable.setCurrentAnimation('stand');
  },

  /**
   * update the entity
   */
  update: function(dt) {
    // if (this.pos.y > 1000) console.log('dead');
    if (this.pos.y > 1000) {
      game.data.score = 0;
      game.data.health = 1000;
      me.levelDirector.reloadLevel();
    }
    if (game.data.score == 7500) {
      // endgame screen
      me.state.set(me.state.END_GAME, new game.GameOver());

      me.state.change(me.state.END_GAME);
    }
    if (me.input.isKeyPressed('left')) {
      // you win
      // flip the sprite on horizontal axis
      this.renderable.flipX(true);
      // update the default force
      this.body.force.x = -this.body.maxVel.x;
      // change to the walking animation
      if (!this.renderable.isCurrentAnimation('walk')) {
        this.renderable.setCurrentAnimation('walk');
      }
    } else if (me.input.isKeyPressed('right')) {
      // unflip the sprite
      this.renderable.flipX(false);
      // update the entity velocity
      this.body.force.x = this.body.maxVel.x;
      // change to the walking animation
      if (!this.renderable.isCurrentAnimation('walk')) {
        this.renderable.setCurrentAnimation('walk');
      }
    } else {
      this.body.force.x = 0;
      // change to the standing animation
      this.renderable.setCurrentAnimation('stand');
    }

    if (me.input.isKeyPressed('jump')) {
      if (!this.body.jumping && !this.body.falling) {
        // set current vel to the maximum defined value
        // gravity will then do the rest
        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;

        // set the jumping flag
        // this.body.jumping = true;

        // play some audio
        // me.audio.play('jump');
      }
    } else {
      this.body.force.y = 0;
    }

    // apply physics to the body (this moves the entity)
    this.body.update(dt);

    // handle collisions against other shapes
    me.collision.check(this);

    // return true if we moved or if the renderable was updated
    return (
      this._super(me.Entity, 'update', [dt]) ||
      this.body.vel.x !== 0 ||
      this.body.vel.y !== 0
    );
  },

  /**
   * colision handler
   * (called when colliding with other objects)
   */
  /**
   * colision handler
   */
  onCollision: function(response, other) {
    switch (response.b.body.collisionType) {
      case me.collision.types.WORLD_SHAPE:
        // Simulate a platform object
        if (other.type === 'platform') {
          if (
            this.body.falling &&
            !me.input.isKeyPressed('down') &&
            // Shortest overlap would move the player upward
            response.overlapV.y > 0 &&
            // The velocity is reasonably fast enough to have penetrated to the overlap depth
            ~~this.body.vel.y >= ~~response.overlapV.y
          ) {
            // Disable collision on the x axis
            response.overlapV.x = 0;

            // Repond to the platform (it is solid)
            return true;
          }

          // Do not respond to the platform (pass through)
          return false;
        }
        break;

      case me.collision.types.ENEMY_OBJECT:
        if (response.overlapV.y > 0 && !this.body.jumping) {
          // bounce (force jump)
          this.body.falling = false;
          this.body.vel.y = -this.body.maxVel.y * me.timer.tick;

          // set the jumping flag
          this.body.jumping = true;
        } else if (!this.renderable._flicker.isFlickering) {
          if (game.data.health <= 100) {
            this.renderable.flicker(750);
            game.data.health = 1000;
            game.data.score = 0;
            me.levelDirector.reloadLevel();
          } else {
            this.renderable.flicker(750);
            game.data.health -= 50;
          }
        } else {
          // let's flicker in case we touched an enemy

          this.renderable.flicker(750);
        }
        break;
      case me.collision.types.USER:
        if (response.b.name == 'Spike') {
          // bounce (force jump)
          //hasnt been hit

          if (game.data.health <= 1) {
            //restart game
            // this.renderable.flicker(750);
            game.data.health = 1000;
            game.data.score = 0;
            me.levelDirector.reloadLevel();
          } else if (!this.renderable._flicker.isFlickering) {
            // let's flicker in case we touched an enemy
            this.renderable.flicker(750);
            response.overlapV.x = 0;
            response.overlapV.y = 0;
            game.data.health -= 1;
          } else {
            response.overlapV.x = 0;
            response.overlapV.y = 0;
          }
        }
        break;

      default:
        // Do not respond to other objects (e.g. coins)
        return false;
    }

    // Make the object solid
    return true;
  }
});

/**
 * a Coin entity
 */
game.CoinEntity = me.CollectableEntity.extend({
  // extending the init function is not mandatory
  // unless you need to add some extra initialization
  init: function(x, y, settings) {
    // call the parent constructor
    this._super(me.CollectableEntity, 'init', [x, y, settings]);
  },

  // this function is called by the engine, when
  // an object is touched by something (here collected)
  onCollision: function() {
    // do something when collected

    // play a "coin collected" sound
    me.audio.play('cling');

    // give some score
    game.data.score += 250;

    // make sure it cannot be collected "again"
    this.body.setCollisionMask(me.collision.types.NO_OBJECT);

    // remove it
    me.game.world.removeChild(this);
  }
});
// * a Spike entity
// */
game.SpikeEntity = me.Entity.extend({
  init: function(x, y) {
    // call the parent constructor

    let width = 32;
    let height = 32;
    this._super(me.Entity, 'init', [x, y, { width, height, name: 'spike' }]);
    this.name = 'Spike';

    this.body.collisionType = me.collision.types.USER;
  },
  onCollision: function(response) {
    // console.log('response', response);
  }
});

/**
 * an enemy Entity
 */
game.EnemyEntity = me.Entity.extend({
  init: function(x, y, settings) {
    // define this here instead of tiled
    settings.image = 'formal';

    // save the area size defined in Tiled
    var width = settings.width;
    var height = settings.height;

    // adjust the size setting information to match the sprite size
    // so that the entity object is created with the right size
    settings.framewidth = settings.width = 64;
    settings.frameheight = settings.height = 64;
    // redefine the default shape (used to define path) with a shape matching the renderable
    settings.shapes[0] = new me.Rect(
      0,
      0,
      32,
      54
      // settings.framewidth,
      // settings.frameheight
    );

    // call the parent constructor
    this._super(me.Entity, 'init', [x, y, settings]);

    // set start/end position based on the initial area size
    x = this.pos.x;
    this.startX = x;
    this.endX = x + width - settings.framewidth;
    this.pos.x = x + width - settings.framewidth;

    // to remember which side we were walking
    this.walkLeft = false;

    // walking & jumping speed
    this.body.setVelocity(4, 6);
    this.renderable.translate(-16, -6);
    this.renderable.addAnimation('walk', [
      143,
      144,
      145,
      146,
      147,
      148,
      149,
      150,
      151
    ]);
    this.renderable.setCurrentAnimation('walk');
  },

  /**
   * update the enemy pos
   */
  update: function(dt) {
    if (this.alive) {
      if (this.walkLeft && this.pos.x <= this.startX) {
        this.walkLeft = false;
      } else if (!this.walkLeft && this.pos.x >= this.endX) {
        this.walkLeft = true;
      }

      // make it walk
      this.renderable.flipX(this.walkLeft);
      this.body.vel.x += this.walkLeft
        ? -this.body.accel.x * me.timer.tick
        : this.body.accel.x * me.timer.tick;
    } else {
      this.body.vel.x = 0;
    }

    // update the body movement
    this.body.update(dt);

    // handle collisions against other shapes
    me.collision.check(this);

    // return true if we moved or if the renderable was updated
    return (
      this._super(me.Entity, 'update', [dt]) ||
      this.body.vel.x !== 0 ||
      this.body.vel.y !== 0
    );
  },

  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision: function(response, other) {
    if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
      // res.y >0 means touched by something on the bottom
      // which mean at top position for this one
      if (this.alive && response.overlapV.y > 0 && response.a.body.falling) {
        this.renderable.flicker(750);
      }
      return false;
    }
    // Make all other objects solid
    return true;
  }
});
