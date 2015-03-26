# iBox - A WebApp UI JavaScript Library

iBox 是一个仿 iOS 界面/交互的 JavaScirpt 库，它运行在 webkit 内核的移动浏览器之上，依赖 [iScroll](http://cubiq.org/iscroll-4) 库，帮助开发者构建更接近 iOS 体验的 WebApp。

**Note: Only test on iOS 5&6**

## 使用iBox

iBox 包含三部分：ibox.js、CSS Style(resources/css)、Images(resources/images)

引入CSS
```
<link rel="stylesheet" href="../../resources/css/ibox.css" media="all" />
```

引入JS，依赖 iScroll
```
<script type="text/javascript" src="../assets/iscroll-4.2.5.js"></script>
<script type="text/javascript" src="../../ibox.js"></script>
```

## DEMOS

### Simple Example

http://maxzhang.github.io/dev/ibox/examples/simple/index.html


### Notes

这是一个使用 iBox 构建的记事本 WebApp，需要添加到 iOS 桌面才能使用。

http://maxzhang.github.io/dev/ibox/examples/notes/index.html

![QR Code](http://maxzhang.github.io/dev/ibox/examples/notes/images/qrcode.png "Notes")

## APIs

### iBox Configs

#### new iBox( [String/Element] target, [Object] config )

String/Element : target iBox 绑定的目标对象，用法类似 iScroll 的初始化

Object : config 初始化配置参数
* Boolean : header false禁用header，默认true
* String : cls 添加到iBox el对象上的CSS扩展样式
* String : headerCls 添加到header对象上的CSS扩展样式
* String : bodyCls 添加到body对象上的CSS扩展样式
* Function : onRender 当iBox初始化渲染时调用
* Function : onResize: 当iBox重置大小时调用
* Function : beforeDestroy 当iBox销毁之前调用
* Function :  onDestroy 当iBox销毁时调用

### iBox Methods

#### slide( [Object/String]props, [Object]callbacks ) 切换视图

Object/String : props 视图切换配置参数
对于单例视图并已实例化，有效参数为以下三个：
* String : id 视图id
* Boolean : reverse true反向播放动画，默认false
* Boolean : silent true禁用动画效果直接切换视图，默认false

```
{
    id: 'xxx',
    reverse: true,
    silent: false
}
```
对于非单例视图，除了以上三个参数之外，还允许设置 iView Configs

Object : callbacks 回调函数
* Function : beforeShow

```
{
    beforeShow: function(nextView) {},
    onShow: function(nextView) {},
    beforeHide: function(previousView) {},
    onHide: function(previousView) {}
}
```

#### resize() 重置iBox大小

#### getView( [String]viewId ) 获取View视图对象

#### destroy() 销毁iBox

### iView Configs

String : id 视图id

Boolean : single true单例视图，默认false

String : cls 添加到iView el对象上的CSS扩展样式

Boolean : iscroll true使用iScroll来滚动body区域，默认true

Object : iscrollConfig iScroll配置参数

String : title 视图header标题

Object : leftButton 左侧按钮配置参数，默认false，可选配置项包括：
* String : text 按钮文本
* Boolean : back true显示成回退按钮样式，默认true
* String : cls 添加到leftButton对象上的CSS扩展样式
* Function : handler 点击按钮回调函数

Object : rightButton 右侧按钮配置参数，默认false，可选配置项包括：
* String : text 按钮文本
* String : icon 按钮图标，如果已设置text属性，则icon无效
* String : cls 添加到rightButton对象上的CSS扩展样式
* Function : handler 点击按钮回调函数

Function : onRender 当iView初始化渲染时调用

Function : onResize: 当iView重置大小时调用

Function : beforeDestroy 当iView销毁之前调用

Function :  onDestroy 当iView销毁时调用

### iView Methods

#### resize() 重置iView大小
