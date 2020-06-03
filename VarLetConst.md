## var声明与变量提升
var声明的变量，无论声明在哪里，都会视为声明于所在函数的顶部，如果声明不在函数内，都相当于声明在全局作用域的顶部。
```js
function getValue(condition){
    if(condition){
        var value = "lvanboy";
        console.log(value);
    }else{
        console.log(value);
        return null;
    }
    console.log(value);   
}
getValue(1); //lvanboy,lvanboy
getValue(false) //undefined

```

getValue方法在运行时被解释成如下：

```js
function getValue(condition){
    var value;
    if(condition){
        value = "lvanboy";
        console.log(value);
    }else{
        console.log(value);
        return null;
    }
    console.log(value);
}


```

## let声明的块级作用域（词法作用域）
块级走用于产生的条件：
1. 花括号包裹的代码块
2. 函数体内部

```js
function getValue(condition){
    if(condition){
        let value = "lvanboy";
        console.log(value);
    }else{
        console.log(value);
        return null;
    }
    console.log(value);
}
getValue(1); //lvanboy,报错
getValue(false) //报错

```

let和var的其他区别
1. 在声明相同变量时，如果let与var(或者let与let)处于相同作用域，则产生报错。
2. let声明在不同的代码块中，产生多个块级作用域，相互不会冲突。
```js
var a = 1;
let a = 2; //报错

```

```js
var a = 1;
if(1){
    let a = 2; //正常
    console.log(a);//2
}
console.log(a);//1

```

```js
let a = 1;
if(1){
    let a = 2;
    console.log(a); //2
}
console.log(a);//1

```

```js
var a = 1;
if(1){
    var a = 2;
    console.log(a) //2
}
console.log(a)//2

```

ES6中不仅Let拥有块级作用域，const也是如此。只不过，Let用于声明变量，const用于声明常量,使用const声明变量必须赋值，并且在后续的运行时中不可再次赋值。
```js
const a = 1;
const b ;//报错

```

```js
const a = 1;
a = 2; //报错

```


```js
if(1){
    const a = 1;
}
console.log(a) //报错

```

```js
const a = 1;
if(1){
    const a = 2;
    console.log(a)
}
console.log(a);

```

const声明并赋值的变量不可二次赋值是针对值变量，如果使用const声明并赋值的是引用对象{}、[],是可以修改对象的成员的,试图修改const声明变量的引用地址会产生报错。
```js
const o = {a:1,b:2};
o.a = 2;
o.b = 1;
o.c = 3;

```

```js

const arr = [1,2,3];
arr[0] = 2;
arr[1] = 1;

```

```js
const o = {name:'lvanboy'};
o = {name:"lvanboy"}

```

在相同作用域内，在const和let声明前使用其变量会产生报错，这个学过静态语言的应该很好理解。在JS运行时，let和const声明的变量被放入TDZ（暂时性死区），如果你超前使用TDZ中的变量，则产生报错，后续代码不会执行。
```js
if(1){
    console.log(typeof a);
    let a = 1;
    const b = 2;
    console.log(a)
}

```

```js
console.log(typeof a); //处于不同作用域不会导致TDZ
let c = 3;
if(1){
    let a = 1;
    const b = 2;
    console.log(a,b)
}

```

## 循环中的块级作用域

循环中的块级作用域，var声明的循环变量是不具备的,循环内创建的函数拥有对同一个变量的引用，在循环结束后，引用值为循环结束值
```js
for(var i = 0;i<10;i++){
    console.log(i) //这里并没有保留i的值，正常输出
}
console.log(i)
```

```js
var arr = [];
for(var i = 0;i<10;i++){
    arr.push(function(){console.log(i)});
}
console.log(arr)//这里保存的函数里的i都没有立即执行，当函数执行时i的值已经变成10了
arr.forEach(function(fun){
   fun();
})
//10个10;

```

在没有ES6时，是这样解决的,在每次循环时，通过立即执行函数运行时，将当前的i通过函数参数传递到内部函数里
```js
var arr = [];
for(var i = 0;i<10;i++){
    arr.push(
        (function(value){
            return function(){
                console.log(value);
            }
        })(i)
        );
}

arr.forEach(function(func){
   func();
})


```

而在ES6中使用Let声明循环变量起到IIFE的作用，原理是反复声明了多个作用域的相同变量进行赋值，多个作用域的好处在于，即函数引用i的值也来自多个作用域，也就是多个不同的值，而不是同一个作用域的相同的值。
```js
let arr = [];
for(let i = 0;i<10;i++){
    arr.push(function(){
        console.log(i);
    })
}
arr.forEach(function(func){
    func();
})

```

在for循环内，const不能用于循环变量的声明，但是在for-in和for-of中可以使用const声明循环变量。
```js
let obj = {
    a:1,
    b:2,
    c:3
}
for(const v in obj){
    console.log(v)
}

```

```js
let arr = [1,2,3];
for(const v of arr){
    console.log(v);
}
```


## 全局作用下，var、let的差异
var声明的变量，在全局作用域下，会覆盖全局变量,而let和const在全局作用域下声明的变量不会绑定在window全局对象下，也就不会覆盖全局对象,但在使用时为了区分使用window访问。
```js
var Math = "math";
console.log(Math);
console.log(window.Math)
```

```js
let Math = "math";
console.log(Math);
console.log(window.Math.max(1,2,3))

```

## 最佳实践
默认使用const语句声明，在确定其本身发生赋值操作时，调整为let变量声明，这样能时刻提醒你，哪些是变量，哪些是常量，代码中尽量保证不可变性，有助于防止一些类型错误。


