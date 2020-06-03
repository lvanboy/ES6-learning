** 迭代器与for-of循环
遍历数组的方式？

1. for
2. forEach
3. for-of

``` js
var i = 0,
    arr = [1, 2, 3]
for (i = 0; i < arr.length; i++) {
    console.log(arr[i])
}
arr.forEach((item, index) => {
    console.log(item, index)
})
for (let [v, k] of arr) {
    console.log(v, k)
}
```

** 千万不要使用for - in遍历数组 **

``` js
var arr = [1, 2, 3]
arr.name = "lvanboy";
arr.test = function() {
    return "test";
}
Array.prototype.value = 123;
for (let k in arr) {
    console.log(k, arr[k])
    console.log(typeof k)
}
```

* k不是数字类型的下标，而是字符串类型，如果你忽略了类型，进行数值运算是，可能会发生意想不到的错误。
* for-in遍历会遍历自定义属性, 甚至数组原型链上的属性
* 遍历数组元素的顺序可能是随机的
* for-in用于普通对象的遍历，而不是数组

** forEach 循环属于迭代器模式，循环内不能使用break，continue，return等控制循环的进度**
建议ES6提供的*for-of*遍历解决了以上的数组遍历方式的所有缺点，主要用于遍历数据，可以遍历的数据结构有数组、字符串、Map、Set。***不支持普通对象*

``` js
var arr = [1, 2, 3];
for (var value of arr) {
    console.log(value)
}
```

这里有一个可迭代对象的概念：凡是拥有[Symbol.iterator]()方法的对象被称为可迭代对象，为什么使用[Symbol.iterator]作为方法对象的key，因为这样可以保证该方法在任何对象下的唯一性
迭代器的技术细节：for-of循环首先调用集合（数组）的[Symbol.iterator]()方法，这个方法返回一个新的迭代器对象，迭代器对象是任意具有.next方法的对象，for-of循环将反复调用这个next方法, 直到next()方法，返回对象{done:true, value:"}, done的值为true。
这里定义迭代器对象

``` js
var Iterator = {
    [Symbol.iterator]() {
        return this;
    },
    next() {
        return {
            done: false,
            value: 1
        }
    }
}
for (VAR of Iterator) {
    console.log(VAR)
}
var $iterator = Iterator[Symbol.iterator]();
var $retuslt = $iterator.next();
while (!$result.done) {
    VAR = $result.value;
    $result = $iterator.next();
}
```

** 生成器Generators

``` js
function* quips(name) {
    console.log('test');
    yield `你好${name}!` ;
    if (name.startWith("X")) {
        yield `你的名字${name}首字母是X，这很COOL` ;
    }
    yield `我们下次再见` ;
}
```

生成器与普通函数的差异：

1. 生成器使用类似函数声明的方式function*
2. 生成器内部有一种类似return的语法：关键字yield，普通函数可return一次，生成器可yield多次，yield表示暂停状态，后续可恢复执行状态。

当生成器被调用时, 没有立刻执行，而是返回一个暂停的生成器对象, 每当调用生成器的next方式时，函数调用自身并执行到下一个yield表达式后，再次暂停，当所有的yield表达式都执行完了，再次调用next方法，则返回对象中的value为undefined；
生成器执行时，拥有确定的连续执行状态，永不并发。

``` js
var iter = quips("lvanboy");
console.log(iter);
iter.next();
iter.next();
iter.next();
iter.next();
```

类比迭代器与生成器
首先，实现一个迭代器的方式实现range函数功能

``` js
class RangeIterator {
    constructor(start, stop) {
        this.value = start;
        this.stop = stop;
    };
    [Symbol.iterator]() {
        return this;
    }
    next() {
        var value = this.value;
        if (value < this.stop) {
            this.value++;
            return {
                done: false,
                value
            }
        } else {
            return {
                done: true,
                value: undefined
            }
        }
    }
}

function range(start, stop) {
    return new RangeIterator(start, stop);
}

function test2() {
    for (var value of range(0, 3)) {
        console.log(value)
    }
}
test2();
```

使用生成器实现range函数功能

``` js
function range(start, stop) {
    for (var i = start; i < stop; i++) {
        yield i;
    }
}

function test3() {
    for (var value of range) {
        console.log(value)
    }
}
```

由此可见，生成器就是迭代器，但迭代器的实现过程更加底层，而yield关键字，对应着next的调用返回值，大大简化了迭代器的实现过程。



