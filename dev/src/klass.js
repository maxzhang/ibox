(function() {
    var global = this,
        slice = Array.prototype.slice,
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'],
        noArgs = [],
        TemplateClass = function() {},
        chain = function(object) {
            TemplateClass.prototype = object;
            var result = new TemplateClass();
            TemplateClass.prototype = null;
            return result;
        },
        apply = function(object, config) {
            if (object && config && typeof config === 'object') {
                var i, j, k;

                for (i in config) {
                    object[i] = config[i];
                }

                if (enumerables) {
                    for (j = enumerables.length; j--;) {
                        k = enumerables[j];
                        if (config.hasOwnProperty(k)) {
                            object[k] = config[k];
                        }
                    }
                }
            }
        };

    /**
     * Class基类，使用Klass.define()方法声明类继承的顶级父类
     */
    var Base = function() {};
    apply(Base, {
        $isClass: true,

        extend: function(SuperClass) {
            var superPrototype = SuperClass.prototype,
                basePrototype, prototype, name;

            prototype = this.prototype = chain(superPrototype);
            this.superclass = prototype.superclass = superPrototype;

            if (!SuperClass.$isClass) {
                basePrototype = Base.prototype;
                for (name in basePrototype) {
                    if (name in prototype) {
                        prototype[name] = basePrototype[name];
                    }
                }
            }
        },

        /**
         * 新增或重写一个static属性
         *
         *     var MyCls = Klass.define({
         *         ...
         *     });
         *
         *     MyCls.addStatics({
         *         someProperty: 'someValue',      // MyCls.someProperty = 'someValue'
         *         method1: function() { ... },    // MyCls.method1 = function() { ... };
         *         method2: function() { ... }     // MyCls.method2 = function() { ... };
         *     });
         *
         * @param {Object} members
         * @return {Base} this
         * @static
         */
        addStatics: function(members) {
            var member, name;
            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    this[name] = member;
                }
            }
            return this;
        },

        addMembers: function(members) {
            var prototype = this.prototype,
                names = [],
                i, ln, name, member;

            for (name in members) {
                names.push(name);
            }

            if (enumerables) {
                names.push.apply(names, enumerables);
            }

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];

                if (members.hasOwnProperty(name)) {
                    member = members[name];

                    if (typeof member == 'function' && !member.$isClass) {
                        member.$owner = this;
                        member.$name = name;
                    }

                    prototype[name] = member;
                }
            }

            return this;
        },

        /**
         * 重写类的属性或方法，例子：
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
         *  Cls1.implement({
         *      say: function() {
         *          alert(this.name + ' say: hello, I'm Max, nice to meet you!');
         *      },
         *
         *      sayHello: function() {
         *          alert('hello, world!');
         *      }
         *  });
         *
         *  var cls1 = new Cls1();
         *  cls1.say(); // 输出 'Max say: hello, I'm Max, nice to meet you!'
         *  cls1.sayHello(); // 输出 'hello world!'
         * </code>
         *
         * 如果想为类的方法定义一个新的别名，应该使用下面的方式，不能使用override函数：
         * <code>
         *  Cls1.prototype.speak = Cls1.prototype.say;
         *
         *  var cls1 = new Cls1();
         *  cls1.speak(); // 输出 'Max  say: hello, I'm Max, nice to meet you!'
         * </code>
         *
         * @param {Object} overrides 被添加到类的属性或方法
         * @static
         */
        implement: function() {
            this.addMembers.apply(this, arguments);
        }
    });

    // Base类的prototype属性
    apply(Base.prototype, {
        $isInstance: true,

        /**
         * 调用当前方法的父类方法，例子：
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
         * @param {Array/Arguments} args 传递给父类方法的形参
         * @return {Object} 返回父类方法的执行结果
         */
        callParent: function(args) {
            var method,
                superMethod = (method = this.callParent.caller) &&
                    (method = method.$owner ? method : method.caller) &&
                    method.$owner.superclass[method.$name];

            return superMethod.apply(this, args ? slice.call(args, 0) : noArgs);
        },

        // Default constructor, simply returns `this`
        constructor: function() {
            return this;
        }
    });


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


    /**
     * 声明类，类的继承，重写类方法
     */
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

    if (typeof module === "object" && module && typeof module.exports === "object") {
        // 声明 Node module
        module.exports = Klass;
    } else {
        // 声明 AMD / SeaJS module
        if (typeof define === "function" && (define.amd || seajs)) {
            define('klass', [], function() {
                return Klass;
            });
        }
    }

    if (typeof global === "object" && typeof global.document === "object") {
        global.Klass = Klass;
    }
})();