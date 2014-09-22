(function() {
  angular.module('gilbox.kapiScroll', []).factory('rekapi', function($document) {
    return new Rekapi($document[0].body);
  }).directive('kapiScroll', function(rekapi, $window) {
    return function(scope, element, attr) {
      var actor, animationFrame, scrollY, update, updating, y;
      actor = rekapi.addActor({
        context: element[0]
      });
      y = 0;
      scrollY = 0;
      animationFrame = new AnimationFrame();
      updating = false;
      update = function() {
        var ad, d;
        d = scrollY - y;
        ad = Math.abs(d);
        if (ad < 1.5) {
          updating = false;
          y = scrollY;
          return rekapi.update(y);
        } else {
          updating = true;
          y += ad > 8 ? d * 0.25 : (d > 0 ? 1 : -1);
          rekapi.update(parseInt(y));
          return animationFrame.request(update);
        }
      };
      scope.$watch(attr.kapiScroll, function(data) {
        var ease, elmEase, keyFrame, kfEase, o, prop, val;
        if (!data) {
          return;
        }
        elmEase = data.ease || 'linear';
        delete data.ease;
        for (scrollY in data) {
          keyFrame = data[scrollY];
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
        y = scrollY = $window.scrollY;
        return update();
      }, true);
      angular.element($window).on('scroll', function() {
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

//# sourceMappingURL=kapi-scroll2.js.map