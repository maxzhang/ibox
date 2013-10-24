(function(window) {
    var toString = Object.prototype.toString,
        slice = Array.prototype.slice;

    var Utils = {
        BLANK_IMAGE: 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

        noop: function() {},

        isDefined: function(val) {
            return typeof val !== 'undefined';
        },

        isString: function(val) {
            return typeof val === 'string';
        },

        isBoolean: function(val) {
            return typeof val === 'boolean';
        },

        isObject: (toString.call(null) === '[object Object]') ? function(value) {
            // check ownerDocument here as well to exclude DOM nodes
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } : function(value) {
            return toString.call(value) === '[object Object]';
        },

        isArray: ('isArray' in Array) ? Array.isArray : function(val) {
            return toString.call(val) === '[object Array]';
        },

        isFunction: function(val) {
            return toString.call(val) === '[object Function]';
        },

        result: function(val, defaultValue, scope) {
            return !Utils.isDefined(val) ? defaultValue : (Utils.isFunction(val) ? val.call(scope || window) : val);
        },

        proxy:function(fn, scope) {
            return function() {
                return fn.apply(scope, arguments);
            };
        },

        removeElement: function() {
            var args = slice.call(arguments, 0);
            args.forEach(function(el) {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        },

        addClass: function(elem, value) {
            var classes, cur, clazz, i;
            classes = (value || '').match(/\S+/g) || [];
            cur = elem.nodeType === 1 && ( elem.className ? (' ' + elem.className + ' ').replace(/[\t\r\n]/g, ' ') : ' ');
            if (cur) {
                i = 0;
                while ((clazz = classes[i++])) {
                    if (cur.indexOf(' ' + clazz + ' ') < 0) {
                        cur += clazz + ' ';
                    }
                }
                elem.className = cur.trim();
            }
        },

        removeClass: function(elem, value) {
            var classes, cur, clazz, i;
            classes = (value || '').match(/\S+/g) || [];
            cur = elem.nodeType === 1 && ( elem.className ? (' ' + elem.className + ' ').replace(/[\t\r\n]/g, ' ') : ' ');
            if (cur) {
                i = 0;
                while ((clazz = classes[i++])) {
                    while (cur.indexOf(' ' + clazz + ' ') >= 0) {
                        cur = cur.replace(' ' + clazz + ' ', ' ');
                    }
                }
                elem.className = cur.trim();
            }
        },

        parsePx: function(px) {
            return px ? parseInt(px.replace(/[^\d]/g, ''), 10) : 0;
        },

        getComputedSize: function(el, outerSize) {
            var style = window.getComputedStyle(el, null),
                w, h, iw, ih, ow, oh;
            if (!Utils.isDefined(outerSize)) {
                w = el.offsetWidth;
                h = el.offsetHeight;
                iw = w - Utils.parsePx(style.paddingLeft) - Utils.parsePx(style.paddingRight) - Utils.parsePx(style.borderLeftWidth) - Utils.parsePx(style.borderRightWidth);
                ih = h - Utils.parsePx(style.paddingTop) - Utils.parsePx(style.paddingBottom) - Utils.parsePx(style.borderTopWidth) - Utils.parsePx(style.borderBottomWidth);
                ow = w + Utils.parsePx(style.marginLeft) + Utils.parsePx(style.marginRight);
                oh = h + Utils.parsePx(style.marginTop) + Utils.parsePx(style.marginBottom);
            } else {
                if (!Utils.isObject(outerSize)) {
                    outerSize = { width: outerSize };
                }
                ow = outerSize.width;
                oh = outerSize.height;
                if (Utils.isDefined(ow)) {
                    w = ow - Utils.parsePx(style.marginLeft) - Utils.parsePx(style.marginRight);
                    iw = w - Utils.parsePx(style.paddingLeft) - Utils.parsePx(style.paddingRight) - Utils.parsePx(style.borderLeftWidth) - Utils.parsePx(style.borderRightWidth);
                }
                if (Utils.isDefined(oh)) {
                    h = oh - Utils.parsePx(style.marginTop) - Utils.parsePx(style.marginBottom);
                    ih = h - Utils.parsePx(style.paddingTop) - Utils.parsePx(style.paddingBottom) - Utils.parsePx(style.borderTopWidth) - Utils.parsePx(style.borderBottomWidth);
                }
            }
            return {
                width: w < 0 ? 0 : w,
                height: h < 0 ? 0 : h,
                innerWidth: iw < 0 ? 0 : iw,
                innerHeight: ih < 0 ? 0 : ih,
                outerWidth: ow < 0 ? 0 : ow,
                outerHeight: oh < 0 ? 0 : oh
            };
        },

        queryFunction: function(method) {
            var fn;
            if (method && Utils.isString(method)) {
                fn = window;
                method = method.split('.');
                method.forEach(function(m) {
                    fn = fn[m];
                });
            }
            return fn || Utils.noop;
        },

        dispatchClickEvent: function(e) {
            var target = e.target,
                ev;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent('click', true, true, e.view, 1,
                    target.screenX, target.screenY, target.clientX, target.clientY,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                    0, null);

                ev._constructed = true;
                target.dispatchEvent(ev);
            }
        }
    };

    window.iBoxUtils = Utils;

})(window);