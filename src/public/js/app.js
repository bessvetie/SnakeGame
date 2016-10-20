(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'GameView'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('GameView')
    );
  } else {
    factory(
      root.GameView
    );
  }
})(this, function(GameView) {
  var gameView = new GameView(null, {
    workarea: '#workarea',
    wrapper: '#canvas-wrapper',
    menu: '#game-menu',
    menu_link: '#game-menu-link',
    information: '#game-information',
    gameOptionsOpen: '#game-options-open',
    gameWrapper: '#game-wrapper',
    bottomNavbar: '#bottom-navbar',
    modal: '#modal'
  });
});