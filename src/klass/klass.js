/**
 * @class klass.Klass
 *
 * 声明类，类的继承，重写类方法
 */
(function(window) {
    var Base = window.BaseKlass;

    var makeCtor = function() {
        function constructor() {
            return this.constructor.apply(this, arguments) || null;
        }
        return constructor;
    };
    
    var extend = function(newClass, newClassExtend) {
        var basePrototype = Base.prototype,
            SuperClass, superPrototype, name;

        if (newClassExtend && newClassExtend !== Object) {
            SuperClass = newClassExtend;
        } else {
            SuperClass = Base;
        }

        superPrototype = SuperClass.prototype;

        if (!SuperClass.$isClass) {
            for (name in basePrototype) {
                if (!superPrototype[name]) {
                    superPrototype[name] = basePrototype[name];
                }
            }
        }

        newClass.extend(SuperClass);
    };
    
    var Klass = {
        /**
         * 声明一个类，或继承自一个父类，子类拥有父类的所有prototype定义的特性，
         * 如未定义extend属性，默认继承BaseKlass类，例子：
         * <code>
         *  var Cls1 = Klass.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  var Cls2 = Klass.define(Cls1, {
         *      constructor: function() {
         *          thia.callParent(['Max']); // 调用父类的构造函数
         *      }
         *  });
         *  
         *  var cls2 = new Cls2();
         *  cls2.say(); // 输出 'Max say: hello, world!'
         * </code>
         *
         * @param {Object} newClassExtend 继承父类
         * @param {Object} overrides 类的属性和方法
         * @return {Klass} The new class
         */
        define: function(newClassExtend, overrides) {
            var newClass, name;

            if (!newClassExtend && !overrides) {
                newClassExtend = Base;
                overrides = {};
            } else if (!overrides) {
                overrides = newClassExtend;
                newClassExtend = Base;
            }
            
            newClass = makeCtor();
            for (name in Base) {
                newClass[name] = Base[name];
            }
            if (overrides.statics) {
                newClass.addStatics(overrides.statics);
                delete overrides.statics;
            }
            extend(newClass, newClassExtend);
            newClass.addMembers(overrides);

            return newClass;
        }
    };
    
    window.Klass = Klass;
})(window);