(function(window) {
    var navigator = window.navigator,
        userAgent = navigator.userAgent,
        android = userAgent.match(/(Android)[\s\/]+([\d\.]+)/),
        ios = userAgent.match(/(iPad|iPhone|iPod);[\w\s]+OS\s([\d_\.]+)/),
        wp = userAgent.match(/(Windows\s+Phone)\s([\d\.]+)/),
        isWebkit = /WebKit\/[\d.]+/i.test(userAgent),
        isSafari = ios ? (navigator.standalone ? isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false,
        os = {};

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
        } else if (ios[1] === 'iPod') {
            os.ipod = true;
        }
    }
    if (wp) {
        os.wp = true;
        os.version = wp[2];
        os.wp8 = /^8/.test(os.version);
    }

    window.supporter = {
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

        /**
         * 是否智能设备
         */
        isSmartDevice: (function() {
            return os.ios || os.android || os.wp;
        }()),

        /**
         * 是否webkit内核浏览器
         */
        isWebkit: isWebkit,

        /**
         * 是否safari浏览器
         */
        isSafari: isSafari
    };
})(window);