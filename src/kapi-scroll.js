(function() {
  angular.module('gilbox.kapiScroll', []).factory('rekapi', function($document) {
    return new Rekapi($document[0].body);
  }).directive('kapiScroll', function(rekapi, $window) {
    return function(scope, element, attr) {
      var actor, animationFrame, classFrameIdx, classes, classesUpdate, lastScrollY, scrollY, update, updating, y;
      actor = rekapi.addActor({
        context: element[0]
      });
      y = 0;
      lastScrollY = 0;
      scrollY = 0;
      animationFrame = new AnimationFrame();
      updating = false;
      classes = {};
      classes.frames = [];
      classFrameIdx = -1;
      classesUpdate = function(d) {
        var idx, _results;
        if (d <= 0 && classFrameIdx >= 0) {
          idx = classFrameIdx >= classes.frames.length ? classFrameIdx - 1 : classFrameIdx;
          while (idx >= 0 && y < classes.frames[idx]) {
            element.removeClass(classes[classes.frames[idx]]);
            classFrameIdx = --idx;
          }
        }
        if (d >= 0 && classFrameIdx < classes.frames.length) {
          idx = classFrameIdx < 0 ? 0 : classFrameIdx;
          _results = [];
          while (idx < classes.frames.length && y > classes.frames[idx]) {
            element.addClass(classes[classes.frames[idx]]);
            _results.push(classFrameIdx = ++idx);
          }
          return _results;
        }
      };
      update = function() {
        var ad, d;
        d = scrollY - y;
        ad = Math.abs(d);
        if (ad < 1.5) {
          updating = false;
          y = scrollY;
          rekapi.update(y);
        } else {
          updating = true;
          y += ad > 8 ? d * 0.25 : (d > 0 ? 1 : -1);
          rekapi.update(parseInt(y));
          animationFrame.request(update);
        }
        return classesUpdate(d);
      };
      scope.$watch(attr.kapiScroll, function(data) {
        var ease, elmEase, keyFrame, kfEase, o, prop, val;
        if (!data) {
          return;
        }
        elmEase = data.ease || 'linear';
        delete data.ease;
        classes = {};
        classes.frames = [];
        for (scrollY in data) {
          keyFrame = data[scrollY];
          if (keyFrame["class"] != null) {
            classes[scrollY] = keyFrame["class"];
            classes.frames.push(scrollY);
            delete keyFrame["class"];
          }
          ease = {};
          kfEase = elmEase;
          if (keyFrame.ease != null) {
            if (angular.isObject(keyFrame.ease)) {
              ease = keyFrame.ease;
            } else {
              kfEase = keyFrame.ease;
            }
            delete keyFrame.ease;
          }
          for (prop in keyFrame) {
            val = keyFrame[prop];
            if (!angular.isArray(val)) {
              val = [val, kfEase];
            }
            o = {};
            o[prop] = val[1];
            angular.extend(ease, o);
            keyFrame[prop] = val[0];
          }
          actor.keyframe(scrollY, keyFrame, ease);
        }
        classes.frames.sort(function(a, b) {
          return a > b;
        });
        y = scrollY = $window.scrollY;
        return update();
      }, true);
      angular.element($window).on('scroll', function() {
        lastScrollY = scrollY;
        scrollY = $window.scrollY;
        if (!updating) {
          return update();
        }
      });
      return scope.$on('$destroy', function() {
        return rekapi.removeActor(actor);
      });
    };
  });

}).call(this);

//# sourceMappingURL=kapi-scroll.js.map