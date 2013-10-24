(function(window) {
    var vendor = window.vendor,
        slice = Array.prototype.slice,
        isAndroid = /Android/i.test(window.navigator.userAgent);

    window.adapter = {
        createOrientationChangeProxy: function(fn, scope) {
            if (typeof scope === 'undefined') {
                scope = fn;
            }
            return function() {
                clearTimeout(scope.orientationChangedTimeout);
                var args = slice.call(arguments, 0);
                scope.orientationChangedTimeout = setTimeout(function() {
                    var ori = window.orientation;
                    if (ori != scope.lastOrientation) {
                        fn.apply(scope, args);
                    }
                    scope.lastOrientation = ori;
                }, isAndroid ? 300 : 50);
            };
        },

        listenTransition: function(target, duration, callbackFn) {
            var me = this,
                clear = function() {
                    if (target.transitionTimer) clearTimeout(target.transitionTimer);
                    target.transitionTimer = null;
                    target.removeEventListener(vendor.transitionEndEvent, handler, false);
                },
                handler = function() {
                    clear();
                    if (callbackFn) callbackFn.call(me);
                };
            clear();
            target.addEventListener(vendor.transitionEndEvent, handler, false);
            target.transitionTimer = setTimeout(handler, duration + 100);
        }
    };
})(window);