(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'SnakeGame'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('SnakeGame')
    );
  } else {
    root.GamePresenter = factory(
      root.SnakeGame
    );
  }
})(this, function(SnakeGame) {
  var GamePresenter = function(model, view) {
    Object.defineProperties(this, {
      _model: {
        value: model
      },
      _view: {
        value: view
      },
      _game: {
        value: new SnakeGame({
          wrapper: view._elements.wrapper,
          width: 480,
          height: 360
        })
      }
    });

    var sizes = this._game.getSizes();
    changeSizeWrapper.call(this, sizes);

    initEvents.call(this);
  };
  GamePresenter.prototype.newGame = function() {
    this._game.newGame();
  };
  GamePresenter.prototype.pauseGame = function() {
    var notification = this._game.getNotification();
    if (notification === 'game') {
      this._game.stopGame();
    }
  };
  GamePresenter.prototype.continueGame = function() {
    var notification = this._game.getNotification();
    if (notification !== 'stopGame' ||
      this._view._elements.information.style.display !== 'none')
      return;

    this._game.continueGame();
    this._view._events.trigger('continueGame');
  };

  function changeSizeWrapper(size) {
    var height = ~~(size.height * 0.95);
    var width = ~~(height / 0.75);

    this._view.changeSizeWrapper({
      width: width,
      height: height
    });
  }

  function initEvents() {
    var _this = this;

    this._game.on({
      startGame: function(progress) {
        _this._view._events.trigger('updateProgress', progress);
      },
      gameOver: function(progress) {
        var bestResult = saveToLocalStorage(progress);

        _this._view._events.trigger('gameOver', progress, bestResult);
      },
      eatFood: function(progress) {
        _this._view._events.trigger('updateProgress', progress);
      },
      completeLevel: function(progress) {
        _this._game.stopGame();
        _this._view._events.trigger('updateProgress', progress);
        _this._view._events.trigger('completeLevel', progress.level);
      }
    });
  }

  function saveToLocalStorage(progress) {
    var bestResult = localStorage.getItem('bestResultSnakeGame');
    if (!bestResult) {
      localStorage.setItem('bestResultSnakeGame', JSON.stringify(progress));
    } else {
      bestResult = JSON.parse(bestResult);
      if (progress.score > bestResult.score)
        localStorage.setItem('bestResultSnakeGame', JSON.stringify(progress));
      progress = bestResult;
    }

    return progress;
  }

  return GamePresenter;
});