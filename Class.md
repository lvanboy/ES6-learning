### ES5中的仿类结构
ES5中不存在类，与类最接近的是：创建一个构造器，然后将方法指派到该构造器的原型上，这种方式创建的被称作自定义类型
```js
function personType(name){
    this.name = name;
}
personType.prototype.sayName = function(){
    console.log(this.name);
}
let person  = new personType("lvanboy");
person.sayName();
console.log(person instanceof personType);
console.log(person instanceof Object);
```

### ES6中类的声明
```js
class personClass {
    constructor(name){
        this.name = name;
    }
    sayName(){
        console.log(this.name);
    }
}
let person = new personClass("lvanboy");
person.sayName();
console.log(person instanceof personClass);
console.log(person instanceof Object);

console.log(typeof personClass);
console.log(typeof personClass.prototype.sayName);

```
自有属性：该属性出现在实例上而不是原型上，只能在类的构造器和方法内部进行创建，这里的name就是自有属性，建议自由属性在
构造器中声明，统一的声明位置，有助于代码检查。

类声明仅仅是以自定义类型为基础的语法糖；personClass声明实际上创建了一个拥有constructor方法以及行为的函数，sayName方法最终也会成为personClass.prototype上的一个方法。

类与自定义类型之间很相似，但也存在差异：
1. 类声明不会被提前，但函数会。
2. 类中所有代码会自动执行，并锁定在严格模式下。
3. 类的所有方法都是不可枚举的
4. 类的所有内部方法都没有[[Construct]]，因此使用new来调用会抛出错误。
5. 试图在类的方法内部重写类名，会抛出错误。

personClass实际等价于：
```js
let personType2 = (function(){
    "use strict";
    const personType2 = function(name){
        if(typeof new.target === "undefined"){
            throw new Error("construct must be called with new")
        }
        this.name = name;
    }
    Object.defineProperty(personType2.prototype,"sayName",{
        value:function(){
            if(typeof new.target !== "undefined"){
                throw new Error("methtod cannot be called with new");
            }
            console.log(this.name);
        },
        enumerable:false,
        writable:true,
        configurable:true,
    })
    return personType2;
}())

```
不使用类的语法也能实现类的特性，但类语法简化了所有功能代码。


### 类表达式
```js
let personClass = class {
    constructor(name){
        this.name = name;
    }
    sayName(){
        console.log(this.name);
    }
}
const person = new personClass("lvanboy");
console.log(person instanceof personClass);
console.log(person instanceof Object);

console.log(typeof personClass);
console.log(typeof personClass.prototype.sayName);
```

具名表达式
```js
let personClass = class personClass2{
    constructor(name){
        this.name = name;
    }
    sayName(){
        console.log(this.name);
    }
}
console.log(typeof personClass)
console.log(typeof personClass2)

```
personClass2标识符只在类定义的内部存在，因此只能用在类方法内部，在类的外部不存在personClass2绑定；
class可作为值传递，作为参数传给函数，作为函数返回值，给变量赋值；
```js
function createObj(classDef){
    return new classDef();
}
let obj = createObj(class {
    sayHi(){
        console.log("hi");
    }
})

obj.sayHi();

```

立即调用类构造器，创建单例
```js
let person = new class {
    constructor(name){
        this.name = name
    }
    sayName(){
        console.log(this.name);
    }
}("lvanboy");

person.sayName()

```
这里不存在额外的类引用；


在类上创建访问器属性
```js
class CustomHTMLelement{
    constructor(ele){
        this.ele = ele;
    }
    get html(){
        return this.ele.innerHTML;
    }
    set html(value){
        this.ele.innerHTML = value;
    }
}
var descriptor = Object.getOwnPropertyDescriptor(CustomHTMLelement.prototype,"html");
console.log("get" in descriptor);
console.log("set" in descriptor);
console.log(descriptor.enumerable);

```

非类等价形式如下：
```js
let CustomHTMLelement = (function(){
    "use strict";
    const CustomHTMLelement = function(ele){
        if(typeof new.target === "undefined"){
            throw new Error("construct must be called with new")
        }
        this.ele = ele;
    }
    Object.defineProperty(CustomHTMLelement.prototype,"html",{
        get:function(){
            return this.ele.innerHTML;
        },
        set:function(value){
            this.ele.innerHTML = value;
        },
        enumerable:false,
        writable:true,
        configurable:true,
    })
    return CustomHTMLelement;
}())

```

可计算的成员名
类方法和类访问器属性都可以使用可计算名称
```js
let methodName = "sayName";
let propertyName = "html";
class PersonClass  {
    constructor(name,ele){
        this.name = name;
        this.ele = ele;
    }
    [methodName](){
        console.log(this.name);
    }
    get [propertyName](){
        return this.ele.innerHTML;
    }
    set [propertyName](value){
        this.ele.innerHTML =value;
    }
}
let person = new PersonClass("lvanboy");
person.sayName();

```

类中的生成器方法
```js
class myClass{
    *createIterator(){
        yield 1;
        yield 2;
        yield 3;
    }
}
let instance = new myClass();
let iterator = instance.createIterator();

```
使用[Symbol.iterator]定义生成器方法，从而定义类的默认迭代器
```js
class Collection{
    constructor(){
        this.items = []
    }
    *[Symbol.iterator](){
        yield *this.items.values();
    }
}
var collection = new Collection();
collection.items.push(1)
collection.items.push(2)
collection.items.push(3)
for(let x of  collection){
    console.log(x);
}
```

当你想让方法和访问器属性在实例对象上出现时，就应该把它们添加到类的原型上；反之，若想方法和访问器属性绑定到类自身，使用静态成员。
ES5直接在构造器上添加额外的方法模拟静态成员
```js
function personType(name){
    this.name = name;
}
personType.create = function(name){
    return new personType(name);
}
personType.prototype.sayName = function(){
    console.log(this.name);
}
let person = personType.create("lvanboy")
person.sayName()
```
ES6的类静态化成员的创建，只要在方法和访问器属性前加上static标志。
```js
class personClass {
    constructor(name){
        this.name = name;
    }
    sayName(){
        console.log(this.name);
    }
    static create(name){
        return new personClass(name);
    }
}

let person = personClass.create("lvanboy")
person.sayName();

```

### 使用派生类继承
ES5实现自定义类型继承
```js
function Rectangle(length,width){
    this.length = length;
    this.width = width;
}
Rectangle.prototype.getArea = function(){
    return this.length * this.width;
}
function Square(length){
    Rectangle.call(this,length,length);
}
Square.prototype = Object.create(Rectangle.prototype,{
    constructor:{
        value:Square,
        enumerable:true,
        writable:true,
        configurable:true,
    }
})

var square = new Square(5);
console.log(square.getArea());
console.log(square instanceof Square);
console.log(square instanceof Rectangle);

```

ES6中的继承使用extends，并通过super访问基类
```js
class Rectangle{
    constructor(length,width){
        this.length = length;
        this.width = width;
    }
    getArea(){
        return this.length * this.width;
    }
}

class Square extends Rectangle{
    constructor(length){
        super(length,length);
    }
}

var square = new Square(5);
console.log(square.getArea());
console.log(square instanceof Square);
console.log(square instanceof Rectangle);
```

若派生类不使用构造器，super默认调用。
```js
class Square extends Rectangle{
    //没有构造器
}
//等价于
class Square extends Rectangle{
    constructor(...args){
        super(...args)
    }
}

```
使用super需要记住：
1. 只能在派生类中使用super
2. 在构造器中，必须在访问this之前，调用super，由于super负责初始化this。
3. 若在构造器中不调用super，唯一避免出错的办法就是在构造器中返回对象


屏蔽基类方法
```js
class Square extends Rectangle{
    constructor(length){
        super(length,length)
    }
    //重写就屏蔽
    getArea(){
        return this.length * this.length;
    }
}
```


### 继承静态成员
如果基类包括静态成员，派生类中也是可以使用
```js
class Rectangle{
    constructor(length,width){
        this.length =  length;
        this.width = width;
    }
    getArea(){
        return this.length * this.width;
    }
    static create(length,width){
        return new Rectangle(length,width);
    }
}
class Square extends Rectangle{
    constructor(length){
        super(length,length);
    }
}

var rect = Square.create(3,5);
console.log(rect instanceof Rectangle);
console.log(rect.getArea());
console.log(rect instanceof Square);

```
Square.create与Rectangle.create行为保持一致

从表达式中派生类
只要一个表达式能够返回一个具有[[Construct]]属性以及原型函数，就可以使用extends
```js
function Rectangle(length,width){
    this.length = length;
    this.width = width;
}
Rectangle.prototype.getArea = function(){
    return this.length * this.width;
}

class Square extends Rectangle{
    constructor(length){
        super(length,length);
    }
}
var square = new Square(5);
console.log(square.getArea())
console.log(square instanceof Square);
console.log(square instanceof Rectangle);
```

动态继承
```js
function Rectangle(length,width){
    this.length = length;
    this.width = width;
}
Rectangle.prototype.getArea = function(){
    return this.length * this.width;
}

function getBase(){
    //添加逻辑
    return Rectangle;
}

class Square extends getBase(){
    constructor(length){
        super(length,length);
    }
}
var square = new Square(5);
console.log(square.getArea())
console.log(square instanceof Rectangle);

```

动态混入继承
```js
//功能1
let SerializableMixin = {
    serialize(){
        return JSON.stringify(this);
    }
}
//功能2
let AreaMixin = {
    getArea(){
        return this.length * this.width;
    }
}

function mixin(...mixins){
    var base = function(){}
    Object.assign(base.prototype,...mixins);
    return base;
}

class Square extends mixin(SerializableMixin,AreaMixin){
    constructor(length){
        super();
        this.length = length;
        this.width = length;
    }
}

var x = new Square(5);
console.log(x.getArea());
console.log(x.serialize());
```
null和 生成器函数不能作为extends表达式

### 继承内置对象
```js
var colors = [];
colors[0] = "red";
console.log(colors.length);

colors.length = 0;
console.log(colors[0]);

function myArr(){
    Array.apply(this,arguments)
}

myArr.prototype = Object.create(Array.prototype,{
    constructor:{
        value:myArr,
        writable:true,
        configurable:true,
        enumerable:true
    }
})
var colors1 = new myArr();
colors1[0] = "red";
console.log(colors1.length);

colors1.length = 0;
console.log(colors1[0]);
```
对数组用传统的JS继承，产生了预期之外的行为；myArr实例上的length属性或者数值属性，其行为与内置数组不一致；因为这些功能并未涵盖在Array.apply()或者数组原型中,ES5this的值从派生类创建在调用基类，ES6this的值从基类创建被派生类修改。

ES6允许从内置对象上进行继承
```js
class myArr extends Array{

}
var colors = new myArr()
colors[0] = "red";
console.log(colors.length);

colors.length = 0;
console.log(colors[0])

```

### Symbol.species属性
任意能返回对象实例的方法，在派生类上却会自动返回派生类实例
```js
class myArr extends Array{

}
let items = new myArr(1,2,3,4),
    subItems = items.slice(1,3);
    console.log(items instanceof myArr);
    console.log(subItems instanceof myArr);

```
Symbol.species知名符号定义：能够返回函数的静态访问器属性；每当类实例除了构造器之外的方法必须创建一个实例时，前面返回的函数就被用为新实例的构造器。下列内置类型都拥有Symbol.species:
1. Array
2. ArrayBuffer
3. Map
4. Promise
5. RegExp
6. Set

每个类型都拥有默认的Symbol.species属性，返回值为this，意味着该属性总是返回自身构造器函数。
自定义类实现该功能如下:
```js
class myClass {
    static get[Symbol.species](){
        return this;
    }
    constructor(value){
        this.value = value;
    }
    clone(){
        return new this.constructor[Symbol.species](this.value);
    }
}

```
任何对this.constructor[Symbol.species]的调用都会返回myClass，clone方法用来返回一个新的实例，而没有直接用myClass
这就允许派生类重写这个值。

```js
class myClass {
    static get[Symbol.species](){
        return this;
    }
    constructor(value){
        this.value = value;
    }
    clone(){
        return new this.constructor[Symbol.species](this.value);
    }
}
class myClass1 extends myClass{

}
class myClass2 extends myClass{
    static get [Symbol.species](){
        return myClass;
    }
}
let instance1 = new myClass1("foo");
let clone1 = instance1.clone();
let instance2 =new myClass2("bar");
let clone2 = instance2.clone();

console.log(clone1 instanceof myClass1);
console.log(clone1 instanceof myClass);
console.log(clone2 instanceof myClass2);
console.log(clone2 instanceof myClass);

```

Array使用了Symbol.species来指定方法所使用的类，让其返回值为数组。在Array派生类中，你可以决定这个继承方法返回何种类型;
```js
class MyArray extends Array{
    static get [Symbol.species](){
        return Array;
    }
}
let items = new MyArray(1,2,3,4),
    subItems = items.slice(1,3);
    console.log(items instanceof MyArray);
    console.log(subItems instanceof Array);
    console.log(subItems instanceof MyArray);
```

在类构造器中使用new.target
在简单情况下，new.target等于本类的构造器
```js
class Rectangle{
    constructor(length,width){
        console.log(new.target === Rectangle);
        this.length = length;
        this.width = width;
    }
}
var obj = new Rectangle(3,4);

```

不过new.target这个值并不是不变的，在继承情况下
```js
class Rectangle{
    constructor(length,width){
        console.log(new.target === Rectangle); //false
        this.length = length;
        this.width = width;
    }
}
class Square extends Rectangle{
    constructor(length){
        super(length,length);
    }
}
var obj = new Square(3); //new.target 是 Square

```
这让构造器如何被调用而更改其行为，下面使用new.target创建一个抽象基类。
```js
class Shape{
    constructor(){
        if(new.target === Shape){
            throw new Error("this class cannot be instantiated directly");
        }
    }
}
class Rectangle extends Shape{
    constructor(length,width){
        super();
        this.length = length;
        this.width = width;
    }
}
var x = new Shape();  //报错
var y = new Rectangle(3,4); //无

console.log(y instanceof Shape); //true

```



