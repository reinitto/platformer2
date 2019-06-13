game.PlayScreen = me.ScreenObject.extend({
  /**
   * action to perform on state change
   */

  onResetEvent: function() {
    // load a level
    // set the "Play/Ingame" Screen Object
    me.state.transition('fade', '#FFFFFF', 250);

    // register our player entity in the object pool
    me.pool.register('mainPlayer', game.PlayerEntity);
    me.pool.register('CoinEntity', game.CoinEntity);
    me.pool.register('EnemyEntity', game.EnemyEntity);
    me.pool.register('SpikeEntity', game.SpikeEntity);

    // enable the keyboard
    me.input.bindKey(me.input.KEY.LEFT, 'left');
    me.input.bindKey(me.input.KEY.RIGHT, 'right');
    // map X, Up Arrow and Space for jump
    me.input.bindKey(me.input.KEY.X, 'jump', true);
    me.input.bindKey(me.input.KEY.UP, 'jump', true);
    me.input.bindKey(me.input.KEY.SPACE, 'jump', true);

    // reset the score
    game.data.score = 0;
    game.data.health = 1000;
    // add our HUD to the game world
    this.HUD = new game.HUD.Container();
    me.game.world.addChild(this.HUD, 1000);
    // start the game
    me.levelDirector.loadLevel('area01');
  },

  /**
   * action to perform when leaving this screen (state change)
   */
  onDestroyEvent: function() {
    // remove the HUD from the game world
    me.game.world.removeChild(this.HUD);
  }
});
