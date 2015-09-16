Function.prototype.bind = Function.prototype.bind || require('function-bind');

var bespoke = require('bespoke'),
  nav = require('../../lib/bespoke-nav.js'),
  simulant = require('simulant');

// NOTE there are just enough tests to verify that the bundled plugins are properly loaded
describe('bespoke-nav', function() {
  var KEY = { spaceBar: 32, right: 39 },
    deck,
    createDeck = function() {
      var parent = document.createElement('article');
      for (var i = 1; i <= 5; i++) {
        var section = document.createElement('section');
        parent.appendChild(section);
      }

      deck = bespoke.from(parent, [
        nav({ touch: { threshold: 50 } })
      ]);
    },
    destroyDeck = function() {
      deck.fire('destroy');
      var parentNode = deck.parent.parentNode;
      if (parentNode) parentNode.removeChild(deck.parent);
      deck = null;
    },
    touchEvent = function(type, x, y) {
      var e = document.createEvent('CustomEvent');
      e.initEvent('touch' + type, true, true);
      e.touches = [{ pageX: x, pageY: y }];
      deck.parent.dispatchEvent(e);
    },
    swipe = function(axis, amount) {
      touchEvent('start', axis == 'x' ? amount : 0, axis == 'x' ? 0 : amount);
      touchEvent('move', 0, 0);
      touchEvent('end', 0, 0);
    },
    pressKey = function(which, opts, element) {
      opts = opts ? opts : {};
      opts.which = KEY[which] || which;
      simulant.fire((element || document), 'keydown', opts);
    };

  afterEach(destroyDeck);

  describe('kbd navigation', function() {
    beforeEach(createDeck);

    it('should go to next slide when pressing space bar', function() {
      expect(deck.slide()).toBe(0);
      pressKey(KEY.spaceBar);
      expect(deck.slide()).toBe(1);
    });

    it('should go to next slide when pressing right arrow', function() {
      expect(deck.slide()).toBe(0);
      pressKey(KEY.right);
      expect(deck.slide()).toBe(1);
    });
  });

  describe('touch navigation', function() {
    beforeEach(createDeck);

    it('should go to next slide when swiping right-to-left', function() {
      expect(deck.slide()).toBe(0);
      swipe('x', 51);
      expect(deck.slide()).toBe(1);
    });

    it('should not go to next slide when swiping right-to-left if gap is less than threshold', function() {
      expect(deck.slide()).toBe(0);
      swipe('x', 49);
      expect(deck.slide()).toBe(0);
    });
  });
});
