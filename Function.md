## 函数


### 带默认参数的函数
在ES5中，为了避免参数不传，导致的代码异常，是通过短路特性实现默认参数
```js
function makeRequest(url,timeout,callback){
    timeout = timeout || 2000;
    callback = callback || function(){}
}

```
这种方法对于意外的假值，使用默认参数是不符合预期，比如数字0；所以为了避免这类情况的发生，可对参数进行进一步的处理
```js
function makeRequest(url,timeout,callback){
    timeout = typeof timeout !== "undefined" ?timeout : 2000;
    callback = typeof callback !== "undefined"? callback : function(){}
}

```

这样的代码确实很安全，但是需要补充额外多的代码，而ES6提供了便捷的默认参数
```js
function makeRequest(url,timeout=2000,callback=function(){}){

}

```
以上代码就表明url是必填参数，timeout和callback是可选参数，在不传入时，使用默认参数。
```js
function makeRequest(url,timeout=2000,callback){
    console.log(timeout)
}
makeRequest('/a',undefined,function(){})
makeRequest('/b',null,function(){})
makeRequest('/c');
```
第二个参数在不传递或者传入undefined时，使用默认参数；


### 默认参数对argument的影响
在ES5的非严格模式下，arguments参数反映出具名参数的变化
```js
function mixArgs(first,second){ 
    console.log(first === arguments[0]); //true
    console.log(second === arguments[1]); //true
    first = "c";
    second = "d";
    console.log(first === arguments[0]); //true
    console.log(second === arguments[1]); //true
}
mixArgs("a","b");

```
在ES5严格模式下，arguments将等于参数传入的值，不会动态变化。
```js
"use strict";

function mixArgs(first,second){ 
    console.log(first === arguments[0]); //true
    console.log(second === arguments[1]); //true
    first = "c";
    second = "d";
    console.log(first === arguments[0]); //false
    console.log(second === arguments[1]); //false
}
mixArgs("a","b");
```

而对于ES6的默认参数，arguments始终等于传入的参数值。
```js
function mixArgs(first = "a",second = "b"){ 
    console.log(first === arguments[0]); 
    console.log(second === arguments[1]); 
    first = "c";
    second = "d";
    console.log(first === arguments[0]); 
    console.log(second === arguments[1]); 
}
mixArgs("a","b"); //true true false false
mixArgs(); //false false false false
```

### 默认参数表达式
默认参数可以是表达式，也是可以是函数的返回值等等。
```js
function getValue(){
    return "default value";
}
function print(a, b = getValue()){
    let str = a + b;
    console.log(str);
}
print("good","print")
print("good")

```


###  参数1作为参数2的默认参数
```js
function add(first,second = first){
    return first + second;
}
console.log(add(1,1));
console.log(add(1))


function getValue(value){
    return value + 5;
}
function add(first ,second = getValue(first)){
    return first + second;
}
console.log(add(1)) //1,7
```


### 剩余参数
剩余参数的设计是为了替代arguments对象，但argument仍任可以使用
```js
function pick(object,...keys){
    let result = Object.create(null);
    for(let i = 0;i<keys.length;i++){
        result[keys[i]] = object[keys[i]];
    }
    return result;
}

let obj = {
    name:"lvanboy",
    age:12,
    area:"shanghai",
}
pick(obj,"name","age");
```
将传入的多个参数归结到...剩余参数中，剩余参数作为一个数组承载多个参数；；剩余参数的二个限制条件：

1. 函数只能有一个剩余参数，并且必须放在最后
2. 不能在对象字面量的setter属性中使用，原因是字面量的setter被限定只能使用单个参数
```js
let ojb = {
    //报错
    set name(...value){

    }
}

```


### 函数构造器的增强
允许使用默认参数和剩余参数
ES5
```js
var add = new Function("first","second","return first + second");
console.log(add(1,1))
```

ES6
```js
var add = new Function("first","second = first","return first + second")
console.log(add(1))
var firstPick = new Function("...args","return args[0]");
console.log(firstPick(1,2,3))
```


### 扩展运算符
扩展运算符与剩余参数的概念相反，扩展运算符允许将一个数组分割，并将各项作为单独参数传入；
```js
let values = [10,20,30,40];
console.log(Math.max(...values));
console.log(Math.min(...values,0));
```
所以在大部分场景中，扩展运算符是apply方法的合适替代品

### 名称属性
匿名表达式的流行，导致堆栈跟踪难以阅读与解释，因此，ES6中为所有函数添加了name属性。
```js
function doSomething(){

}

var doAntherThing = function(){}

console.log(doSomething.name);
console.log(doAntherThing.name);

```

ES6做了更多规定保证所有函数都拥有合适的名字。
```js
var hasName =  function doSomething(){}
var person = {
    get firstName(){},
    sayName:function(){}
}

console.log(hasName.name);
console.log(person.sayName.name);
var descriptor = Object.getOwnPropertyDescriptor(person,"firstName");
console.log(descriptor.get.name);

```
set和get修饰的函数都必须用Object.getOwnPropertyDescriptor()来检验


另外还有两个特殊情况
1. 使用bind创建的函数函数名会带有"bound"前缀
2. 使用Function构造器创建的函数，其属性名为"anonymous"

```js
var doSomething = function(){

}
console.log(doSomething.bind().name);
console.log(new Function().name);
```


### 明确函数的双重用途
```js
function Person(name){
    this.name = name;
}
var person = new Person("lvanboy"); 
var notAperson = Person("lvanboy"); //undefined
console.log(person)
console.log(notAperson)
```
JS为函数提供了两种不同的内部方法：[[Call]]和[[Construct]]。当未使用new进行函数调用时，[[Call]]方法会执行，运行的是函数体；而使用new进行函数调用时，[[Construct]]方法被执行，创建一个被称为新目标的新对象，并用该新目标的this去执行函数体。并非所有的函数都拥有[[Construct]]，例如箭头函数。

判断是否使用new去调用函数，ES5使用instance:
```js
function Person(name){
    if(this instanceof Person){
        this.name = name;
    }else{
        throw new Error("You must use new with Person");
    }
}
console.log(new Person("lvanboy"));
console.log(Person("lvanoboy"));

```

如果使用call或者apply方法调用该函数，则instance判断并不准确;为了解决这个问题，ES6引入了new.target元属性，元属性指的是"非对象"属性，并提供关联目标的附加信息。当函数的[[Construct]]方法被调用时，new 运算符的作用目标会填入new.target元属性，new.target是该实例的构造器。而[[Call]]执行，new.target的值将会是undefined.

```js
function Person(name){
    if(typeof new.target !== "undefined"){
        this.name = name;
    }else{
        throw new Error("You must use new with Person");
    }
}
var	person	=	new	Person("lvanboy"); 
var	notAPerson	=	Person.call(person,	"lvanboy");	

```


### 块级函数
在ES5的严格模式，以及ES3中，在代码块中声明函数发生报错,除非使用函数表达式；
```js
"use strict";
if(true){
    function doSomething(){};
}

```
在ES6中doSomething被识别为块级函数，该块级作用域内可调用，否则报错。
```js
if(true){
    console.log(typeof doSomething);
    function doSomething(value){
        console.log("block function",value);
    }
    doSomething("inner");
}
doSomething("outer");

```

在ES6严格模式下，块级函数与let函数表达式相似，存在的差异是：块级函数被提升到当前作用的顶部，而let函数表达式不会
```js
if(true){
    console.log(typeof doSomething);
    let doSomething = function(value){
        console.log("block function",value);
    }
    doSomething("inner");
}
doSomething("outer");
```

在ES6的非严格模式下，块级函数被提升至全局作用域的顶部，而非代码块的顶部，所以代码块的外部是可以访问到该函数的。


### 箭头函数
特性：
1. 没有this,super,arguments,也没有new.target绑定，this,super,arguments,new.target由外层最近的非箭头函数来决定
2. 不能使用new调用
3. 没有原型
4. 不能改变this，this的值在函数的内部不可改变，在函数的整个生命周期内其值不会变
箭头函数也拥有name属性，遵循与其他函数相同的规则。

```js
//单参数，有返回
var reflect = value =>value;
//等价于
var reflect = function(value){
    return value;
}
//双参数，有返回
var sum = (num1,num2) => num1 + num2;
sum(1,2)

//无参数，有返回
var getName = ()=> "lvanboy";

//具有花括号时，需要明确返回
var sum = (num1,num2) => { return num1+num2; }

//空函数
var doNothign = () => {};

//箭头函数内返回对象字面量需要小括号包裹
var getTempItem = (id) => ({id:id,name:"temp"});

//立即执行函数的箭头函数形式
let person = ((name)=>{name})("lvanboy");

```

### 箭头函数中的this指向
普通函数内部的this值根据调用函数时的上下文而改变,如事件回调函数内部的this,为了让它能够正常调用对象的实例方法，通常使用bind方法，生成一个具有新的this绑定的函数。
```js
var PageHandler = {
    id:"123",
    init:function(){
        document.addEventListener("click",function(ev){
            this.doSomething(ev.type);
        }.bind(this),false)
    },
    doSomething:function(type){
        console.log(`Handling ${type} for ${this.id}`);
    }
}

```
ES6更优雅的做法是使用箭头函数,当箭头函数被包裹在一个非箭头函数内部时，那么this值与该函数相等，否则this值就是全局对象。
```js
var PageHandler = {
    id:"123",
    init:function(){
        document.addEventListener("click",
        ev => this.doSomething(ev.type),
        false)
    },
    doSomething:function(type){
        console.log(`Handling ${type} for ${this.id}`);
    }
}

```
箭头函数属于"抛弃下函数"，不能用来生成新的对象类型；
```js
var Mytype = ()=>{},
    object = new Mytype();//报错，箭头函数不能使用new，不存在[[Construct]]

```


箭头函数和数组是理想搭配,数组的很多遍历方法都是迭代器的模式，传入回调函数的方式
```js
let values = [2,1,33]
var result = values.sort((a,b) => a-b)

```

### 无arguments绑定
虽然箭头函数本身无法访问arguments，但可以在外层套用function函数来借用到arguments。
```js
function createArrowFunc(){
    return ()=>arguments[0]
}

var arrowFunc = createArrowFunc(1);
console.log(arrowFunc())

```

### call,apply,bind与箭头函数this
箭头函数中的this不会受到call，apply，bind传入的this而改变。
```js
var sum = (a,b)=>a+b;
console.log(sum.call(null,1,2))
console.log(sum.apply(null,[1,2]))
var boundSum = sum.bind(null,1,2);
console.log(boundSum());

```

### 尾调用优化
在ES5引擎尾调用中，其处理与其他函数调用一致，创建一个新的栈帧，推到调用栈上，用于表示当前函数调用；意味着之前的每个栈帧都被保留在内存中，当调用栈过大时出现内存泄漏异常。

ES6在严格模式下，试图减少特定尾调用栈的大小，非严格模式下保持不变。
当满足下面条件时，尾调用不会创建新的栈帧，而是清楚当前栈帧并再次利用它。
1. 尾调用不能引用当前栈帧中的变量，意味着该函数不能是闭包。
2. 进行尾调用的函数，在return语句时，不能进行额外操作。
3. 尾调用结果作为当前函数返回值



```js
//优化
"use strict";
function doSomething(){
    return doSomethingElse();
}

```

```js
//非优化
"use strict";
function doSomething(){
     doSomethingElse();
}
```

```js
//非优化
"use strict";
function doSomething(){
   return 1 + doSomethingElse();
}
```

```js
//非优化
"use strict";
function doSomething(){
   var result =  doSomethingElse();
   return result;
}
```

```js
//非优化
"use strict";
function doSomething(){
    var num =1,
        func = ()=>num;
        return  func();
}
```
尾调用优化主要是针对递归函数
```js
function factorial(n){
    if(n < 1){
        return 1;
    }else{
        return n * factorial(n - 1);
    }
}

```
这里没有进行尾调用优化（return 语句进行额外操作），如果n过于大，则调用栈的大小会持续增长，并且可能导致栈溢出。

```js
function factorial(n,p =1){
    if(n < 1){
        return 1 * p;
    }else{
        let result = n * p; //p保留了前一次乘积的结果
        return factorial(n - 1,result);
    }
}
```

尾调用优化是在书写递归函数需要考虑的问题，它能显著提高代码性能。














