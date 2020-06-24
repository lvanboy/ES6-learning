私有名称提案最终发展成ES6中的符号

### 创建符号值
```js
let firstName = Symbol();
let person = {};

person[firstName] = "lvanboy";
console.log(person[firstName])

```

Symbol函数接受额外一个参数，用于描述符号值
```js
let firstName = Symbol("first name");
let person = {};

person[firstName] ="lvanboy";
console.log(firstName);

```
符号的描述信息存储在内部属性[[Description]]中，当符号的toString()显式或者隐式调用时，该属性被读取。console.log()隐式调用firstName变量toString()方法，除此之外，没有其他方法访问[[Descripion]]属性。

判断符号类型
```js
let symbol = Symbol("symbol");
console.log(typeof symbol);

```

### 使用符号值
在任意能使用可计算属性的场合使用符号，还可以在Object.defineProperty或者Object.defineProperties调用中使用。
```js
let firstName = Symbol("first name");
let person = {
    [firstName]:"lvanboy"
}

Object.defineProperty(person,firstName,{
    writable:false
})

let lastName = Symbol("last name");
Object.defineProperties(person,
{[lastName]:{
    value:"lvanboy",
    writable:false
}})  //创建只读属性
console.log(person[firstName]);
console.log(person[lastName]);

```

共享符号值
ES6提供了全局符号注册表，创建共享符号值，使用Symbol.for(),接受一个用于描述符号的参数。
```js
let uid = Symbol.for("uid");
let object = {}
object[uid] = "123";
console.log(object[uid],uid);

```
Symbol.for方法首先搜索全局符号注册表，看是否存在uid符号值，存在返回已存在的符号值，否则创建一个新的符号值，注册到
全局注册表，返回新的符号值。
```js
let uid = Symbol.for("uid");
let object = {
    [uid]:"123"
}
console.log(object[uid])
console.log(uid);
let uid2 = Symbol.for("uid");
console.log(uid === uid2)
console.log(object[uid2])
console.log(uid2)
```
第一创建uid符号，第二次检索uid符号返回；

检索符号
```js
let uid = Symbol.for("uid");
console.log(Symbol.keyFor(uid));
let uid2 = Symbol.for("uid");
console.log(Symbol.keyFor(uid2));
let uid3 = Symbol("uid");
console.log(Symbol.keyFor(uid3))
```
uid3没有与全局符号表关联，也就不存在，返回undefined

### 符号值转化
符号值无法转化为字符串和数字
```js
let uid = Symbol.for("uid");
desc = uid + "";//引发错误
```

```js
le uid = Symbol.for("uid");
sum = uid / 1 ;//引发错误
```

### 检索符号属性
Object.keys和Object.getOwnPropertyNames检索对象的所有属性名称，前者可枚举，后者不考虑是否可枚举；然后他们都不能返回符号类型的属性；ES6提供了Object.getOwnPropertySymbols()方法，用于检索对象的符号类型属性。
```js
let uid = Symbol.for("uid");
let object = {
    [uid]:"123"
}

let symbols = Object.getOwnPropertySymbols(object);
console.log(symbols.length);
console.log(symbols[0]);
console.log(object[symbols[0]])
```

所有对象起初都不包括自有符号类型属性，但对象可从原型上继承符号类型属性；ES6定义了一些知名符号。
### 使用知名符号暴露内部方法
ES6中的知名符号代表JS中一些公共行为，这些行为之前被认为只能是内部操作；
1. Symbol.hasInstance:供instanceOf运算符使用的方法，用于判断对象继承关系
2. Symbol.iterator:返回迭代器的一个方法
3. Symbol.match:供String.prototype.match()函数使用的一个方法，用于比较字符串
4. Symbol.replace
5. Symbol.search
6. Symbol.species:用于派生对象的构造器
7. Symbol.split
8. Symbol.toPrimitive:返回对象所对应的基本类型值的一个方法
9. Symbol.toStringTag:用于创建对象描述信息
10. Symbol.unscopables:指明了哪些属性名不允许被包含在with语句中


Symbol.hasInstance
```js
let obj = {};
console.log(obj instanceof Array);
//等价于
console.log(Array[Symbol.hasInstance](obj))

```

你可以采用硬编码的方法使该函数的Symbol.hasInstance方法始终返回false
```js
function myObj(){

}
Object.defineProperty(myObj,Symbol.hasInstance,{
    value:()=>false
})
let obj = new myObj();
console.log(obj instanceof myObj)

```

要重写一个不可写入的属性，必要使用Object.defineProperty();你可以基于一定条件判断一个值是否为实例；
```js
function SpecialNumber(){}
Object.defineProperty(SpecialNumber,Symbol.hasInstance,{
    value:(v) => (v instanceof Number) && (v > 1 && v < 100) 
})
let two = new Number(2),
    zero = new Number(0);
    console.log(two instanceof SpecialNumber);
    console.log(zero instanceof SpecialNumber);
```
instanceof 左边必须是对象，以此触发Symbol.hasInstance调用，否则Symbol.hasInstance只能返回false；
你可以重写所有内置的hasInstance，但最好不要，这样会导致代码难以理解，甚至混乱，仅在必要时对自己的函数重写Symbol.hasInstance.


Symbol.isConcatSpreadable
它是一个boolean类型的属性，它表示目标对象拥有长度属性与数值类型的键，并且数值类型键所对应的属性值在参与concat调用时需要被分离为个体，让该对象在参与concat调用时与数组类型
```js
let collection = {
    0:"hello",
    1:"world",
    length:2,
    [Symbol.isConcatSpreadable]:true
}
let msgs= ["hi"].concat(collection);
console.log(msgs);

```

Symbol.toPrimitive
JS在使用特定运算符的时候试图进行隐式转换，以便将对象转化为基本数据类型；
Symbol.toPrimitive定义在所有常规类型的原型上，规定对象转化为基本类型时发生什么，需要转化时，Symbol.toPrimitive会被调用，并按照规范传入一个提示性字符串参数，该参数有3种可能：当参数为nubmer时，Symbol.toPrimitive应该返回一个数值，当参数为string时，应该返回一个字符串，当参数时default时，对返回值没有特殊要求。

对应大多数常规对象，数值模式依次会有下述行为：
1. 调用valueOf方法，若结果是基本类型，返回它；
2. 否则，调用toString(),若返回结果是基本类型，返回它；
3. 否则，抛出错误

对于大多数常规对象，字符串模式依次会有下述行为：
1. 调用toString()方法，若结果是一个基本数据类型，那么返回它，
2. 否则，调用valueOf(),若结果是一个基本数据类型，返回它
3. 否则，抛出错误

在多数情况下，常规对象的默认模式都是数值模式，只有date类型除外，它使用的字符串类型；通过Symbol.toPrimitive方法，你可以重写这些行为；

```js
function temperature(degrees){
    this.degrees = degrees;
}
temperature.prototype[Symbol.toPrimitive]  = function(hint){
    switch(hint){
        case "string":
            return this.degrees + "\u00b0";
        case "number":
            return this.degrees;
        case "default":
            return this.degrees + "degrees";
    }
}

let freezing = new temperature(32);
console.log(freezing)
console.log(freezing + "!"); //触发默认模式
console.log(freezing / 2); //触发数值模式
console.log(String(freezing)); //提示性参数在调用时由JS引擎自动填写

```

Symbol.toStringTag
该属性定义了Object.prototype.toString.call被调用时应该返回什么值，对于数组来说，Symbol.toStringTag属性中存储了Array值，于是该函数的返回值也是"Array"。同样你可以在自设对象上定义Symbol.toStringTag值
```js
function Person(name){
    this.name = name;
}
Person.prototype[Symbol.toStringTag] = "Person";
let me = new Person("lvanboy");
console.log(me.toString());
console.log(Object.prototype.toString.call(me)) //[object Person]

```
因为Person的原型继承Object.prototype.toString方法，对象上的toString方法仍然可以自定义

```js
function Person(name){
    this.name = name;
}
Person.prototype.toString = function(){
    return this.name;
}
Person.prototype[Symbol.toStringTag] = "Person";
let me = new Person("lvanboy");
console.log(me.toString());
console.log(Object.prototype.toString.call(me)) //[object Person]

```
自定义toString方法后，将不在继承Object.prototype.toString(),从而不会触发Symbol.toStringTag，对于开发者来说，
Symbol.toStringTag不受任何限制。
改变原始对象的字符串标签也是可能的
```js
Array.prototype[Symbol.toStringTag] = "Magic";
let values = [];
console.log(Object.prototype.toString.call(values))

```

Symbol.unscopables
with语句是JS语言中最有争议的部分之一，它原本是为了减少重复代码的输入，但这使得代码难以理解，有负面性能影响，还容易出错。严格模式下，with被禁用，ES6的严格模式中提供了对with的支持。
```js
let values = [1,2,3],
    colors = ["red","green","blue"],
    color = "black";
    with(colors){
        push(color);
        push(...values)
    }
    console.log(colors)

```
上述values均引用with外部的变量，但在ES6中，数组添加了values方法，此时values则不会引用外部变量，这将导致错误。为了解决这个问题；通过定义数组原型上的Symbol.unscopables；
Symbol.unscopables在Array.prototype上使用，执行哪些属性不允许使用with语句，Symbol.unscopables是一个对象，键值为true时，表示屏蔽绑定。
```js
Array.prototype[Symbol.unscopables] = Object.assign(Object.create(null),{
    copyWithin:true,
    entries:true,
    fill:true,
    find:true,
    findIndex:true,
    keys:true,
    values:true
})

```
这些数组方法在with语句中不会进行绑定。
一般而言，你无需修改Symbol.unscopables对象上的属性，除非你使用了with语句、并修改代码库中的已有对象。