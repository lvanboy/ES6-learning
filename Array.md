### 创建数组
ES6之前：字面量，Array构造器；并且将类数组转换成数组也不自由。
类数组（拥有数组索引与长度属性的对象）；为了使数组更容易创建，ES6新增Array.from，Array.of

Array.of
使用`new Array()`创建数组时，由于传入的参数和类型不同，实际会导致不同的结果。
```js
let items = new Array(2);
console.log(items.length);
console.log(items[0]);
console.log(items[1]);

items = new Array("2");
console.log(items.length);
console.log(items[0]);

items = new Array(1,2);
console.log(items.length);
console.log(items[0]);
console.log(items[1]);

items = new Array(3,"2");
console.log(items.length);
console.log(items[0]);
console.log(items[1]);

```
ES6引入Array.of来解决这个问题，Array.of总是会创建包含传入参数的数组，不管参数数量与类型
```js
let items = Array.of(1,2);
console.log(items.length);
console.log(items[0]);
console.log(items[1]);

items = Array.of(2);
console.log(items.length);
console.log(items[0]);

items =Array.of("2");
console.log(items.length);
console.log(items[0]);

```
这个产生的结果类似数组字面量的写法，但在向函数传入 参数，应使用Array.of。
```js
function createArray(arrayDef,value){
    return arrayDef(value);
}
let items = createArray(Array.of,value);

```


Array.from
将非数组对象转换为数组总是很麻烦，在ES5中将arguments转换成数组。
```js
function makeArray(arrayLike){
    let results = [];
    for(let i = 0;i<arrayLike.length;i++){
        results.push(arrayLike[i])
    }
    return results;
}

function do1(){
    var args = makeArray(arguments);
    console.log(args,arguments)
}

do1(1,2,3)

```
为了减少代码，或者这样
```js
function makeArray(arrayLike){
    return Array.prototype.slice.call(arrayLike);
}
function do1(){
    var args = makeArray(arguments);
    console.log(args)
}

do1(12,13)

```

这样的方法语义不明确，于是ES6出现了Array.from这样的方法解决这个问题。将一个可迭代对象或者一个类数组对象传入第一个参数，就能返回一个数组。
```js
function do1(){
    var args = Array.from(arguments);
    console.log(args);
}
do1(1,2,3);

```
映射转化
Array.from第二个参数，可以传递一个映射用的函数，该函数会将数组的每个值转换成目标形式
```js
function translate(){
    return Array.from(arguments,(value)=>value+1);
}
let numbers= translate(1,2,3)
console.log(numbers);
```

如果映射函数需要在对象上工作，可以手动传入第三个参数，指定映射函数内部this
```js
let helper = {
    diff:1,
    add(value){
        return value + this.diff;
    }
}

function translate(){
    return Array.from(arguments,helper.add,helper);
}
console.log(translate(1,2,3))

```

在可迭代对象上使用，意味着包含Symbol.iterator属性的对象都可以转成数组。
```js
let numbers = {
    *[Symbol.iterator](){
        yield 1;
        yield 2;
        yield 3;
    }
}

let number2 = Array.from(numbers,value => value+1);
console.log(number2);
```

其他数组方法
find、findIndex
ES5新增indexOf和lastIndexOf检索数组，但这只能检索特定值。检索满足特定条件的值，还得额外定义函数,ES6引入find、findIndex为了解决这个问题。
find、findIndex都接受两个参数，回调函数和指定回调函数内部的this。回调函数可接受三个参数，数组的元素，元素对应的索引以及数组本身,返回true时，停止查找。
find返回匹配值，findIndex返回匹配索引
```js
let numbers = [25,30,35,40,45];
console.log(numbers.find(n=>n>33));
console.log(numbers.findIndex(n=>n>33))

```

fill方法
fill方法使用特定值填充数组一个或者多个元素
```js
let numbers = [1,2,3,4];
numbers.fill(1);
console.log(numbers)

```
可传入填充的起始位置和结束位置
```js
let numbers = [1,2,3,4];
numbers.fill(1,2);
console.log(numbers);
numbers.fill(1,1,3);
console.log(numbers);

```

如果起始位置或者结束位置是负数，它们会加上数组的长度来计算最终的位置

copyWithin
copyWithin也能一次性修改多个元素，copyWithin允许在数组内部复制自身元素，传入的两个参数：粘贴的位置，复制的位置
```js
let numbers = [1,2,3,4];
console.log(numbers.copyWithin(2,0));

```
```js
let numbers = [1,2,3,4];
console.log(numbers.copyWithin(2,0,1));
```

fill与copyWithin不常用，源于类型化数组的需求，出于功能一致性的目的被添加到常规数组上。



### 类型化数组
类型化数组是有特殊用途的数组、被设计用来处理数值类型数据；类型化数组作为canvas元素类型接口实现的一部分，为JS提供了快速的位运算；
对于WebGL需求来说，JS原生数学运算太慢，因为它使用64位浮点格式保存数值，并在必要时将其转换成32位整数；设计概念：
单个数值可视为由位构成的数组，并且可以对其使用与JS数组现有方法类似的方法。

类型化数组允许存储并操作的8种不同数值类型：
1. int8
2. uint8
3. int16
4. uint16
5. int32
6. uint32
7. float32
8. float64

为了使用它们，首先需要新建一个数组缓存区用于存储数据。
数组缓存区（array buffer）是内存中包含一定数量字节的区域，所有类型化数组都是基于数组缓存区。
```js
let buffer = new  ArrayBuffer(10); //分配10个字节
console.log(buffer.byteLength);
let buffer2 = buffer.slice(2,4);
console.log(buffer2.byteLength);
```

仅仅创建一个存储区域而不能写入数据是没有意义的，需要创建一个view视图进行写入；使用视图操作缓冲区；
视图是操作缓冲区的接口；DataView类型是数组缓冲区的通用视图。
```js
let buffer = new ArrayBuffer(10),
    view = new DataView(buffer);
```

也可以在部分缓冲区上创建视图，指定字节偏移量、以及所包含的字节数
```js
let buffer = new ArrayBuffer(10);
let view =  new DataView(buffer,5,2);
let view1 = new DataView(buffer);

console.log(view.buffer === buffer); //视图所绑定的缓冲区
console.log(view1.buffer === buffer);
console.log(view.byteOffset);
console.log(view1.byteOffset);
console.log(view.byteLength);
console.log(view1.byteLength);

```

读取和写入数据
操作int8或者uint8类型的读取与写入操作：
1. getInt8(byteOffset)
2. setInt8(byteOffset,value)
3. getUint8(byteOffset)
4. setUint8(byteOffset,value)

将8换成16或者32,依次类推的其他类型的操作方法
DataViewe也提供了读写方法以便处理浮点数
1. getFloat32(byteOffset);
2. setFloat32(byteOffset,value);
3. getFlaot64(byteOffset);
4. setFloat64(byteOffset,value);

```js
let buffer = new ArrayBuffer(2),
    view = new DataView(buffer);
    view.setInt8(0,5);
    view.setInt8(1,-1);
    console.log(view.getInt8(0));
    console.log(view.getInt8(1));
```

ES6提供了特定类型视图即类型化数组
1. 	Int8Array
2. 	Uint8Array
3. 	Uint8ClampedArray(无溢出转换)
4. 	Int16Array
5. Uint16Array
6. 	Int32Array
7. 	Uint32Array
8.	Float32Array
9. Float64Array

类型化数组只能用在特定的一种类型上工作，Int8Array只能处理int8值；类型化数组可以使用数值型索引来访问。

创建特定类型视图
```js
let buffer = new ArrayBuffer(10),
    view1 = new Int8Array(buffer),
    view2 = new Int8Array(buffer,5,2);

    console.log(view1.buffer === buffer);
    console.log(view2.buffer === buffer);
    console.log(view1.byteOffset);
    console.log(view2.byteOffset);
    console.log(view1.byteLength);
    console.log(view2.byteLength);

```
通过传递数值给结构化数组的构造器，此数值表示该数组含元素的数量；
```js
let ins = new Int16Array(2),
    floats = new Float32Array(5);
    console.log(ins.byteLength);
    console.log(ins.length)
    console.log(floats.byteLength);
    console.log(floats.length);

```

通过向构造器传递单个对象参数，可以是下列四种对象之一：
1. 类型化数组：数组的所有元素都会被复制到新的类型化数组中
2. 可迭代对象：该对象的迭代器会被调用以便将数据插入到类型化数组中
3. 数组：该数组元素会被插入到新的类型化数组中
```js
let ins1 = new Int16Array([25,50]);
let ins2 = new Int32Array(ins1);

console.log(ins1.buffer === ins2.buffer)
console.log(ins1.length);
console.log(ins1.byteLength);

console.log(ins2.byteLength);
console.log(ins2.length);
console.log(ins2[0]);
console.log(ins2[1]);

```

类型化数组和常规数组的相似点
在很多场景下：都可以像使用常规数组一样使用类型化数组。
```js
let ins = new Int16Array([25,30]);
console.log(ins.length);
console.log(ins[0]);
console.log(ins[1]);

ins[0] = 1;
ins[1] = 2;
console.log(ins[0]);
console.log(ins[1]);
 
```

类型化数组拥有和常规数组等效的方法
copyWithin()		
entries()		
fill()		
filter()		
find()		
findIndex()		
forEach()		
indexOf()		
join()		
keys()		
lastIndexOf()		
map()		
reduce()		
reduceRight()		
reverse()	
slice()		
some()		
sort()		
values()

类型化数组会做额外的类型检查以确保安全，并且返回值根据Symbol.species属性来确定，属于某种类型化数组。
```js
let ins = new Int16Array([25,40]);
let mapped = ins.map(v=>v*2);
console.log(mapped.length);
console.log(mapped[0])
console.log(mapped[1]);
console.log(mapped instanceof Int16Array);

```

迭代器
与常规数组相同，类型化数组也拥有三个迭代器，entries()、keys()、values()
这意味着可以对类型化数组使用扩展运算符，或者对其使用for-of循环。
```js
let ins = new Int16Array([12,23]);
let insArr = [...ins];
console.log(insArr instanceof Array);
console.log(insArr[0]);
console.log(insArr[1]);

```

类型化数组也包含静态的of和from方法，只不过返回的是类型化数组，而非常规数组。
```js
let ins = Int16Array.of(25,30);
let floats = Float32Array.from([1.2,2.5]);
console.log(ins instanceof Int16Array);
console.log(floats instanceof Float32Array);

console.log(floats.length);
console.log(floats[0])
console.log(floats[1])
```

类型化数组与常规数组最大区别，类型化数组不是从Array派生的，使用Array.isArray返回false
```js
let ins = new Int16Array([25,30]);
console.log(ins instanceof Array);
console.log(Array.isArray(ins));

```

行为差异
常规数组可以伸展或者收缩，而类型化数组保持大小不变,对于不存在的索引值，就忽略。
```js
let ins = new Int16Array([25,30]);
console.log(ins.length);
console.log(ins[0]);
console.log(ins[1]);

ins[2] = 5;
console.log(ins.length)
console.log(ins[2])

```

类型化数组会进行类型检查，不符合的类型就被转化为0；
```js
let ins = new Int16Array(['hi']);
console.log(ins.length);
console.log(ins[0]);

```

所有修改项目值的方法都符合类型检查不符合转为0的条件。
```js
let ins = new Int16Array([2,1]);
let mapped = ins.map(v => "hi");
console.log(mapped.length);
console.log(mapped[0]);
console.log(mapped[1]);
console.log(mapped instanceof Int16Array);
console.log(mapped instanceof Array);

```
因为不能改变类型数组的大小，所以以下方法都不可以使用
concat()
pop();
push();
shift();
splice()
unshift()

附加方法
类型化数组具备常规数组不具备的set和subarray方法。这两个方法作用相反，set从其他数组复制元素到当前类型化数组；
subarray是从当前类型化数组的一部分提取为新的类型化数组；
```js
let ins = new Int16Array(4);
ins.set([10,20]);
ins.set([30,40],2);

console.log(ins.toString());

```

```js
let ins = new Int16Array([1,2,3,4]),
subins1 = ins.subarray(),
subins2 = ins.subarray(2),
subins3 = ins.subarray(1,3);
console.log(subins1.toString())
console.log(subins2.toString())
console.log(subins3.toString())


```