(function(window) {
    var iBoxUtils = window.iBoxUtils;

    /**
     * @class iBox.Header
     *
     * Header抽象类，定义Header子类实现接口
     */
    iBox.Header = Klass.define({
        // private
        constructor: function(viewId, ct, config) {
            config = config || {};
            for (var o in config) {
                this[o] = config[o];
            }

            this.viewId = viewId;
            this.ct = ct;
            this.render();
        },

        // private
        render: function() {
            if (!this.rendered) {
                this.rendered = true;
                this.doRender();
                this.onRender();
            }
        },

        /**
         * @protected
         * 当Header渲染时调用，子类实现
         */
        doRender: iBoxUtils.noop,

        /**
         * @protected
         * 当Header渲染时调用，可以被子类实现或实例化时重写
         */
        onRender: iBoxUtils.noop,

        // private
        slide: function(reverse, action, silent, callbackFn) {
            var me = this;
            me.doSlide(reverse, action, silent, function() {
                if (callbackFn) callbackFn.call(me);
                me.onSlide();
            });
        },

        /**
         * @protected
         * 当Header切换时调用，子类实现
         */
        doSlide: iBoxUtils.noop,

        /**
         * @protected
         * 当Header切换时调用，可以被子类实现或实例化时重写
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
         * 当Header重置高宽时调用，可以被子类实现或实例化时重写
         */
        onResize: iBoxUtils.noop,

        destroy: function() {
            if (!this.destroyed) {
                this.destroyed = true;
                this.beforeDestroy();

                this.doDestroy();

                this.ct = null;
                this.onDestroy();
            }
        },

        /**
         * @protected
         * 当Header销毁时调用，子类实现
         */
        doDestroy: iBoxUtils.noop,

        /**
         * @protected
         * 当Header销毁之前调用，可以被子类实现或实例化时重写
         */
        beforeDestroy: iBoxUtils.noop,

        /**
         * @protected
         * 当Header被销毁时调用，可以被子类实现或实例化时重写
         */
        onDestroy: iBoxUtils.noop
    });
})(window);