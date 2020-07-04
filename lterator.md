```js
var colors = ["red","blue","green"];
for(let i = 0;i < colors;i++){
    console.log(colors[i])
}

```
随着循环的嵌套，复杂度增加，迭代器并应运而生。

### 迭代器
迭代器是专门设计用于迭代的对象，带有特定的接口。所有的迭代器器对象都拥有next方法，调用时返回一个对象；对象中有两个属性，value和done，当done为true时，表示没有更多的迭代对象，返回value为undefined。迭代器持有一个指向内部集合位置的指针，每当调用next方法，迭代器就会返回下个值。

ES5中创建迭代器
```js
function createIterator(items){
    var i = 0;
    return {
        next:function(){
            var done = (i >= items.length);
            var value = !done?items[i++]:undefined
            return {
                done:done,
                value:value
            }
        }
    }
}

var iterator = createIterator([1,2,3])
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

```

根据ES6制定的规则来写迭代器有点复杂，所以提供了生成器generator;生成器能返回一个迭代器函数；写法如：
```js
function *createIetrator(){
    yield 1;
    yield 2;
    yield 3;
}

let iterator =  createIetrator()
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);
```

生成器的特性是：在每次yield后停止执行，直到迭代器的next执行后，才能继续向后执行；yield关键字可用于值或者表达式，因此可通过生成器给迭代器添加项目。
```js
function *createIterator(items){
    for(let i = 0;i<items.length;i++){
        yield items[i];
    }
}

let iterator = createIterator([1,2,3])
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);

```
yield关键字只能用于生成器内部，即使在生成器的内部嵌套函数中使用yield也是错误的。
```js
//错误
function *createIterator(){
    items.forEach(function(item){
        yield item + 1;
    })
}

```

### 生成器函数表达式,如下：
```js
let createIterator = function *(items){
    for(let i = 0;i<items.length;i++){
        yield items[i]
    }
}

let iterator = createIterator([1,2,3])
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);

```

这个函数表达式是匿名，因此星号只能放在function和()之间；

### 生成器对象写法
生成器就是一个函数，可放置在对象内部；
```js
var o = {
    createIterator:function *(items){
        for(let i = 0;i<items.length;i++){
            yield items[i];
        }
    }
}

let iterator = o.createIterator([1,2,3]);
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);
```


### 可迭代器对象与for-of循环
可迭代器对象(iterator)是包含Symbol.iterator属性的对象；Symbol.iterator定义了对象返回的迭代器函数；在ES6中，所有集合对象（数组、set、map）以及字符串都是可迭代器对象；可迭代对象被设计用于与新增的for-of循环配合使用。

for-of循环在每次循环执行时会调用可迭代对象的next方法，并将结果对象value存储在一个变量上；循环过程持续到对象的done属性变成true为止。
```js
let values = [1,2,3]
for(let value of values){
    console.log(value)
}

```

### 访问默认迭代器
通过Symbol.iterator访问默认迭代器
```js
let values = [1,2,3]
let iterator = values[Symbol.iterator]();
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

```
此代码与for-of循环在后台发生的过程一致。

### 检测对象是否可迭代
```js
function isIterator(object){
    return typeof object[Symbol.iterator] === "function";
}
console.log(isIterator([1,2,3]))
console.log(isIterator("Hello"))
console.log(isIterator(new Map()))
console.log(isIterator(new Set()))

```
for-of运行前会做类似的检查

### 创建可迭代对象
开发者自定义对象默认情况是不可迭代对象，但你可以创建一个包含生成器的Symbol.iterator属性;

```js
let collection = {
    items:[],
    *[Symbol.iterator](){
        for(let i = 0;i<this.items.length;i++){
            yield this.items[i]
        }
    }
}
collection.items.push(1)
collection.items.push(2)
collection.items.push(3)

for(let x of collection){
    console.log(x)
}
```

### 集合的迭代器
ES6具有三种集合对象类型：数组、Map、Set，他们都拥有如下迭代器:
entries()：返回键值对迭代器
values():返回包含集合中的值的迭代器
keys():返回包含集合中的键的迭代器

entries迭代器
entries迭代器会在每次next()被调用时返回一个双项数组，表示集合中元素的键值：对于数组来说是第一项数值索引；set来说第一项既是键又是值；Map第一项也是键
```js

let colors = ["red","green","blue"];
let tracking = new Set([1,2,3]);
let data = new Map();

data.set("title","learning ES6");
data.set("format","ebook");

for(let entry of colors.entries()){
    console.log(entry);
}
for(let entry of tracking.entries()){
    console.log(entry);
}
for(let entry of data.entries()){
    console.log(entry)
}
```

```js

let colors = ["red","green","blue"];
let tracking = new Set([1,2,3]);
let data = new Map();

data.set("title","learning ES6");
data.set("format","ebook");

for(let value of colors.values()){
    console.log(value);
}
for(let value of tracking.values()){
    console.log(value);
}
for(let value of data.values()){
    console.log(value)
}

```

```js
let colors = ["red","green","blue"];
let tracking = new Set([1,2,3]);
let data = new Map();

data.set("title","learning ES6");
data.set("format","ebook");

for(let key of colors.keys()){
    console.log(key);
}
for(let key of tracking.keys()){
    console.log(key);
}
for(let key of data.keys()){
    console.log(key)
}
```

for-of循环没有显式指定迭代器时，每种集合类型都有默认迭代器供循环使用。values()方法是数组和Set的默认容器，
而entries()方法则是map的默认迭代器。
```js
let colors = ["red","green","blue"];
let tracking = new Set([1,2,3]);
let data = new Map([["title","learnging es6"]]);

for(let nums of colors){
    console.log(nums)
}
for(let key of tracking){
    console.log(key)
}
for(let entry of data){
    console.log(entry)
}

```
WeakMap、WeakSet并未拥有内置迭代器；Map默认迭代器有助于在for-of中使用解构
```js
let data = new Map([["title","es6leanring"]]);
for(let [key,value] of data){
    console.log(key,value)
}

```


字符串迭代器
JS中的字符串类似数组，使用方括号，访问其中字符；ES6未unicode提供完全支持，字符串的默认迭代器正是用于解决字符串迭代器问题，借助它就能处理字符，而不是码元；
```js
var msg = "A B";
for(let c of msg){
    console.log(c)
}

```

NodeList迭代器
文档对象模型（DOM）具有一种NodeList类型，用于表示页面文档中元素的集合；NodeList对象与数组都使用length属性来标注项的数量，并且使用方括号表示法来访问各个项。本质上来说，NodeList与数组的行为是非常不同的。
ES6中，NodeList也包含一个默认迭代器，其表现方式与数组的默认迭代器一致，意味着NodeList可以使用for-of；
```js
var divs = document.getElementsById("selector");
for(let div of divs){
    console.log(div);
}

```

扩展运算符与非数组可迭代对象
扩展运算符可作用于所有可迭代器对象，并且使用默认迭代器来判断需要使用哪些值；所有的值都是从迭代器读取出来，并按返回值的顺序插入数组。
```js
let map = new Map([["name","lvanboy"],["age",21]]),
    arr = [...map];
    console.log(arr)
```
```js
let smallNumbers = [1,2,3],
    bigNumber = [100,101],
    allNumber = [0,...smallNumbers,...bigNumber];
    console.log(allNumber.length);
    console.log(allNumber)
```
既然扩展运算符能用在任意可迭代器对象，它就成为了可迭代器对象转数组的最简单方法。

迭代器传参
```js
function *createIterator(){
    let first = yield 1;
    let second = yield first + 2;
    yield second + 3;
}
let iterator = createIterator();
console.log(iterator.next())
console.log(iterator.next(4))
console.log(iterator.next(5))

```
对于next的首次调用是特殊情况，任何传参都会被忽略；由于传递给next的参数会成为前一次yield语句的值，因此首次传参无意义。当一个值传递给next()方法时，，yield表现相似于return。

在迭代器中抛出错误
能传递给迭代器不仅是数据，还能是错误条件；迭代器可以使用一个throw方法，让迭代器在恢复执行时抛出一个错误。
```js
function *createIterator(){
    let first = yield 1;
    let second = yield first + 2;
    yield second + 3;
}
let iterator = createIterator();
console.log(iterator.next())
console.log(iterator.next(4));
console.log(iterator.throw(new Error("Boom")));
```
在`let second`进行赋值之前抛出错误，使用try，catch来捕获这块错误。
```js
function *createIterator(){
    let first = yield 1;
    let second ;
    try{
        second = yield first + 2;
    }catch(ex){
        second = 6;
    }
    yield second + 3;
}
const iterator = createIterator();
console.log(iterator.next())
console.log(iterator.next(4))
console.log(iterator.throw(new Error("Boom")));

```
将next()与throw都当作迭代器的指令，有助于思考。next方法指示迭代器继续执行，而throw方法则指示迭代器抛出一个错误继续执行。在调用之后会发生什么，根据生成器内部的代码来决定。

生成器与return语句
由于生成器是函数，在内部可使用return，提前结束生成器执行，也可以指定next方法最后一次调用的返回值。在生成器内，return表明所有的处理已完成，因此done属性被设为true;而如果return提供了返回值，就会被用于value字段；
```js
function *createIterator(){
    yield 1;
    return ;
    yield 2;
    yield 3;
}
let iterator = createIterator();
console.log(iterator.next())
console.log(iterator.next())

```

```js
function *createIterator(){
    yield 2;
    return 21;
}
let iterator = createIterator();
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

```


### 生成器委托
```js
function *createNumberIterator(){
    yield 1;
    yield 2;
}
function *createColorIterator(){
    yield "color";
    yield "red";
}
function *createCombinedIterator(){
    yield *createNumberIterator();
    yield *createColorIterator();
    yield true;
}
var iterator = createCombinedIterator();
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

```
每次next调用都会委托给合适的生成器，直到createNumberIterator和createColorIterator创建的迭代器全部清空为止。
生成器委托也能进一步的使用生成器的返回值;
```js
function *createNumberIterator(){
    yield 1;
    yield 2;
    return 3;
}

function *createRepeatingIterator(count){
    for(let i = 0;i<count;i++){
        yield "repeat";
    }
}
function *createCombinedIterator(){
    let result = yield *createNumberIterator();
    yield *createRepeatingIterator(result);
}
let iterator = createCombinedIterator();
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

```
createNumberIterator的返回值3赋值给result，这个3从未在对于next()方法的任何调用中被输出。当前它仅仅存在于createCombinedIterator生成器内部。

### 异步任务运行
执行异步操作的传统方式是调用一个包含回调的函数。
```js
let fs = require("fs")
fs.readFile("config.js",function(err,contents){
    if(err){
        throw err;
    }
    console.log("Done");
})

```

在读取文件操作结束后，回调函数被调用。

一个简单的任务运行器
```js
function run(taskDef){
    let task = taskDef();
    let result = task.next();
    function step(){
        if(!result.done){
            result = task.next();
            step();
        }
    }
    step();
}
run(function *(){
    console.log(1);
    yield ;
    console.log(2);
    yield;
    console.log(3);
    yield;
})

```

带数据的任务运行
传递数据给任务运行器的最简单方式，就是把yield返回的值传入下一次next()调用。
```js
function run(taskDef){
    let task = taskDef();
    let result = task.next();
    function step(){
        if(!result.done){
            result = task.next(result.value);
            step();
        }
    }
    step();
}
run(function *(){
    let value = yield 1;
    console.log(value);
    value = yield value + 3;
    console.log(value);
})
```

异步任务运行器（难理解）
```js
function run(taskDef){
    let task = taskDef();
    let result = task.next();
    function step(){
        if(!result.done){
            if(typeof result.value === "function"){
                result.value(function(err,data){
                    if(err){
                        result = task.throw(err);
                        return;
                    }
                    result = task.next(data);
                    step();
                })
            }else{
                result = task.next(result.value);
                step();
            }
        }
    }
    step();
}
function fetchData(){
    return function(cb){
        setTimeout(function(){
            cb(null,"h1");
        },50)
    }
}
run(function *(){
    let contents = yield fetchData();
    console.log(contents);
    console.log("Done");
})

```

