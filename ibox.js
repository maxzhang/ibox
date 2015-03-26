(function(window) {
    var navigator = window.navigator,
        userAgent = navigator.userAgent,
        isIDevice = /(iPad|iPhone|iPod)\s+OS/i.test(userAgent),
        isAndroid = /Android[\s\/]+[\d.]+/i.test(userAgent),
        isWebkit = /WebKit\/[\d.]+/i.test(userAgent),
        isSafari = isIDevice ? (navigator.standalone ? isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false,
        toString = Object.prototype.toString,
        slice = Array.prototype.slice,
        noop = function() {},
        isString = function(val) {
            return typeof val === 'string';
        },
        isFunction = function(val) {
            return toString.call(val) === '[object Function]';
        },
        proxy = function(fn, scope) {
            return function() {
                return fn.apply(scope, arguments);
            };
        },

        dummyStyle = document.createElement('div').style,
        vendor = (function () {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                t = vendors[i] + 'ransform';
                if ( t in dummyStyle ) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',
        transitionEndEvent = (function() {
            if (vendor == 'webkit' || vendor === 'O') {
                return vendor.toLowerCase() + 'TransitionEnd';
            }
            return 'transitionend';
        })(),

        idSeed = 1000,
        makeId = function(prefix) {
            return (prefix || 'iview-gen') + (++idSeed);
        },
        parsePx = function(px) {
            return px ? parseInt(px.replace(/[^\d]/g, '')) : 0;
        },
        computeWidth = function(el, width) {
            var style = window.getComputedStyle(el, null);
            return width - parsePx(style.marginLeft) - parsePx(style.marginRight) - parsePx(style.paddingLeft) - parsePx(style.paddingRight) - parsePx(style.borderLeftWidth) - parsePx(style.borderRightWidth);
        },
        computeHeight = function(el, height) {
            var style = window.getComputedStyle(el, null);
            return height - parsePx(style.marginTop) - parsePx(style.marginBottom) - parsePx(style.paddingTop) - parsePx(style.paddingBottom) - parsePx(style.borderTopWidth) - parsePx(style.borderBottomWidth);
        },
        createOrientationChangeProxy = function (fn, scope) {
            return function() {
                clearTimeout(scope.orientationChangedTimeout);
                var args = slice.call(arguments, 0);
                scope.orientationChangedTimeout = setTimeout(proxy(function() {
                    var ori = window.orientation;
                    if (ori != scope.lastOrientation) {
                        fn.apply(scope, args);
                    }
                    scope.lastOrientation = ori;
                }, scope), isAndroid ? 300 : 100);
            };
        },
        removeElement = function(el) {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        },
        scrollTop = function() {
            isSafari && window.scrollTo(0, 1);
        },
        iScroll = window.iScroll;

    var iBox = function(target, config) {
        config = config || {};
        for (var o in config) {
            this[o] = config[o];
        }

        this.el = isString(target) ? document.querySelector(target) : target;
        this.el.classList.add('ibox');
        if (this.cls) {
            this.el.classList.add(this.cls);
        }

        this.header = this.el.querySelector('.ibox-header');
        if (!this.header) {
            this.header = document.createElement('div');
            this.el.appendChild(this.header);
        }
        this.header.classList.add('ibox-header');
        if (this.headerCls) {
            this.header.classList.add(this.headerCls);
        }

        this.body = this.el.querySelector('.ibox-body');
        if (!this.body) {
            this.body = document.createElement('div');
            this.el.appendChild(this.body);
        }
        this.body.classList.add('ibox-body');
        if (this.bodyCls) {
            this.body.classList.add(this.bodyCls);
        }

        this.onRender();

        this.resize();
        scrollTop();

        this.views = {};
        var first = this.body.children[0];
        if (first) {
            this.slide({ el: first, silent: true });
        }

        this.resizeProxy = proxy(this.resize, this);
        this.orientationChangeHandlerProxy = createOrientationChangeProxy(this.orientationChangeHandler, this);
        window.addEventListener('resize', this.resizeProxy, false);
        window.addEventListener('orientationchange', this.orientationChangeHandlerProxy, false);
    };

    iBox.prototype = {
        offsets: {
            top: 0,
            bottom: 0
        },

        onRender: noop,

        onResize: noop,

        beforeDestroy: noop,

        onDestroy: noop,

        orientationChangeHandler: function(e) {
            scrollTop();
        },

        slide: function(props, callbacks) {
            var me = this,
                lastView = me.lastView,
                nextView,
                silent, reverse;

            scrollTop();
            if (!me.sliding && props) {
                me.sliding = true;
                props = isString(props) ? { id: props } : props;
                props.id = props.id && (isString(props.id) ? props.id : props.id.getAttribute('id'));
                silent = props.silent === true;
                reverse = props.reverse === true;
                callbacks = callbacks || {};

                nextView = me.views[props.id];
                if (!nextView) {
                    nextView = new iView(me.body, me.header, props);
                    me.views[nextView.id] = nextView;
                }
                nextView.sliding = true;

                if (lastView) {
                    lastView.sliding = true;
                    callbacks.beforeHide && callbacks.beforeHide(lastView);
                    lastView.slide(function() {
                        callbacks.onHide && callbacks.onHide(lastView);
                        if (lastView.single !== true) {
                            lastView.destroy();
                            delete me.views[lastView.id];
                        }
                    }, reverse ? 'right' : 'left', 'out', silent);
                }

                callbacks.beforeShow && callbacks.beforeShow(nextView);
                nextView.slide(function() {
                    me.lastView = nextView;
                    callbacks.onShow && callbacks.onShow(nextView);
                    if (lastView) lastView.sliding = false;
                    me.sliding = nextView.sliding = false;
                    me.resize();
                }, reverse ? 'right' : 'left', 'in', silent);
            }
        },

        resize: function() {
            var innerHeight = window.innerHeight,
                screenWidth = window.screen.width,
                screenHeight = window.screen.height,
                width = window.innerWidth,
                offsetTop = this.offsets.top,
                offsetBottom = this.offsets.bottom,
                height,
                elWidth, elHeight,
                headerWidth, headerHeight,
                bodyWidth, bodyHeight;

            if (this.resizeLocked === true) return;

            offsetTop = isFunction(offsetTop) ? offsetTop() : offsetTop;
            offsetBottom = isFunction(offsetBottom) ? offsetBottom() : offsetBottom;

            if (isSafari) {
                height = navigator.standalone ? innerHeight : (window.orientation == 0 ? screenHeight - 44 : screenWidth - 32) - 20;
                height = height < innerHeight ? innerHeight : height;
            } else {
                height = innerHeight;
            }
            height = height - offsetTop - offsetBottom;
            headerHeight = this.header.offsetHeight;
            bodyHeight = height - headerHeight;

            elWidth = computeWidth(this.el, width);
            elHeight = computeHeight(this.el, height);
            headerWidth = computeWidth(this.header, width);
            headerHeight = computeHeight(this.header, headerHeight);
            bodyWidth = computeWidth(this.body, width);
            bodyHeight = computeHeight(this.body, bodyHeight);

            this.el.style.cssText = 'top:' + offsetTop + 'px;width:' + elWidth + 'px;height:' + elHeight + 'px;';
            this.header.style.cssText = 'top:0px;width:' + headerWidth + 'px;height:' + headerHeight + 'px;';
            this.body.style.cssText = 'top:' + headerHeight + 'px;width:' + bodyWidth + 'px;height:' + bodyHeight + 'px;';

            this.lastView && this.lastView.resize();

            this.onResize(elWidth, elHeight, headerWidth, headerHeight, bodyWidth, bodyHeight);
        },

        getView: function(id) {
            return this.views[id];
        },

        destroy: function() {
            if (!this.destroyed) {
                this.destroyed = true;
                this.beforeDestroy();

                window.removeEventListener('resize', this.resizeProxy, false);
                window.removeEventListener('orientationchange', this.orientationChangeHandlerProxy, false);

                for (var o in this.view) {
                    this.views[o].destroy();
                    delete this.views[o];
                }
                this.lastView = null;

                this.el = this.header = this.body = null;
                this.onDestroy();
            }
        }
    };

    var iView = function(ct, headerCt, config) {
        config = config || {};
        for (var o in config) {
            this[o] = config[o];
        }
        this.ct = ct;
        this.headerCt = headerCt;

        if (this.el) {
            this.el = isString(this.el) ? document.querySelector(this.el) : this.el;
            this.wrapper = this.el.children[0];
            this.single = this.el.getAttribute('data-single') !== 'false';
            this.id = this.el.getAttribute('id');
            this.onRender = this.el.getAttribute('data-render');
            this.onRender = this.onRender ? this.findFn(this.onRender) : noop;
        } else {
            this.el = document.createElement('div');
            this.wrapper = document.createElement('div');
            this.el.appendChild(this.wrapper);
            this.el.style.cssText = 'display:none;';
            ct.appendChild(this.el);
        }
        this.wrapper.classList.add('wrapper');
        if (!this.id) {
            this.id = makeId();
        }
        this.el.setAttribute('id', this.id);
        this.el.classList.add('ibox-view');
        if (this.cls) {
            this.el.classList.add(this.cls);
        }

        if (this.header !== false) {
            var div, conf;
            conf = this.title;
            if (conf) {
                conf = isString(conf) ? { text: conf } : conf;
                div = document.createElement('div');
                div.innerHTML = conf.text;
                div.className = 'title' + (conf.cls ? (' ' + conf.cls) : '');
                div.style.cssText = 'display:none;';
                headerCt.appendChild(div);
                div.setAttribute('data-view', this.id);
                this.title = div;
            } else {
                this.title = headerCt.querySelector('div.title[data-view="' + this.id + '"]');
            }

            conf = this.leftButton;
            if (conf) {
                conf = isString(conf) ? { text: conf } : conf;
                div = document.createElement('div');
                div.innerHTML = conf.text;
                div.className = 'button left' + (conf.back !== false ? ' back' : '') + (conf.cls ? (' ' + conf.cls) : '');
                div.style.cssText = 'display:none;';
                headerCt.appendChild(div);
                div.setAttribute('data-view', this.id);
                this.leftButton = div;
            } else {
                this.leftButton = headerCt.querySelector('div.left[data-view="' + this.id + '"]');
                if (this.leftButton) {
                    conf = {};
                    conf.handler = this.leftButton.getAttribute('data-handler');
                    if (conf.handler) conf.handler = this.findFn(conf.handler);
                }
            }
            if (conf && conf.handler) {
                if (isIDevice || isAndroid) {
                    this.leftButtonHighlightHandler = this.createHighlightHandler(this.leftButton);
                    this.leftButtonHandler = proxy(conf.handler, this);
                    this.leftButton.addEventListener('touchstart', this.leftButtonHighlightHandler, false);
                    this.leftButton.addEventListener('touchend', this.leftButtonHandler, false);
                } else {
                    this.leftButtonHandler = this.createButtonHandler(this.leftButton, conf.handler);
                    this.leftButton.addEventListener('click', this.leftButtonHandler, false);
                }
            }

            conf = this.rightButton;
            if (conf && (conf.text || conf.icon)) {
                conf = isString(conf) ? { text: conf } : conf;
                div = document.createElement('div');
                if (conf.text || conf.icon) {
                    div.innerHTML = conf.text ? conf.text : '<img src="' + conf.icon + '"/>';
                }
                div.className = 'button right' + (conf.cls ? (' ' + conf.cls) : '');
                div.style.cssText = 'display:none;';
                headerCt.appendChild(div);
                div.setAttribute('data-view', this.id);
                this.rightButton = div;
            } else {
                this.rightButton = headerCt.querySelector('div.right[data-view="' + this.id + '"]');
                if (this.rightButton) {
                    conf = {};
                    conf.handler = this.rightButton.getAttribute('data-handler');
                    if (conf.handler) conf.handler = this.findFn(conf.handler);
                }
            }
            if (conf && conf.handler) {
                if (isIDevice || isAndroid) {
                    this.rightButtonHighlightHandler = this.createHighlightHandler(this.rightButton);
                    this.rightButtonHandler = proxy(conf.handler, this);
                    this.rightButton.addEventListener('touchstart', this.rightButtonHighlightHandler, false);
                    this.rightButton.addEventListener('touchend', this.rightButtonHandler, false);
                } else {
                    this.rightButtonHandler = this.createButtonHandler(this.rightButton, conf.handler);
                    this.rightButton.addEventListener('click', this.rightButtonHandler, false);
                }
            }
        }

        if (this.iscroll !== false && iScroll) {
            this.iscroll = new iScroll(this.el, this.scrollConfig);
        }

        this.onRender();
    };

    iView.prototype = {
        onRender: noop,

        onResize: noop,

        beforeDestroy: noop,

        onDestroy: noop,

        createHighlightHandler: function(el) {
            return function() {
                el.classList.add('highlighted');
            };
        },

        createButtonHandler: function(el, fn) {
            var me = this;
            return function() {
                el.classList.add('highlighted');
                fn.call(me);
            };
        },

        findFn: function(method) {
            var fn = window;
            method = method.split('.');
            method.forEach(function(m) {
                fn = fn[m];
            });
            return fn;
        },

        slide: function(cb, direction, action, silent) {
            var me = this,
                ctWidth = me.ct.offsetWidth, ctHeight = me.ct.offsetHeight,
                headerWidth = me.headerCt.offsetWidth,
                leftButtonWidth = 0, rightButtonWidth = 0,
                titleWidth, titleMaxWidth, titleLeft, titleMinLeft,
                elWidth, elHeight,
                beforeStyle, leftButtonAfterStyle, rightButtonAfterStyle, titleAfterStyle, elAfterStyle,
                buttonPadding = 5,
                titleOffset = 10,
                buttonDuration = 350,
                duration = 400,
                cbHandler;

            if (me.leftButton) {
                me.leftButton.classList.remove('highlighted');
                me.leftButton.style.display = 'block';
                leftButtonWidth = me.leftButton.offsetWidth;
                leftButtonAfterStyle = 'display:block;opacity:' + (action == 'in' ? '1' : '0') + ';' + cssVendor + 'transform:translate3d(' + (action == 'in' ? buttonPadding : (direction == 'left' ? -leftButtonWidth : leftButtonWidth)) + 'px,0px,0px);' + (silent === true ? '' : '' + cssVendor + 'transition:' + cssVendor + 'transform ' + buttonDuration + 'ms,opacity ' + buttonDuration + 'ms;');
                if (silent !== true) {
                    if (action == 'in') {
                        beforeStyle = 'display:block;opacity:0;' + cssVendor + 'transform:translate3d(' + (direction == 'left' ? (headerWidth / 2 - leftButtonWidth) : -leftButtonWidth) + 'px,0px,0px);';
                        me.leftButton.style.cssText = beforeStyle;
                    }
                    me.listenTransition(me.leftButton, function() { if (action != 'in' && me.leftButton) me.leftButton.style.display = 'none'; });
                    setTimeout(function() { me.leftButton.style.cssText = leftButtonAfterStyle; }, 0);
                } else {
                    me.leftButton.style.cssText = leftButtonAfterStyle;
                    if (action != 'in') me.leftButton.style.display = 'none';
                }
            }
            if (me.rightButton) {
                me.rightButton.classList.remove('highlighted');
                me.rightButton.style.display = 'block';
                rightButtonWidth = me.rightButton.offsetWidth;
                rightButtonAfterStyle = 'display:block;opacity:' + (action == 'in' ? '1' : '0') + ';' + cssVendor + 'transform:translate3d(' + (headerWidth - buttonPadding - rightButtonWidth) + 'px,0px,0px);' + (silent === true ? '' : '' + cssVendor + 'transition:opacity ' + buttonDuration + 'ms;');
                if (silent !== true) {
                    if (action == 'in') {
                        beforeStyle = 'display:block;opacity:0;' + cssVendor + 'transform:translate3d(' + (headerWidth - buttonPadding - rightButtonWidth) + 'px,0px,0px);';
                        me.rightButton.style.cssText = beforeStyle;
                    }
                    me.listenTransition(me.rightButton, function() { if (action != 'in' && me.rightButton) me.rightButton.style.display = 'none'; });
                    setTimeout(function() { me.rightButton.style.cssText = rightButtonAfterStyle; }, 0);
                } else {
                    me.rightButton.style.cssText = rightButtonAfterStyle;
                    if (action != 'in') me.rightButton.style.display = 'none';
                }
            }
            if (me.title) {
                me.title.style.display = 'block';
                titleWidth = me.title.offsetWidth;
                titleMaxWidth = headerWidth - leftButtonWidth - rightButtonWidth - (buttonPadding * 2) - (titleOffset * 2);
                if (titleWidth > titleMaxWidth) {
                    titleWidth = titleMaxWidth;
                }
                titleLeft = (headerWidth - titleWidth) / 2;
                titleMinLeft = leftButtonWidth + buttonPadding + titleOffset;
                if (titleLeft < titleMinLeft) {
                    titleLeft = titleMinLeft;
                }
                titleAfterStyle = 'display:block;max-width:' + titleMaxWidth + 'px;opacity:' + (action == 'in' ? '1' : '0') + ';' + cssVendor + 'transform:translate3d(' + (action == 'in' ? titleLeft : (direction == 'left' ? '0' : (headerWidth - titleWidth))) + 'px,0px,0px);' + (silent === true ? '' : '' + cssVendor + 'transition:' + cssVendor + 'transform ' + duration + 'ms,opacity ' + duration + 'ms;');
                if (silent !== true) {
                    if (action == 'in') {
                        beforeStyle = 'display:block;max-width:' + titleMaxWidth + 'px;opacity:0;' + cssVendor + 'transform:translate3d(' + (direction == 'left' ? (headerWidth - titleWidth) : 0) + 'px,0px,0px);';
                        me.title.style.cssText = beforeStyle;
                    }
                    me.listenTransition(me.title, function() { if (action != 'in' && me.title) me.title.style.display = 'none'; });
                    setTimeout(function() { me.title.style.cssText = titleAfterStyle; }, 0);
                } else {
                    me.title.style.cssText = titleAfterStyle;
                    if (action != 'in') me.title.style.display = 'none';
                }
            }

            elWidth = computeWidth(me.el, computeWidth(me.ct, ctWidth));
            elHeight = computeHeight(me.el, computeHeight(me.ct, ctHeight));
            elAfterStyle = 'display:block;width:' + elWidth + 'px;height:' + elHeight + 'px;' + cssVendor + 'transform:translate3d(' + (action == 'in' ? '0' : (direction == 'left' ? -ctWidth : ctWidth)) + 'px,0px,0px);' + (silent === true ? '' : '' + cssVendor + 'transition:' + cssVendor + 'transform ' + duration + 'ms');
            cbHandler = function() {
                if (action != 'in' && me.el) {
                    me.el.style.display = 'none';
                } else if (action == 'in' && me.iscroll) {
                    me.iscroll.refresh();
                }
                cb && cb.call(me, elWidth, elHeight);
            };
            if (silent !== true) {
                if (action == 'in') {
                    beforeStyle = 'display:block;width:' + elWidth + 'px;height:' + elHeight + 'px;' + cssVendor + 'transform:translate3d(' + (direction == 'left' ? ctWidth : -ctWidth) + 'px,0px,0px);';
                    me.el.style.cssText = beforeStyle;
                }
                me.listenTransition(me.el, cbHandler);
                setTimeout(function() { me.el.style.cssText = elAfterStyle; }, 50);
            } else {
                me.el.style.cssText = elAfterStyle;
                cbHandler();
            }
        },

        listenTransition: function(target, cb) {
            var me = this,
                handler = function() {
                    target.removeEventListener(transitionEndEvent, handler, false);
                    cb && cb.call(me);
                };
            target.addEventListener(transitionEndEvent, handler, false);
        },

        resize: function() {
            var me = this;
            if (!me.sliding) {
                me.slide(function(elWidth, elHeight) {
                    me.onResize(elWidth, elHeight);
                }, 'left', 'in', true);
            }
        },

        destroy: function() {
            if (!this.destroyed) {
                this.destroyed = true;
                this.beforeDestroy();

                if (this.iscroll) {
                    this.iscroll.destroy();
                    this.iscroll = null;
                }
                if (this.title) {
                    removeElement(this.title);
                    this.title = null;
                }
                if (this.leftButton) {
                    if (isIDevice || isAndroid) {
                        this.leftButton.removeEventListener('touchstart', this.leftButtonHighlightHandler, false);
                        this.leftButton.removeEventListener('touchend', this.leftButtonHandler, false);
                    } else {
                        this.leftButton.removeEventListener('click', this.leftButtonHandler, false);
                    }
                    removeElement(this.leftButton);
                    this.leftButton = null;
                }
                if (this.rightButton) {
                    if (isIDevice || isAndroid) {
                        this.rightButton.removeEventListener('touchstart', this.rightButtonHighlightHandler, false);
                        this.rightButton.removeEventListener('touchend', this.rightButtonHandler, false);
                    } else {
                        this.rightButton.removeEventListener('click', this.rightButtonHandler, false);
                    }
                    removeElement(this.rightButton);
                    this.rightButton = null;
                }

                removeElement(this.el);
                this.el = null;
                this.ct = this.headerCt = null;

                this.onDestroy();
            }
        }
    };

    dummyStyle = null;

    if (typeof define === "function" && (define.amd || seajs)) {
        define('ibox', [], function() {
            return iBox;
        });
    }

    window.iBox = iBox;

})(window);