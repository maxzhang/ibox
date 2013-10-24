(function(window) {
    var iBoxUtils = window.iBoxUtils,
        slice = Array.prototype.slice;

    /**
     * @class iBox
     */
    var iBox = Klass.define({
        statics: {
            version: '{@VERSION}'
        },

        /**
         * @cfg {String} baseCSSPrefix ibox页面元素样式前缀，默认'ibox'
         */
        baseCSSPrefix: 'ibox',

        /**
         * @cfg {String} cls 添加到ibox主容器元素的扩展样式
         */

        /**
         * @cfg {String} headerCls 添加到header元素的扩展样式
         */

        /**
         * @cfg {String} bodyCls 添加到ibox body元素的扩展样式
         */

        /**
         * @cfg {Object} offsets ibox主容器的偏移值
         */
        offsets: { top: 0, bottom: 0 },

        /**
         * 构造函数
         *
         * @param {Element/Object} target (optional) 目标对象 / iBox 主容器对象
         * @param {Object} config (optional) 配置参数
         */
        constructor: function(target, config) {
            if (iBoxUtils.isObject(target)) {
                config = target;
                target = null;
            }
            target = target || document.body;

            config = config || {};
            for (var o in config) {
                this[o] = config[o];
            }

            this.views = {};

            this.render(target);
            this.scrollTop();
            this.resize();

            var first = this.body.children[0];
            if (first) {
                this.slide({ el: first, silent: true });
            }

            window.addEventListener('resize', this, false);
            window.addEventListener('orientationchange', this, false);
        },

        // private
        render: function(target) {
            if (!this.rendered) {
                this.rendered = true;

                var elCls = this.baseCSSPrefix,
                    hdCls = this.baseCSSPrefix + '-header',
                    bdCls = this.baseCSSPrefix + '-body';

                this.el = iBoxUtils.isString(target) ? document.querySelector(target) : target;
                iBoxUtils.addClass(this.el, elCls);
                if (this.cls) {
                    iBoxUtils.addClass(this.el, this.cls);
                }

                this.header = this.el.querySelector('.' + hdCls);
                if (!this.header) {
                    this.header = document.createElement('div');
                    this.el.appendChild(this.header);
                }
                iBoxUtils.addClass(this.header, hdCls);
                if (this.headerCls) {
                    iBoxUtils.addClass(this.header, this.headerCls);
                }

                this.body = this.el.querySelector('.' + bdCls);
                if (!this.body) {
                    this.body = document.createElement('div');
                    this.el.appendChild(this.body);
                }
                iBoxUtils.addClass(this.body, bdCls);
                if (this.bodyCls) {
                    iBoxUtils.addClass(this.body, this.bodyCls);
                }

                this.onRender();
            }
        },

        /**
         * @protected
         * 当iBox渲染时调用，可以被子类实现或实例化时重写
         */
        onRender: iBoxUtils.noop,

        /**
         * 重置iBox高宽
         */
        resize: function() {
            var innerWidth = window.innerWidth,
                innerHeight = window.innerHeight,
                screenWidth = window.screen.width,
                screenHeight = window.screen.height,
                offsetTop = this.offsets.top,
                offsetBottom = this.offsets.bottom,
                width = innerWidth, height, headerHeight,
                elSize, headerSize, bodySize;

            offsetTop = iBoxUtils.isFunction(offsetTop) ? offsetTop() : offsetTop;
            offsetBottom = iBoxUtils.isFunction(offsetBottom) ? offsetBottom() : offsetBottom;

            if (iBoxUtils.isSafari && !iBoxUtils.os.ios7) { // 计算高度，收起 iOS6 顶部导航条
                height = window.navigator.standalone ? innerHeight : (window.orientation === 0 ? screenHeight - 44 : screenWidth - 32) - 20;
                height = height < innerHeight ? innerHeight : height;
            } else {
                height = innerHeight;
            }
            height = height - offsetTop - offsetBottom;

            if (width != this.lastWidth || height != this.lastHeight) {
                this.lastWidth = width;
                this.lastHeight = height;

                elSize = iBoxUtils.getComputedSize(this.el, { width: width, height: height });
                headerHeight = iBoxUtils.getComputedSize(this.header).outerHeight;
                headerSize = iBoxUtils.getComputedSize(this.header, { width: elSize.innerWidth, height: headerHeight });
                bodySize = iBoxUtils.getComputedSize(this.body, { width: elSize.innerWidth, height: elSize.innerHeight - headerHeight });

                this.el.style.cssText = 'top:' + offsetTop + 'px;width:' + elSize.innerWidth + 'px;height:' + elSize.innerHeight + 'px;';
                this.header.style.cssText = 'top:0px;width:' + headerSize.innerWidth + 'px;height:' + headerSize.innerHeight + 'px;';
                this.body.style.cssText = 'top:' + headerHeight + 'px;width:' + bodySize.innerWidth + 'px;height:' + bodySize.innerHeight + 'px;';

                if (this.lastView && !this.sliding) this.lastView.resize();
                this.onResize(elSize, headerSize, bodySize);
            }
        },

        /**
         * @protected
         * 当iBox重置高宽时调用，可以被子类实现或实例化时重写
         */
        onResize: iBoxUtils.noop,

        /**
         * 切换视图，接口调用包含以下6种方式：
         *
         *      slide(options);
         *
         *      slide(options, callbacks);
         *
         *      slide(options, reverse);
         *
         *      slide(options, reverse, silent);
         *
         *      slide(options, reverse, callbacks);
         *
         *      slide(options, reverse, silent, callbacks);
         *
         * @param {Object/String} options 切换视图参数
         *      新增视图，传入JSON参数，设置视图
         *      已存在视图，直接传入String类型视图id
         * @param {Boolean/Object} reverse (optional) true视图切换动画反向
         * @param {Boolean/Object} silent (optional) true静默切换视图
         * @param {Object} callbacks (optional) 回调函数，show回调对应下一视图，hide回调对应上一视图
         *      Function : beforeShow
         *      Function : onShow
         *      Function : beforeHide
         *      Function : onHide
         */
        slide: function(options, reverse, silent, callbacks) {
            var me = this,
                args = slice.call(arguments, 0), argLen = args.length,
                lastView = me.lastView, nextView;

            me.scrollTop();

            if (options) {
                if (argLen == 2 && !iBoxUtils.isBoolean(reverse)) {
                    callbacks = reverse;
                    reverse = false;
                } if (argLen == 3 && !iBoxUtils.isBoolean(silent)) {
                    callbacks = silent;
                    silent = false;
                }

                options = iBoxUtils.isString(options) ? { id: options } : options;
                options.id = options.id && (iBoxUtils.isString(options.id) ? options.id : options.id.getAttribute('id'));
                silent = silent === true;
                reverse = reverse === true;
                callbacks = callbacks || {};

                nextView = me.views[options.id];
                if (!nextView) {
                    nextView = new iBox.View(me.body, me.header, options);
                    me.views[nextView.id] = nextView;
                }

                if (lastView != nextView && !me.sliding) {
                    me.sliding = true;

                    if (lastView) {
                        if (callbacks.beforeHide) callbacks.beforeHide(lastView);
                        lastView.slide(reverse, 'out', silent, function() {
                            if (callbacks.onHide) callbacks.onHide(lastView);
                            if (lastView.single !== true) {
                                lastView.destroy();
                                delete me.views[lastView.id];
                            }
                        });
                    } else {
                        silent = true; // 没有前一视图时，直接跳过动画切换，这种情况一般会发生在初始化的时候
                    }

                    if (callbacks.beforeShow) callbacks.beforeShow(nextView);
                    nextView.slide(reverse, 'in', silent, function() {
                        me.lastView = nextView;
                        if (callbacks.onShow) callbacks.onShow(nextView);
                        me.sliding = false;
                        me.resize(); // 这里必须是滑动结束之后，才能重置iBox高宽
                    });
                }
            }
        },

        // private
        scrollTop: function() {
            if (iBoxUtils.isSafari) window.scrollTo(0, 1);
        },

        // private
        onOrientationChanged: function(e) {
            this.scrollTop();
            this.resize();
        },

        handleEvent: function(e) {
            switch (e.type) {
                case 'orientationchange':
                    this.onOrientationChanged(e);
                    break;
                case 'resize':
                    this.onResize(e);
                    break;
            }
        },

        /**
         * @protected
         * 当iBox销毁之前调用，可以被子类实现或实例化时重写
         */
        beforeDestroy: iBoxUtils.noop,

        /**
         * @protected
         * 当iBox被销毁时调用，可以被子类实现或实例化时重写
         */
        onDestroy: iBoxUtils.noop,

        /**
         * 销毁iBox对象
         */
        destroy: function() {
            if (!this.destroyed) {
                this.destroyed = true;
                this.beforeDestroy();

                window.removeEventListener('orientationchange', this, false);
                window.removeEventListener('resize', this, false);

                for (var o in this.view) {
                    this.views[o].destroy();
                    delete this.views[o];
                }
                this.views = this.lastView = null;

                iBoxUtils.removeElement(this.header, this.body);
                this.el = this.header = this.body = null;
                this.onDestroy();
            }
        }
    });


    /*
     * 实现 iphone5 分辨率 viewport 兼容，在 iphone5 下，WebApp 被添加到桌面后，从桌面启动时，
     * 可视区域无法达到满屏，所以需要将页面上 viewport width 属性设置为320.1，如下：
     *      <meta name="viewport" content="width=320.1, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0" />
     *
     * 为了适配非 iphone5 设备，仍旧要将 viewport width 设置为 'device-width'
     *
     * Note: 这个问题已在iOS7下被修复。
     */
    (function() {
        function setViewportWidthProperty(value) {
            var viewport = document.querySelector("meta[name=viewport]"),
                content = viewport.content,
                props = content.split(','),
                newProps = [],
                prop,
                wStr = 'width',
                i = 0, len = props.length;
            for (; i < len; i++) {
                prop = props[i].trim().split('=');
                if (prop[0] == wStr) {
                    newProps.push(wStr + '=' + value);
                } else {
                    newProps.push(prop[0] + '=' + prop[1]);
                }
            }
            content = newProps.join(', ');
            if (content.indexOf(wStr + '=') == -1) {
                content = wStr + '=' + value + ', ' + content;
            }
            viewport.content = content;
        }
        if (!iBoxUtils.os.ios7 && iBoxUtils.os.iphone5) {
            setViewportWidthProperty('320.1');
        } else {
            setViewportWidthProperty('device-width');
        }
    }());

    // 声明 AMD / SeaJS module
    if (typeof define === "function" && (define.amd || seajs)) {
        define('ibox', [], function() {
            return iBox;
        });
    }

    window.iBox = iBox;

})(window);