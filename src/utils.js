(function(window) {
    var navigator = window.navigator,
        userAgent = navigator.userAgent,
        android = userAgent.match(/(Android)[\s\/]+([\d\.]+)/),
        ios = userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/),
        wp = userAgent.match(/(Windows\s+Phone)\s([\d\.]+)/),
        isWebkit = /WebKit\/[\d.]+/i.test(userAgent),
        isSafari = ios ? (navigator.standalone ? isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false,
        os = {},
        toString = Object.prototype.toString,
        slice = Array.prototype.slice;

    if (android) {
        os.android = true;
        os.version = android[2];
    }
    if (ios) {
        os.ios = true;
        os.version = ios[2].replace(/_/g, '.');
        os.ios7 = /^7/.test(os.version);
        if (ios[1] === 'iPad') {
            os.ipad = true;
        } else if (ios[1] === 'iPhone') {
            os.iphone = true;
            os.iphone5 = window.screen.height == 568;
        } else if (ios[1] === 'iPod') {
            os.ipod = true;
        }
    }
    if (wp) {
        os.wp = true;
        os.version = wp[2];
        os.wp8 = /^8/.test(os.version);
    }

    var Utils = {

        BLANK_IMAGE: 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

        /**
         * 移动设备操作系统信息，可能会包含一下属性:
         *
         *  Boolean : android
         *  Boolean : ios
         *  Boolean : ios7
         *  Boolean : ipad
         *  Boolean : iphone
         *  Boolean : iphone5
         *  Boolean : ipod
         *  String : version 系统版本号
         *
         */
        os: os,

        isMobile: function() {
            return os.ios || os.android || os.wp;
        },

        /**
         * 是否webkit内核浏览器
         */
        isWebkit: isWebkit,

        /**
         * 是否safari浏览器
         */
        isSafari: isSafari,

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

        proxy:function(fn, scope) {
            return function() {
                return fn.apply(scope, arguments);
            };
        },

        createOrientationChangeProxy: function(fn, scope) {
            return function() {
                clearTimeout(scope.orientationChangedTimeout);
                var args = slice.call(arguments, 0);
                scope.orientationChangedTimeout = setTimeout(Utils.proxy(function() {
                    var ori = window.orientation;
                    if (ori != scope.lastOrientation) {
                        fn.apply(scope, args);
                    }
                    scope.lastOrientation = ori;
                }, scope), os.android ? 300 : 50);
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

        vendor: (function() {
            var dummyStyle = document.createElement('div').style,
                propVendor = (function () {
                    var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                        t,
                        i = 0,
                        l = vendors.length;

                    for (; i < l; i++) {
                        t = vendors[i] + 'ransform';
                        if (t in dummyStyle) {
                            return vendors[i].substr(0, vendors[i].length - 1);
                        }
                    }

                    return false;
                }()),
                cssVendor = propVendor ? '-' + propVendor.toLowerCase() + '-' : '',
                prefixStyle = function(style) {
                    if (propVendor === '') return style;
                    style = style.charAt(0).toUpperCase() + style.substr(1);
                    return propVendor + style;
                },
                transform = prefixStyle('transform'),
                transition = prefixStyle('transition'),
                transitionProperty = prefixStyle('transitionProperty'),
                transitionDuration = prefixStyle('transitionDuration'),
                transformOrigin = prefixStyle('transformOrigin'),
                transitionTimingFunction = prefixStyle('transitionTimingFunction'),
                transitionDelay = prefixStyle('transitionDelay'),
                transitionEndEvent = (function() {
                    if (propVendor == 'webkit' || propVendor === 'O') {
                        return propVendor.toLowerCase() + 'TransitionEnd';
                    }
                    return 'transitionend';
                }());

            dummyStyle = null;

            return {
                propVendor: propVendor,
                cssVendor: cssVendor,
                transform: transform,
                transition: transition,
                transitionProperty: transitionProperty,
                transitionDuration: transitionDuration,
                transformOrigin: transformOrigin,
                transitionTimingFunction: transitionTimingFunction,
                transitionDelay: transitionDelay,
                transitionEndEvent: transitionEndEvent
            };
        }()),

        listenTransition: function(target, duration, callbackFn) {
            var me = this,
                transitionEndEvent = Utils.vendor.transitionEndEvent,
                clear = function() {
                    if (target.transitionTimer) clearTimeout(target.transitionTimer);
                    target.transitionTimer = null;
                    target.removeEventListener(transitionEndEvent, handler, false);
                },
                handler = function() {
                    clear();
                    if (callbackFn) callbackFn.call(me);
                };
            clear();
            target.addEventListener(transitionEndEvent, handler, false);
            target.transitionTimer = setTimeout(handler, duration + 100);
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