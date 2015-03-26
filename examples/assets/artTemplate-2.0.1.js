var template=function(a,b){return template["object"==typeof b?"render":"compile"].apply(template,arguments)};!function(a,b){"use strict";var c,d,e,f;a.version="2.0.1",a.openTag="<%",a.closeTag="%>",a.isEscape=!0,a.isCompress=!1,a.parser=null,a.render=function(a,b){var c=d(a);return void 0===c?e({id:a,name:"Render Error",message:"No Template"}):c(b)},a.compile=function(b,d){function l(c){try{return new j(c)+""}catch(f){return h?(f.id=b||d,f.name="Render Error",f.source=d,e(f)):a.compile(b,d,!0)(c)}}var j,g=arguments,h=g[2],i="anonymous";"string"!=typeof d&&(h=g[1],d=g[0],b=i);try{j=f(d,h)}catch(k){return k.id=b||d,k.name="Syntax Error",e(k)}return l.prototype=j.prototype,l.toString=function(){return j.toString()},b!==i&&(c[b]=l),l},a.helper=function(b,c){a.prototype[b]=c},a.onerror=function(a){var c="[template]:\n"+a.id+"\n\n[name]:\n"+a.name;a.message&&(c+="\n\n[message]:\n"+a.message),a.line&&(c+="\n\n[line]:\n"+a.line,c+="\n\n[source]:\n"+a.source.split(/\n/)[a.line-1].replace(/^[\s\t]+/,"")),a.temp&&(c+="\n\n[temp]:\n"+a.temp),b.console&&console.error(c)},c={},d=function(d){var f,g,e=c[d];if(void 0===e&&"document"in b){if(f=document.getElementById(d))return g=f.value||f.innerHTML,a.compile(d,g.replace(/^\s*|\s*$/g,""))}else if(c.hasOwnProperty(d))return e},e=function(b){function c(){return c+""}return a.onerror(b),c.toString=function(){return"{Template Error}"},c},f=function(){var b,c,d,e,f,g,h,i,j;return a.prototype={$render:a.render,$escape:function(a){return"string"==typeof a?a.replace(/&(?![\w#]+;)|[<>"']/g,function(a){return{"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"}[a]}):a},$string:function(a){return"string"==typeof a||"number"==typeof a?a:"function"==typeof a?a():""}},b=Array.prototype.forEach||function(a,b){var d,c=this.length>>>0;for(d=0;c>d;d++)d in this&&a.call(b,this[d],d,this)},c=function(a,c){b.call(a,c)},d="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",e=/\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g,f=/[^\w$]+/g,g=new RegExp(["\\b"+d.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),h=/\b\d[^,]*/g,i=/^,+|,+$/g,j=function(a){return a=a.replace(e,"").replace(f,",").replace(g,"").replace(h,"").replace(i,""),a=a?a.split(/,+/):[]},function(b,d){function w(b){return k+=b.split(/\n/).length-1,a.isCompress&&(b=b.replace(/[\n\r\t\s]+/g," ")),b=b.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),b=q[1]+"'"+b+"'"+q[2],b+"\n"}function x(b){var e,f,c=k;return g?b=g(b):d&&(b=b.replace(/\n/g,function(){return k++,"$line="+k+";"})),0===b.indexOf("=")&&(e=0!==b.indexOf("=="),b=b.replace(/^=*|[\s;]*$/g,""),e&&a.isEscape?(f=b.replace(/\s*\([^\)]+\)/,""),m.hasOwnProperty(f)||/^(include|print)$/.test(f)||(b="$escape($string("+b+"))")):b="$string("+b+")",b=q[1]+b+q[2]),d&&(b="$line="+c+";"+b),y(b),b+"\n"}function y(a){a=j(a),c(a,function(a){l.hasOwnProperty(a)||(z(a),l[a]=!0)})}function z(a){var b;"print"===a?b=s:"include"===a?(n.$render=m.$render,b=t):(b="$data."+a,m.hasOwnProperty(a)&&(n[a]=m[a],b=0===a.indexOf("$")?"$helpers."+a:b+"===undefined?$helpers."+a+":"+b)),o+=a+"="+b+","}var u,e=a.openTag,f=a.closeTag,g=a.parser,h=b,i="",k=1,l={$data:!0,$helpers:!0,$out:!0,$line:!0},m=a.prototype,n={},o="var $helpers=this,"+(d?"$line=0,":""),p="".trim,q=p?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],r=p?"if(content!==undefined){$out+=content;return content}":"$out.push(content);",s="function(content){"+r+"}",t="function(id,data){if(data===undefined){data=$data}var content=$helpers.$render(id,data);"+r+"}";c(h.split(e),function(a){var c,d;a=a.split(f),c=a[0],d=a[1],1===a.length?i+=w(c):(i+=x(c),d&&(i+=w(d)))}),h=i,d&&(h="try{"+h+"}catch(e){"+"e.line=$line;"+"throw e"+"}"),h="'use strict';"+o+q[0]+h+"return new String("+q[3]+")";try{return u=new Function("$data",h),u.prototype=n,u}catch(v){throw v.temp="function anonymous($data) {"+h+"}",v}}}()}(template,this),"function"==typeof define?define(function(a,b,c){c.exports=template}):"undefined"!=typeof exports&&(module.exports=template);