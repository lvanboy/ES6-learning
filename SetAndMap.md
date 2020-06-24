Set不包含重复值的有序列表
Map常被用于缓存，存储数据供快速索引


### Set操作
```js
let set = new Set();
set.add(5);
set.add("5");

console.log(set.size)
```
Set不会使用强制类型转换，判断是否重复，Set中只有+0和-0被判断为相同；

```js
let set = new Set();
set.add(-0);
set.add(+0);
console.log(set.size)
```

可以添加多个对象，它们不会被合并为同一项
```js
let set = new Set();
set.add({});
set.add({});
console.log(set.size);
```

如果add方法用相同的值进行多次操作，那么第一次之后的实际调用被忽略
```js
let set = new Set();
set.add(5);
set.add("5");
set.add(5)

console.log(set.size)

```

使用数组初始化Set
```js
let set = new Set([1,2,3,4,5,5,5])
console.log(set.size)
```

Set构造函数可接受任意可迭代对象作为参数，能使用数组，因为它默认就是可迭代的。Set构造器会使用迭代器来提取参数中的值。

测试某个值是否存在于Set
```js
let set = new Set();
set.add(2);
set.add("2");
console.log(set.has(2),set.has("3"))

```

删除Set中的值
```js
let set = new Set();
set.add(2);
set.add("2");
console.log(set.has(2));
set.delete(2);
console.log(set.has(2));
console.log(set.size)
set.clear();
console.log(set.has("2"));
console.log(set.size)
```

遍历set
```js
let set = new Set([1,2]);
set.forEach((value,key,ownerSet)=>{
    console.log(key + " " + value);
    console.log(ownerSet === set);
})

```

与使用数组相同，如果回调函数中使用this，可给forEach传入this值作为第二个参数
```js
let set = new Set([1,2]);
let processor = {
    output(value){
        console.log(value);
    },
    process(dataSet){
        dataSet.forEach((value)=>{
            this.output(value)
        },this)
    }
}
processor.process(set);

```

虽然Set可以很好的追踪离散值，但是无法使用游标直接访问某个值。若有需要，将set转换为数组
```js
let set = new Set([1,2,3,4,5,1,2,3]),
    arr = [...set];
console.log(arr[0])

```

使用Set进行数组去重
```js
function eliminateDuplicates(items){
    return [...new Set(items)]
}
let numbers = [1,2,3,NaN,undefined,NaN,undefined,null,null]
console.log(eliminateDuplicates(numbers))
```

### WeakSet
由于Set类型存储对象引用的方式，只要Set实例的引用仍然存在，所存储的对象就无法被垃圾回收，从而无法释放内存。
```js
let set = new Set();
let key = {};
set.add(key);
console.log(set.size);
//取消原始引用
key = null;
console.log(set.size);
console.log([...set][0])

```
key引用被释放，但set引用仍然存在；为了缓解这个问题，ES6引入了Weak Set,该类型只允许存储对象弱引用，而不能存储基本类型的值。

### Weak Set操作
创建Weak Set
```js
let set = new WeakSet(),
key = {};
set.add(key);
console.log(set.has(key));
set.delete(key);
console.log(set.has(key));

```
```js
let key1 = {},key2 = {},set = new WeakSet([key1,key2]);
console.log(set.has(key1),set.has(key2));

```

set和WeakSet的最大区别就是对象弱引用
```js
let set = new WeakSet(),key = {};
set.add(key);
console.log(set.has(key));
//	移除对于键的最后一个强引用，同时从	Weak	Set	中移除 
key = null;
console.log(set.size);

```
其他区别：
1. 对于WeakSet的实例，若调用add方法传入非对象的参数，抛出错误；has、delete则会返回false
2. WeakSet不可迭代，因此不能用于for-of循环
3. WeakSet无法暴露出任何迭代器，因此没有任何编程手段判断WeakSet的内容
4. WeakSet没有forEach
5. WeakSet没有size

WeakSet看起来功能有限，但对于正确内容管理是有必要的；Set提供了处理列表新的方式，不过它无法为值提供额外信息，因此ES6添加了Map；

### Map
Map是键值对的有序列表，键和值都可以是任意类型；键的比较使用的Object.is
```js
let map = new Map();
map.set("title","ES6");
map.set("year",2020);
console.log(map.get("title"))
console.log(map.get("year"))
```
如果get方法查找不到key则返回undefined,也使用对象作为key
```js
let map = new Map(),key = {} , key2 ={};
map.set(key,5);
map.set(key2,10);
console.log(map.get(key));
console.log(map.get(key2));

```

Map与Set有意共享了几个方法

1. has(key)
2. delete(key)
3. clear()

Map同样拥有size属性，用于指明包含多少键值对
```js
let map = new Map();
map.set("name","lvanboy");
map.set("age",24);
console.log(map.size);

console.log(map.has("name"));
console.log(map.get("name"));

console.log(map.has("age"));
console.log(map.get("age"));

map.delete("name");
console.log(map.has("name"));
console.log(map.get("name"));
console.log(map.size);

map.clear();
console.log(map.has("name"));
console.log(map.get("name"));

console.log(map.has("age"));
console.log(map.get("age"));
console.log(map.size)
```

Map的初始化
类似于Set，将数组传入Map构造器，数组的每一项也必须是一个数组，内部的数组首个作为key，第二个作为value
```js
let map = new Map([["name","lvanoby"],["age",24]]);
console.log(map.has("name"));
console.log(map.get("name"));
console.log(map.has("age"));
console.log(map.get("age"));

```

遍历Map
forEach按照被添加到Map的顺序输出
```js
let map = new Map([["name","lvanoby"],["age",24]]);
map.forEach((value,key,ownerMap)=>{
    console.log(key + " " + vlaue);
    console.log(ownerMap === map);
})

```

### WeakMap
WeakMap对于Map而言，就像WeakSet对于Set一样：Weak版本都是存储对象的弱引用的方式；在WeakMap中所有的键都必须是对象，而且这些对象都是弱引用，不会干扰垃圾回收。

WeakMap的最佳 用武之地，浏览器创建一个关联到特定Dom元素的对象；


### 使用WeakMap
WeakMap是键值对的无序列表，其中的键必须是非null对象，值则允许是任意类型；
```js
let map = new WeakMap(),
    element = document.querySelector(".element");
    map.set(element,"origin");
let value = map.get(element);
console.log(value);

element.parentNode.removeChild(element);
element = null;
```

### WeakMap初始化
```js
let key1 = {},
    key2 = {},
    map = new WeakMap([[key1,"Hello"],[key2,"42"]]);
    console.log(map.has(key1));
    console.log(map.get(key1));
    console.log(map.has(key2));
    console.log(map.get(key2));

```

### WeakMap方法
WeakMap只有两个附加方法能用来与键值交互，has()、delete();枚举WeakSet既没有必要也不可能；
```js
let map = new WeakMap(),
    element = document.querySelector(".element");
    map.set(element,"origin");
    console.log(map.has(element))
    console.log(map.get(element));
    map.delete(element);
    console.log(map.has(element));
    console.log(map.get(element));

```

weakset实现私有属性

```js
function Person(name){
    this._name = name;
}
Person.prototype.getName = function(){
    return this._name;
}

```

ES5中创建私有数据的方式
```js
var Person = (function(){
    var privateData = {},
        privateId = 0;
    function Person(name){
        Object.defineProperty(this,"_id",{
            value:privateId++
        })
        privateData[this._id] = {
            name:name
        }
    }
    Person.prototype.getName = function(){
        return privateData[this._id].name;
    }
    return Person;
}())

```
此方式最大的问题是privateData永远不会消失。

该问题可以使用WeakMap来解决
```js
let Person = (function(){
    let privateData = new WeakMap();
    function Person(name){
        privateData.set(this,{name:name})
    }
    Person.prototype.getName = function(){
        return privateData.get(this).name;
    }
    return Person;
}())

let person = new Person("lvanboy");
console.log(person)

```

WeakMap的用法与局限性
在抉择WeakMap还是正规Map时，首先考虑是否只使用对象类型的键，若是，最好使用WeakMap，因为它能保证额外数据在不使用时被销毁。但WeakMap内容可见度很低，你不能用forEach方法遍历，size属性；如果你确实需要检测一些功能，正规的Map是更好的选择，但要确保内存的使用。若只是使用非对象作为key，那么正规map更好。


