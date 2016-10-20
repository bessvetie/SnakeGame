(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'Observer',
      'GamePresenter'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('Observer'),
      require('GamePresenter')
    );
  } else {
    root.GameView = factory(
      root.Observer,
      root.GamePresenter
    );
  }
})(this, function(Observer, GamePresenter) {
  var GameView = function(model, elements) {
    Object.defineProperties(this, {
      _model: {
        value: model
      },
      _events: {
        value: new Observer()
      },
      _elements: {
        value: {}
      }
    });

    for (var i in elements) {
      this._elements[i] = getTeg(elements[i]);
    }
    this.hideElement(this._elements.menu_link);
    this.hideElement(this._elements.information);
    this.showElement(this._elements.menu);
    this.setDeactivate(this._elements.gameWrapper);
    initEvents.call(this);

    Object.defineProperty(this, '_presenter', {
      value: new GamePresenter(model, this)
    });
  };
  GameView.prototype.showElement = function(element) {
    element.style.display = '';
  };
  GameView.prototype.hideElement = function(element) {
    element.style.display = 'none';
  };
  GameView.prototype.setDeactivate = function(element) {
    element.style.pointerEvents = 'none';
    element.style.opacity = '.5';
  };
  GameView.prototype.delDeactivate = function(element) {
    element.style.pointerEvents = '';
    element.style.opacity = '';
  };
  GameView.prototype.changeSizeWrapper = function(sizes) {
    var wrapper = this._elements.wrapper;

    wrapper.style.width = sizes.width;
    wrapper.style.height = sizes.height;
    wrapper.style.marginTop = -sizes.height / 2;
    wrapper.style.marginLeft = -sizes.width / 2;
  };

  function initEvents() {
    var _this = this;

    this._elements.menu.addEventListener('click', function(event) {
      var options = event.target.closest('a');
      if (options) {
        event.preventDefault();
        var type = options.id.replace('game-options-', '');
        (Object.hasOwnProperty.call(optionsButtonClick, type) &&
          optionsButtonClick[type] ||
          optionsButtonClick._default).call(_this);
      }
    });

    this._elements.gameOptionsOpen.addEventListener('click', function() {
      event.preventDefault();
      _this.showElement(_this._elements.menu);
      _this.setDeactivate(_this._elements.gameWrapper);
      _this._presenter.pauseGame();
    });

    this._elements.modal.addEventListener('click', function() {
      var options = event.target.closest('button');
      if (options) {
        _this.hideElement(_this._elements.information);
        _this.showElement(_this._elements.menu);
      } else {
        _this._presenter.continueGame();
      }
    });

    this._events.on({
      updateProgress: function(progress) {
        var navbar = _this._elements.bottomNavbar;
        var ul = generateProgressList(navbar);
        navbar.innerHTML = '';
        navbar.appendChild(ul);

        changeProgressInfo(ul, progress);
      },
      gameOver: function(progress, bestResult) {
        var information = _this._elements.information;
        var settingsBody = toolSettings.call(_this, 'Game Over', information);

        var div = generateGameOverInfo('You Result', settingsBody, progress);
        div.style.paddingBottom = '30px'

        generateGameOverInfo('Best Result', settingsBody, bestResult);

        _this.showElement(information);
        _this.setDeactivate(_this._elements.gameWrapper);
      },
      continueGame: function() {
        _this.hideElement(_this._elements.menu);
        _this.delDeactivate(_this._elements.gameWrapper);
      },
      completeLevel: function(header) {
        var menu_link = _this._elements.menu_link;
        var settingsBody = toolSettings.call(_this, 'LEVEL ' + header, menu_link);

        _this.showElement(menu_link);
        _this.setDeactivate(_this._elements.gameWrapper);

        setTimeout(function() {
          _this.hideElement(menu_link);
          _this.delDeactivate(_this._elements.gameWrapper);
          _this._presenter.continueGame();
        }, 2000);
      }
    });
  }

  function toolSettings(header, parent) {
    var settingsHeader = parent.querySelectorAll('.settings-header')[0];
    var h2 = settingsHeader.firstElementChild;
    h2.innerHTML = header;

    var settingsBody = parent.querySelectorAll('.settings-body')[0];
    settingsBody.innerHTML = '';
    return settingsBody;
  }

  function generateGameOverInfo(name, parent, progress) {
    var div = document.createElement('div');
    div.className = 'game-information';

    var ul = generateProgressList(div);
    changeProgressInfo(ul, progress);

    var h4 = document.createElement('h4');
    h4.innerHTML = name;
    div.className = 'game-information-progress';
    div.appendChild(h4);

    div.appendChild(ul);
    parent.appendChild(div);

    return div;
  }

  var generateProgressList = function(parent) {
    var className = parent.className + '__';

    var ul = document.createElement('ul');
    ul.className = className + 'list';

    generateProgressListItem(className, 'Level', ul);
    generateProgressListItem(className, 'Length', ul);
    generateProgressListItem(className, 'Score', ul);

    return ul;
  };

  function generateProgressListItem(className, id, parent) {
    var li = document.createElement('li');
    li.className = className + 'item';

    var header = document.createElement('span');
    header.className = className + 'header';
    header.innerHTML = id + ': ';

    var span = document.createElement('span');
    span.className = className + 'info';

    li.appendChild(header);
    li.appendChild(span);
    parent.appendChild(li);
  }

  function changeProgressInfo(elem, progress) {
    var className = elem.className;
    className = '.' + className.slice(0, className.indexOf('__') + 2) + 'info';

    var info = elem.querySelectorAll(className);

    info[0].innerHTML = progress.level;
    info[1].innerHTML = progress.length;
    info[2].innerHTML = progress.score;
  }

  var optionsButtonClick = {
    newGame: function() {
      this._presenter.newGame();

      this.hideElement(this._elements.menu);
      this.delDeactivate(this._elements.gameWrapper);
    },
    _default: function() {
      dummyInformation.call(this);
    }
  };

  function dummyInformation() {
    var information = this._elements.information;
    var settingsBody = toolSettings.call(this, 'Information', information);

    var div = document.createElement('div');
    div.innerHTML = 'This trial version. You can choose only New Game';
    settingsBody.appendChild(div);

    this.hideElement(this._elements.menu);
    this.showElement(information);
    this.setDeactivate(this._elements.gameWrapper);
  }

  function getTeg(selector) {
    return document.querySelector(selector);
  }

  (function(e) {
    e.matches || (e.matches = e.matchesSelector || function(selector) {
      var matches = document.querySelectorAll(selector),
        th = this;
      return Array.prototype.some.call(matches, function(e) {
        return e === th;
      });
    });

    e.closest = e.closest || function(css) {
      var node = this;

      while (node) {
        if (node.matches(css)) return node;
        else node = node.parentElement;
      }
      return null;
    }
  })(Element.prototype);

  return GameView;
});