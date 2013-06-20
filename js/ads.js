     if (!Function.prototype.bind) {
        Function.prototype.bind = function(scope) {
          var _function = this;

          return function() {
            return _function.apply(scope, arguments);
          };
        };
      };

      var myAd = function() {
        this.aThreshold = 0.05;
        this.ax = 0;
        this.ay = 0;

        this.el = {};
        this.el.body = document.body;
        this.el.logo = document.querySelector('#google-logo');
        this.el.layers = document.querySelectorAll('.layer');

        // This can be calculated instead:
        // x = (width - 728) / 2
        this.panRange = [{x: 66, y:0},
                         {x: 126, y:0},
                         {x: 154, y:0},
                         {x: 181, y:0}];

        this.setLayerSize();

        setTimeout(this.beginAnimation.bind(this), 1500);
      };
      myAd.prototype.autoplay = function(shouldAutoplay) {
        this.el.body.className = shouldAutoplay ? 'autoplay' : 'motion';
      };
      myAd.prototype.beginAnimation = function() {
        this.bindEvents();
        this.el.body.className = 'intro';
      };
      myAd.prototype.bindEvents = function() {
        document.addEventListener('touchmove', this, false);
        this.el.logo.addEventListener('click', this, false);
        this.el.logo.lastElementChild.addEventListener('webkitTransitionEnd', this, false);
      };
      myAd.prototype.clickHandler = function(e) {
        e.preventDefault();
        // admob.opener.openOverlay(...);
      };
      /** @inheritDoc */
      myAd.prototype.disposeInternal = function() {
        window.removeEventListener('devicemotion', this, false);
        document.removeEventListener('touchmove', this, false);
        this.el.logo.removeEventListener('click', this, false);
        this.el.layers = null;
        this.el.logo = null;
      };
      myAd.prototype.deviceMotionHandler = function(e) {
        var ax, ay;
        switch(window.orientation){
        case -90:
          // Landscape, right-side down
          ay = e.accelerationIncludingGravity.x;
          ax = e.accelerationIncludingGravity.y;
          break;
        case 90:
          // Landscape, left-side down
          ay = -e.accelerationIncludingGravity.x;
          ax = -e.accelerationIncludingGravity.y;
          break;
        case 180:
          // Upside-down portrait
          ay = e.accelerationIncludingGravity.y;
          ax = -e.accelerationIncludingGravity.x;
          break;
        default:
          // Portrait
          ay = -e.accelerationIncludingGravity.y;
          ax = e.accelerationIncludingGravity.x;
        }

        // if (Math.abs(this.ax - ax) > this.aThreshold) {
          this.ax = ax;
        // }
        // if (Math.abs(this.ay - ay) > this.aThreshold) {
          this.ay = ay;
        // }

        var x = this.ax / 7;
        var y = (this.ay - 6) / 5;

        if (x > 1) x = 1;
        if (x < -1) x = -1;
        if (y > 1) y = 1;
        if (y < -1) y = -1;

        this.move(x, y);
      };
      myAd.prototype.deviceOrientationHandler = function(e) {
        switch(window.orientation){
        case -90:
          // Landscape, right-side down
          ay = e.gamma;
          ax = -e.beta;
          break;
        case 90:
          // Landscape, left-side down
          ay = -e.gamma;
          ax = e.beta;
          break;
        case 180:
          // Upside-down portrait
          ay = -e.beta;
          ax = -e.gamma;
          break;
        default:
          // Portrait
          ay = e.beta;
          ax = e.gamma;
        }

        this.ax = ax;
        this.ay = ay;

        var x = this.ax / 45;
        // Expected from 20 to 90
        var y = (this.ay - 55) / 35;

        if (x > 1) x = 1;
        if (x < -1) x = -1;
        if (y > 1) y = 1;
        if (y < -1) y = -1;

        this.move(x, y);
      };
      myAd.prototype.handleEvent = function(e) {
        switch(e.type){
        case 'click':
          this.clickHandler(e);
          break;
        case 'devicemotion':
          this.deviceMotionHandler(e);
          break;
        case 'deviceorientation':
          this.deviceOrientationHandler(e);
          break;
        case 'touchmove':
          e.preventDefault();
          break;
        case 'webkitTransitionEnd':
          this.transitionEndHandler(e);
          break;
        default:
        }
      };
      myAd.prototype.move = function(x, y) {
        var translate;
        for (var i=0, node; node = this.el.layers[i++];) {
          translate = 'translate3d(' + x * this.panRange[i-1].x + 'px,' +
              y * this.panRange[i-1].y + 'px, 0)';
          node.style.WebkitTransform = translate;
        }
      };
      myAd.prototype.setLayerSize = function() {
        for (var i=0, node; node = this.el.layers[i++];) {
          var width = this.panRange[i-1].x * 2 + 728;
          node.style.width = width + 'px';
          node.style.left = -1 * this.panRange[i-1].x + 'px';
        }
      };
      myAd.prototype.transitionEndHandler = function(e) {
        this.el.logo.removeEventListener('webkitTransitionEnd', this, false);
        if (window.DeviceMotionEvent || window.DeviceOrientationEvent) {

          // The iPad 1 has DeviceOrientationEvent defined even though there
          // is no gyroscope present.
          var that = this;
          var orientationTest = function(e) {
            window.removeEventListener('devicemotion', that, false);
            window.removeEventListener('deviceorientation', orientationTest,
                false);
          };

          window.addEventListener('devicemotion', this, false);
          window.addEventListener('deviceorientation', this, false);
          window.addEventListener('deviceorientation', orientationTest, false);

          this.autoplay(false);
        } else {
          this.autoplay(true);
        }
      };

      window.onload = function(e) {
        window.ad = new myAd();
      };