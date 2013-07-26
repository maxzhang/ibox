(function(window) {
    var IScroll = window.IScroll,
        iBoxUtils = window.iBoxUtils;

    /**
     * @clsss iBox.View
     */
    var View = Klass.define({
        statics: {
            idSeed: 1000
        },

        /**
         * @cfg {String} id 视图唯一id，会被设置到视图的主节点元素上
         */

        /**
         * @cfg {String} cls 添加到视图主元素的扩展样式
         */

        /**
         * @cfg {Boolean} single true单例视图
         */

        /**
         * @cfg {Class} headerClass header类，默认iBox.GeneralHeader
         */

        /**
         * @cfg {Object/String} header header配置参数，参见Header类API
         */

        /**
         * @cfg {Object/Boolean} iscroll iScroll组件配置参数，也可以设置为false禁用iScroll组件
         */
        iscroll: { scrollX: false, scrollY: true, preventDefault: true, click: true },

        // private
        constructor: function(ct, headerCt, config) {
            config = config || {};
            for (var o in config) {
                this[o] = config[o];
            }

            this.headerKlass = this.headerKlass || iBox.GeneralHeader;

            this.ct = ct;
            this.headerCt = headerCt;
            this.render();
        },

        // private
        makeId: function() {
            return 'ibox-view-gen' + (++View.idSeed);
        },

        // private
        render: function() {
            if (!this.rendered) {
                this.rendered = true;

                if (this.el) {
                    // 从页面中已存在的DOM元素初始化View
                    this.el = iBoxUtils.isString(this.el) ? document.querySelector(this.el) : this.el;
                    this.scroller = this.el.children[0];
                    this.id = this.el.getAttribute('id');
                    this.single = this.el.getAttribute('data-single') !== 'false';
                    this.onRender = iBoxUtils.queryFunction(this.el.getAttribute('data-render'));
                } else {
                    this.el = document.createElement('div');
                    this.scroller = document.createElement('div');
                    this.el.appendChild(this.scroller);
                    this.el.style.cssText = 'display:none;';
                    this.ct.appendChild(this.el);
                }

                if (!this.id) {
                    this.id = this.makeId();
                }
                iBoxUtils.addClass(this.scroller, 'scroller');
                this.el.setAttribute('id', this.id);
                iBoxUtils.addClass(this.el, 'ibox-view');
                if (this.cls) {
                    iBoxUtils.addClass(this.el, this.cls);
                }

                if (iBoxUtils.isString(this.header)) {
                    this.header = { title: this.header };
                }
                this.header = new this.headerKlass(this.id, this.headerCt, this.header);

                if (this.iscroll !== false && IScroll) {
                    this.iscroll = new IScroll(this.el, this.iscroll);
                }

                this.onRender();
            }
        },

        /**
         * @protected
         * 当View渲染时调用，可以被子类实现或实例化时重写
         */
        onRender: iBoxUtils.noop,

        // private
        slide: function(reverse, action, silent, callbackFn) {
            var me = this,
                ct = me.ct, el = me.el,
                cssVendor = iBoxUtils.vendor.cssVendor,
                ctSize = iBoxUtils.getComputedSize(ct),
                elSize = iBoxUtils.getComputedSize(el, { width: ctSize.outerWidth, height: ctSize.outerHeight }),
                beforeCss, afterCss,
                zIndex = 1, shadow,
                offset = 80,
                duration = 350, defer = 50,
                handler;

            me.header.slide(reverse, action, silent);

            if ((action == 'in' && !reverse) || (action == 'out' && reverse)) {
                zIndex = 2;
                shadow = '-5px 0 20px #dddddd';
            }

            afterCss = 'display:block;z-index:' + zIndex + ';opacity:' + (action == 'in' ? 1 : 0.7) + ';' + cssVendor + 'box-shadow:' + shadow + ';width:' + elSize.innerWidth + 'px;height:' + elSize.innerHeight + 'px;' + cssVendor + 'transform:translate3d(' + (action == 'in' ? '0' : (reverse ? ctSize.width : -offset)) + 'px,0px,0px);' + (silent === true ? '' : cssVendor + 'transition:' + cssVendor + 'transform ' + duration + 'ms,opacity ' + duration + 'ms;');
            handler = function() {
                if (action != 'in' && el) {
                    el.style.display = 'none';
                } else if (action == 'in' && me.iscroll) {
                    me.iscroll.refresh();
                }
                if (callbackFn) callbackFn.call(me, elSize);
                me.onSlide();
            };
            if (silent !== true) {
                if (action == 'in') {
                    beforeCss = 'display:block;z-index:' + zIndex + ';opacity:' + (reverse ? 0.5 : 1) + ';' + cssVendor + 'box-shadow:' + shadow + ';width:' + elSize.innerWidth + 'px;height:' + elSize.innerHeight + 'px;' + cssVendor + 'transform:translate3d(' + (reverse ? -offset : ctSize.width) + 'px,0px,0px);';
                    el.style.cssText = beforeCss;
                }
                iBoxUtils.listenTransition(el, duration + defer, handler);
                setTimeout(function() { el.style.cssText = afterCss; }, defer);
            } else {
                el.style.cssText = afterCss;
                handler();
            }
        },

        /**
         * @protected
         * 当View切换时调用，可以被子类实现或实例化时重写
         */
        onSlide: iBoxUtils.noop,

        // private
        resize: function() {
            var me = this;
            me.slide(false, 'in', true, function(elSize) {
                me.onResize(elSize);
            });
        },

        /**
         * @protected
         * 当View重置高宽时调用，可以被子类实现或实例化时重写
         */
        onResize: iBoxUtils.noop,

        // private
        destroy: function() {
            if (!this.destroyed) {
                this.destroyed = true;
                this.beforeDestroy();

                this.header.destroy();
                this.header = null;

                if (this.iscroll) {
                    this.iscroll.destroy();
                    this.iscroll = null;
                }

                iBoxUtils.removeElement(this.el);
                this.el = this.ct = this.headerCt = null;
                this.onDestroy();
            }
        },

        /**
         * @protected
         * 当View销毁之前调用，可以被子类实现或实例化时重写
         */
        beforeDestroy: iBoxUtils.noop,

        /**
         * @protected
         * 当View被销毁时调用，可以被子类实现或实例化时重写
         */
        onDestroy: iBoxUtils.noop
    });

    iBox.View = View;

})(window);