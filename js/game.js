/* Game namespace */
var game = {
  // an object where to store game information
  data: {
    // score
    score: 0,
    health: 1000
  },

  // Run on page load.
  onload: function() {
    // Initialize the video.
    if (
      !me.video.init(960, 640, {
        wrapper: 'screen',
        scale: 'auto',
        scaleMethod: 'flex-width'
      })
    ) {
      alert('Your browser does not support HTML5 canvas.');
      return;
    }

    // Initialize the audio.
    me.audio.init('mp3,ogg');

    // set and load all resources.
    // (this will also automatically switch to the loading screen)
    me.loader.preload(game.resources, this.loaded.bind(this));
  },

  // Run on game resources loaded.
  loaded: function() {
    // set the "Play/Ingame" Screen Object
    me.state.set(me.state.MENU, new game.TitleScreen());
    // me.state.set(me.state.SCORE, new game.NotATitleScreen());
    // display the menu title
    me.state.change(me.state.MENU);
  }
};
