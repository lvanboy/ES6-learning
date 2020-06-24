对象可分类为：
1. 普通对象：拥有JS对象所有默认的内部行为
2. 奇异对象：其内部行为在某些方面有别于默认行为
3. 标准对象：在ES6中被定义的对象，例如Array，Date等
4. 内置对象：脚本在JS运行环境中开始运行时可用的对象，所有标准对象，都是内置对象

对象字面量的语法扩展
### 属性简写
```js
function createPerson(name,age){
    return {
        name:name,
        age:age
    }
}
```
等价于
```js
function createPerson(name,age){
    return {
        name,age
    }
}

```

### 方法简写
```js
var person = {
    name:"lvanboy",
    sayName:function(){
        console.log(this.name);
    }
}
```
等价于
```js
var person = {
    name:"lvanboy",
    sayName(){
        console.log(this.name);
    }
}

```
### 可计算属性名
```js
var person = {},
lastName = "last name";
person["first name"] = "lvanboy";
person[lastName] = "korn";
```

```js
var suffix = "name";
var person = {
    ["first" + suffix]:"lvnaboy",
    ["last" + suffix]:"korn"
}

```

### ES6,Object对象上的新增方法
### Object.is()
为了弥补ES5严格相等运算符残留的怪异缺陷，引入此函数，方法接受两个参数，并在两者类型相同时返回true
```js
console.log(+0 ===-0)
console.log(+0 == -0)
console.log(Object.is(+0,-0));


console.log(NaN == NaN)
console.log(NaN === NaN)
console.log(Object.is(NaN,NaN))

console.log(5 == "5")
console.log(5 === "5")
console.log(Object.is(5,"5"))


```

### Object.assign()
混入（mixin）是JS组合对象最流行的一种模式。在一次混入中，一个对象会从另一个对象中接受属性和方法。
```js
function mixin(receiver,supplier){
    Object.keys(supplier).forEach(function(key){
        receiver[key] = supplier[key]
    })
    return receiver;
}

```

Object.assign实现与mixin类似的功能，assign更贴近赋值的语义，但在对象的属性为复杂类型时，则进行地址引用，这是一种浅拷贝，assign接受多个源对象，后面的源对象可能覆盖前面同名key的值。
```js
var receiver = {};
Object.assign(receiver,{
    type:"js",
    name:"file.js"
},{
    {type:"css"}
})

console.log(receiver.type,receiver.name)

```
Object.assign并不是ES6的重大扩展，确实把很多JS库中通用方法标准化了。


### 重复对象属性覆盖
ES5严格模式为重复的对象字符吗属性引入检查，存在重复属性名抛出错误；但在ES6中移除了重复属性检查，无论是否严格模式，都不再检查。当存在重复属性时，排在后面的属性值称为该属性实际值。


### 自身属性的枚举顺序
ES6严格定义了对象自有属性在被枚举时的返回顺序，这影响了Object.getOwnPropertyNames与Reflect.ownKeys返回属性的方式，也影响Object.assign处理属性的顺序。
自有枚举属性基本顺序
1. 所有数字类型的键，按升序排列
2. 所有字符串类型的键，按被添加到对象的顺序排序。
3. 所有符号类型键，也按添加顺序排列

```js
var obj = {
    a:1,
    0:1,
    c:1,
    2:1,
    b:1,
    1:1
}
obj.d = 1;
console.log(Object.getOwnPropertyNames(obj).join())

```

### 修改对象原型
一般来说，对象的原型会通过构造器或者Object.create()创建对象时被指定，ES5添加了Object.getPrototypeOf方法获取任意指定对象原型，ES6添加了Object.setPrototypeOf,允许修改任意指定对象原型，它接受两个参数：需要被修改的原型对象，即将称为前者原型的对象。
```js
let person = {
    getGreeting(){
        return "hello";
    }
}
let dog = {
    getGreeting(){
        return "woof";
    }
}


let friend = Object.create(person);
console.log(friend.getGreeting());
console.log(Object.getPrototypeOf(friend) === person)

Object.setPrototypeOf(friend,dog);
console.log(friend.getGreeting());
console.log(Object.getPrototypeOf(friend) === dog);

```
对象原型实际值存储在内部属性[[Prototype]]上，Object.getPrototype()方法会返回此属性存储的值，而Object.setPrototype()则可以修改该值。不过，使用[[Prototype]]属性的方式还不止这些。

### 使用super属性的简单原型访问
```js
let person = {
  getGreeting() {
    return "hello";
  },
};

let friend = {
  getGreeting() {
    console.log("getGreeting")
    return Object.getPrototypeOf(this).getGreeting.call(this) + "hi"
  }
};

Object.setPrototypeOf(friend, person);
console.log(friend.getGreeting()); //调用自身的getGreeting方法和原型上的getGreeting方法
console.log(Object.getPrototypeOf(friend) == person)

```

这个实现过程有点难以理解，ES6引入了super，简单来说super就是指向当前对象原型的指针，实际上就是Object.getPrototypeOf(this),ES6的代码：
```js

let person = {
  getGreeting() {
    return "hello";
  },
};

let friend = {
    getGreeting(){
        return super.getGreeting() + "hi";
    }
}
Object.setPrototypeOf(friend, person);
console.log(friend.getGreeting()); 
console.log(Object.getPrototypeOf(friend) == person)

```
同理，你可以使用super调用原型对象上的任意方法，使用方位只能在对象简写方法内；当使用多级继承时，Object.getPrototypeOf()不在适用，此时super引用的强大就体现出来了。
错误案例
```js
let person = {
    getGreeting(){
        return "Hello";
    }
}
let friend = {
    getGreeting(){
        return Object.getPrototypeOf(this).getGreeting.call(this) + "hi";
    }
}

let relative = Object.create(friend);

console.log(person.getGreeting());
console.log(friend.getGreeting());
console.log(relative.getGreeting()); //反复调用自身，relative的原型friend，friend反复调用自身getGreeting，发生栈溢出。

```

ES5中很难解决这样的问题，但在ES6中通过super规避这样的问题。
```js
let person = {
    getGreeting(){
        return "Hello";s
    }
}
let friend = {
    getGreeting(){
        return super.getGreeting() + "hi";
    }
}

Object.setPrototypeOf(friend,person);
let relative = Object.create(friend);
console.log(person.getGreeting());
console.log(friend.getGreeting());
console.log(relative.getGreeting());

```

### 正式的"方法"定义
在ES6之前，对象方法，对象的属性，对应的函数的声明；ES6中正式将方法定义为：一个拥有[[HomeObject]]内部属性的函数，此内部属性内部指向该方法所属对象。
