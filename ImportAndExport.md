JS共享一切的代码加载方式是该语言混论和最易出错的方面之一。在ES6之前，一个应用的每个JS所定义所有内容都由全局作用域共享，这样会导致诸多问题，例如命名冲突、安全问题。ES6为了解决作用域的问题，引入模块概念。

模块加载JS的方式和脚本有很大的不同：
1. 模块代码自动运行在严格模式，且无法跳出严格模式
2. 在模块的顶级作用域添加的变量，不会被共享到全局作用域
3. 模块顶级作用域的this为undefined
4. 模块不允许在代码中使用HTML风格注释
5. 模块对于需要外部访问的内容代码，必须导出。
6. 允许模块从其他模块导入绑定


### 基本导出
export将代码公开给其他模块
```js
export var color ="red";
export let name = "lvanboy";
export const magicNubmer = "11"


export function sum(s1,s2){
    return s1 + s2;
}

export class Rectangle{
    constructor(length,width){
        this.length = length;
        this.width = width;
    }
}

function subtract(s1,s2){
    return s1 - s2;
}

function multiply(s1,s2){
    return s1 * s2;
}

export {multiply}
```

### 基本导入
```js
import {sum,multiply} from "./example.js";
console.log(sum(1,2))
sum = 1;
 
```
从模块导入一个绑定时，相等于使用const声明的定义。不能再定义其他同名变量或者重写赋值。

完全导入一个模块
```js
import * as example from "./example.js";
console.log(example.sum(1,2))
```
这种导入格式被称为命名空间导入。

无论对同一个模块引入多少次，该模块都会只执行一次。
```js
import {sum} from "./example.js";
import {Rectangle} from "./example.js";
import {multiply} from "./example.js";

```
这些模块都会使用这段代码中的同一个模块实例。

export与import重要限制，都必须用在其他语句或者表达式的外部。这样就不能实现动态的导入导出，原因之一：模块语法需要让JS能静态的判断需要导入导出什么，因此只能再顶级作用域使用。

模块导出创建了只读绑定，但是同一个模块中的变量在导入时，可由相同模块的导入方法进行修改
```js
//a.js
export var name = "lvanboy";
export function setName(newName){
    name = newName;
}

```
```js
//b.js
import {name,setName} from "a.js";
console.log(name);
setName("anke");
console.log(name);
name = "lvanboy"; //报错

```

### 重名名导入导出
```js
//a.js
function sum(s1,s2){
    return s1+s2;
}
export {sum as add};

```
```js
//b.js
import {add} from "./a.js";
import {add as sum} from "./a.js";
console.log(typeof add);
console.log(sum(1,2))

```


### 模块默认值
模块默认值是使用default关键字所指定的单个变量、类或者函数，每个模块中只能设置一个默认导出。
```js
//a.js
export default function(s1,s2){
    return s1+s2;
}

function sum(s1,s2){
    return s1+s2;
}
export default sum;

export {sum as default}

```

```js
//b.js
import sum from "./a.js";//sum代表了a模块的默认导出
console.log(sum(1,2))

```

```js
//a.js

export let color = "red";
export default function (s1,s2){
    return s1+s2;
}
```
import 中的默认名称必须位于非默认名称前
```js
//b.js
import  sum, {color}  from "./a.js";
console.log(sum(1,2));
console.log(color);
```
或者使用重命名语法进行默认导入
```js
import {sum as default,color} from "./a.js";
```

绑定的再导出
```js
import {sum} from "./a.js";
export {sum};
//等价于
export {sum} from "./a.js";
//或者重命名
export {sum as add} from "./a.js";
//导出所有导入
export * from "./a.js";
```

无绑定的导入
内置模块原型上的共享方法，无需导出，在导入时执行一次，即可在当前模块中使用
```js
//a.js
Array.prototype.pushAll = function(items){
    if(!Array.isArray(items)){
        throw new TypeError("args must be an array");
    }
    return this.push(...items);
}
//b.js
import "./a.js";
let colors =["red","green"];
let items = [];
items.pushAll(colors);
```

### 加载模块
ES6只规定了语法，并指定了一个未定义的内部操作HostResolveImprtedModule的抽象加载机制，web浏览器和node可自行实现。
ES6之前的，在浏览器中加载JS，可使用
1. script标签，指定src来加载代码
2. script标签，内嵌JS代码
3. js代码作为webworker来执行


script标签中使用模块，指定type为module
```html
<script type="module" scr="module.js"></script>

<script type="module">
import {sum} from "./a.js";
let result = sum(1,2);
</script>
```
此时的result变量并未暴露全局，绑定在window上；不支持模块化的浏览器，会自动忽略type为module类型的script声明。
`<script type="module">`总是自动应用defer属性；此时就会进行模块文件下载，但并不执行，直到整个网页文档解析完为止。
模块也会按照HTML中的引用位置按顺序执行。
async属性也能被添加在带有type为module的script标签上，async会导致脚本在加载完成后，立即执行。在import时保证所需要的模块在执行前会被下载；但不能保证模块何时执行；
```js
<script module="type" src="./a.js" async>
<script module="type" src="./b.js" async>
```
这两个模块被异步加载，你无法判断出哪个模块被先执行；若a.js首先结束下载，那么它先执行。反之，b.js先执行。

将模块作为web-worker加载，会在网页上下文外部执行代码
```js
let worker = new Worker("script.js");
```
而为了支持模块化加载，为worker构造器添加了第二个参数type属性对象，默认值script；
```js
let worker = new Worker("script.js",{type:module});
```
worker脚本与worker模块的区别
1. worker脚本只能从同源网页加载，而worker模块不受限制
2. worker脚本可使用self.importScripts来引入额外脚本引入worker,而worker模块上的self.importScripts总是失败，应该使用import。



