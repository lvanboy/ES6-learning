ES6让开发者能进一步接近JS引擎的能力，语言通过proxy暴露了在对象上的内部工作，代理是一种封装，能拦截并改变JS引擎的底层操作。


### 数组问题
```js
let colors = ["red",'green',"blue"];
console.log(colors.length);

colors[3] = "black";

console.log(colors.length);

console.log(colors[3])

colors.length = 2;

console.log(colors.length);

console.log(colors[3])
console.log(colors[2])
console.log(colors[1])

```
在ES5中开发者无法模拟这种依靠length来扩展或收缩数组元素的行为，但是proxy可以实现。

通过new proxy创建代理，用于替代目标对象，这个代理对目标对象进行了虚拟，它们可视为同一对象，代理允许拦截目标对象的底层操作，拦截行为使用了能够响应特定操作的函数（被称为陷阱）。
反射接口由Reflect对象所代表，是给底层操作提供默认行为的方法集合，这些方法可以被代理。每个代理陷阱都拥有一个对应的反射方法。

![代理与反射](/pics/proxy01.PNG)

每个陷阱函数都可以重写JS对象的一个特定内置行为，允许拦截和修改。如果希望使用默认的内置行为，使用对应的反射接口方法。


### 创建一个代理
使用Proxy构造器，需要传入目标对象和处理器，处理器中可以定义一个或者多个陷阱函数对象，如果未设置陷阱函数，代理会对所有操作采取默认行为；创建一个仅进行转发的代理，不需要陷阱函数
```js
let target = {};

let proxy = new Proxy(target,{});

proxy.name = "proxy";

console.log(proxy.name);
console.log(target.name);

target.name = "target";
console.log(proxy.name);
console.log(target.name)

```
缺少陷阱函数的代理没啥用，proxy将name进行转发到target目标对象身上，proxy本身并不拥有name属性

### 使用set陷阱函数验证属性值
定义set陷阱函数来重写设置属性值的默认行为，该陷阱函数接受4个参数
1. trapTarget 目标对象
2. key 需要写入的属性的key
3. value 需要写入属性的值
4. receiver 操作发生的对象，通常是代理对象

Reflect.set是set陷阱函数的反射方法，同样也是set操作的默认行为。

下面实现一个添加的属性值必须为数字的代理行为
```js
let target = {
    name:"target"
}

let proxy = new Proxy(target,{
    set(trapTarget,key,value,receiver){
        if(!trapTarget.hasOwnProperty(key)){
            if(isNaN(value)){
                throw new Error("Property must be a number");
            }
        }
        return Reflect.set(trapTarget,key,value,receiver);
    }
})

proxy.count = 1;
console.log(proxy.count)
console.log(target.count);

proxy.name = "proxy";
console.log(proxy.name);
console.log(target.name);

proxy.antherName = "lvanboy";


```

### 使用get陷阱函数进行对象外形验证
JS的特性之一，当读取不存在的属性时不会抛出错误，而会把undefined当作该属性的值
```js
let target = {};
console.log(target.name) //undefined;

```

对象外形指的是对象已有属性和方法的集合；JS引擎使用对象外形来进行代码优化，代理能够让对象外形验证变得轻而易举
使用get陷阱函数，接受三个参数:
1. trapTarget 目标对象
2. key 需要读取的key
3. receiver 操作发生的对象

同理Reflect.get是get方法的默认操作，使用它们可以在目标属性不存在时抛出错误。
```js
let proxy = new Proxy({},{
    get(trapTarget,key,receiver){
        console.log(1,trapTarget,key)
        if(!(key in receiver)){
            throw new TypeError("Property " + key + " doesn't exist")
        }
        return Reflect.get(trapTarget,key,receiver);   
    }
})

proxy.name = 'proxy';
console.log(proxy.name);

console.log(proxy.children.value)

```

### 使用has陷阱函数隐藏属性
in运算符用于判断对象中是否存在某个属性，无论该属性是自身属性还是原型属性；存在返回true，否则返回false
```js
let target = {
    value : 42
}

console.log("value" in target)
console.log("toString" in target)

```
has陷阱函数会在使用in运算符下被调用，传入参数trapTarget目标对象、key需要检查的属性key
Reflect.has接受同样的参数，允许修改部分属性在接受in检查时的行为，但保留其他属性默认。

```js
let target = {
    name:"target",
    value:42
}
let proxy = new Proxy(target,{
    has(tarpTarget,key){
        if(key === 'value'){
            return false;
        }else{
            return Reflect.has(tarpTarget,key);
        }
    }
})
console.log("value" in proxy);
console.log("name" in proxy);
for(let key in proxy){
    console.log(1,key)
}
```


### 使用deleteProperty陷阱函数避免属性删除
delete运算符可以从指定对象上删除属性；如果试图用delete运算符删除一个不可配置的属性，在严格模式下抛出错误；非严格模式返回false。
```js

let target = {
    name:"target",
    value:42
}
Object.defineProperty(target,"name",{configurable:false});

console.log("value" in target);

let result1 = delete target.value;
console.log(result1);

console.log("value" in target);

let result2 = delete target.name;
console.log(result2);

console.log("name" in target);

```

deleteProperty陷阱函数会在使用delete运算符去删除对象属性时被调用，并传入参数：
trapTarget 目标对象，key需要删除的key;Reflect.deleteProperty提供了默认操作。
```js
let target = {
    name:"target",
    value:42
}
let proxy = new Proxy(target,{
    deleteProperty(trapTarget,key){
        if(key === "value"){
            return false;
        }else{
            return Reflect.deleteProperty(trapTarget,key);
        }
    }
})

console.log("value" in proxy);
let result1 = delete proxy.value;

console.log(result1);
console.log("value" in proxy);

console.log("name" in proxy);
let result2 = delete proxy.name;
console.log(result2);
console.log("name" in proxy);

```

### 原型代理的陷阱函数
代理允许通过setPrototypeOf和getPrototypeOf对Object.setPrototypeOf和Object.getPrototypeOf方法的操作进行拦截；
getPrototypeOf陷阱函数返回值必须是一个对象或者null，setPrototypeOf必须在操作没有成功情况下返回false，这样会让Object.setPrototypeOf抛出错误。

```js
let target = {};
let proxy = new Proxy(target,{
    getPrototypeOf(trapTarget){
        return null;
    },
    setPrototypeOf(trapTarget,proto){
        return false;
    }
})

let targetProto = Object.getPrototypeOf(target);
let proxyProto = Object.getPrototypeOf(proxy);

console.log(targetProto === Object.prototype)
console.log(proxyProto === Object.prototype);
console.log(proxyProto);

Object.setPrototypeOf(target,{});

Object.setPrototypeOf(proxy,{});

```
赋予默认行为
```js
let target = {};
let proxy = new Proxy(target,{
    getPrototypeOf(trapTarget){
       return Reflect.getPrototypeOf(trapTarget);
    },
    setPrototypeOf(trapTarget,proto){
      return  Reflect.setPrototypeOf(trapTarget,proto);
    }
})

let targetProto = Object.getPrototypeOf(target);
let proxyProto = Object.getPrototypeOf(proxy);

console.log(targetProto === Object.prototype)
console.log(proxyProto === Object.prototype);
console.log(proxyProto);

Object.setPrototypeOf(target,{});

Object.setPrototypeOf(proxy,{});

```

Reflect.getPrototypeOf()方法在接受到的参数不是一个对象时会抛出错误；
而Object.getPrototypeOf()则会在操作之前将数值转化成一个对象
```js
let result1 = Object.getPrototypeOf(1);
console.log(result1 === Number.prototype);

```
Object.setPrototypeOf()会将传入的第一个参数作为自身的返回值；而setPrototypeOf陷阱函数返回一个布尔值。
```js
let target1 ={};
let result1 = Object.setPrototypeOf(target1,{});
console.log(target1,result1)
console.log(target1 === result1);

let target2 = {};
let reuslt2 = Reflect.setPrototypeOf(target,{});
console.log(target2 === result2);
console.log(result2);

```


### 对象可扩展性的陷阱函数
ES5通过Object.preventExtensions与Object.isExtensible方法给对象增加了可拓展性。
而ES6通过preventExtensions与isExtensible陷阱函数允许代理拦截对底层对象的方法调用。都传入一个参数tarpTarget和返回boolean值。

```js
let target ={};
let proxy = new Proxy(target,{
    isExtensible(trapTarget){
        return Reflect.isExtensible(trapTarget)
    },
    preventExtensions(trapTarget){
        return Reflect.preventExtensions(trapTarget);
    }
})

console.log(Object.isExtensible(target));
console.log(Object.isExtensible(proxy));

Object.preventExtensions(proxy);
console.log(Object.isExtensible(proxy))
console.log(Object.isExtensible(target));

```

```js
let target ={};
let proxy = new Proxy(target,{
    isExtensible(trapTarget){
        return Reflect.isExtensible(trapTarget)
    },
    preventExtensions(trapTarget){
        return false;//强制操作失败
    }
})

console.log(Object.isExtensible(target));
console.log(Object.isExtensible(proxy));

Object.preventExtensions(proxy);
console.log(Object.isExtensible(proxy))
console.log(Object.isExtensible(target));

```

Object.isExtensible()和Reflect.isExtensible几乎一样。当传入参数不是一个对象时，Object.isExtensible()总是返回false，而Reflect.isExtensible会报错。
```js
let result1 = Object.isExtensible(1);

console.log(result1);

let result2 = Reflect.isExtensible(2);

```
Object.preventExtensions()总是将传递给它的参数返回即使不是一个对象；而对于Reflect.preventExtensions来说，当参数不是一个对象时，会发生报错。当参数是一个对象时操作成功返回true否则boolean。

```js
let result1 = Object.preventExtensions(2);
console.log(result1);

let target = {};
let result2 = Object.preventExtensions(target);
console.log(result2);

let result3 = Reflect.preventExtensions(2);

```


### 属性描述符陷阱函数
ES5最重要的特性就是引入Object.defineProperty()用于定义属性的特性；并且可以使用Object.getOwnPropertyDescriptor来检索这些特性；代理允许defineProperty和getOwnPropertyDescriptor陷阱函数对这两个方法的调用进行拦截。
defineProperty接受三个参数：trapTarget、key、descriptor，返回boolean
getOwnPropertyDescriptor接受二个参数：trapTarget、key，返回响应的descriptor

```js
let proxy = new Proxy({},{
    defineProperty(trapTarget,key,descriptor){
        return Reflect.defineProperty(trapTarget,key,descriptor);
    },
    getOwnPropertyDescriptor(trapTarget,key){
        return Reflect.getOwnPropertyDescriptor(trapTarget,key);
    }
})

Object.defineProperty(proxy,"name",{
    value:"proxy"
})
console.log(proxy.name)

let descriptor = Object.getOwnPropertyDescriptor(proxy,"name");
console.log(descriptor.value);

```

```js
let proxy =new Proxy({},{
    defineProperty(tarpTarget,key,descriptor){
        if(typeof key === "symbol"){
            return false;
        }
        return Reflect.defineProperty(tarpTarget,key,descriptor);
    }
})
Object.defineProperty(proxy,"name",{
    value:"proxy"
})
console.log(proxy.name);

let nameSymbol = Symbol("name");
Object.defineProperty(proxy,nameSymbol,{
    value:"proxy"
})

```

任意对象都可以传递给Object.defineProperty(),而只有包含enumerable,configurable,
value,wriable,get,set这类许可属性可以传递给defineProperty陷阱函数。
```js
let proxy = new Proxy({},{
    defineProperty(trapTarget,key,descriptor){
        console.log(descriptor.value);
        console.log(descriptor.name);
        return Reflect.defineProperty(trapTarget,key,descriptor);
    }
})

Object.defineProperty(proxy,"name",{
    value:"lvanboy",
    name:"lvanboy"
})


```

getOwnPropertyDescriptor陷阱函数要求返回必须是null、undefined或者一个对象；如果返回值是一个对象，则只允许对象拥有enumerable,configurable,value,wriable,get,set
这类属性。如果对象上包含了其他属性则报错。
```js
let proxy = new Proxy({},{
    getOwnPropertyDescriptor(tarpTarget,key){
        return {
            name:"lvabnoy"
        }
    }
})
Object.getOwnPropertyDescriptor(proxy,"name");

```


### Ownkeys陷阱函数
ownKeys代理陷阱拦截了内部方法[[OwnPropertyKeys]]，并允许你返回一个数组重写该行为。
返回的数组被用于Object.keys和Object.getOwnPropertySymbols,Object.getOwnPropertyNames,Object.assign;
Object.keys和Object.getOwnPropertyNames会将符号值从数组中过滤，而Object.getOwnPropertySymbols会将字符串值从数组中过滤；Object.assign会使用数组中的所有字符串和符号值。

ownKeys陷阱函数接受单个参数，目标对象。必须返回一个数组或者类数组对象，否则报错。
```js
let proxy = new Proxy({},{
    ownKeys(trapTarget){
        return Reflect.ownKeys(trapTarget).filter(key=>{
            return typeof key !== "string" || key[0]!=="_"
        })
    }
})

let nameSymbol = Symbol("name");

proxy.name = "proxy";
proxy._name = "private";
proxy[nameSymbol] = "symbol";

let names = Object.getOwnPropertyNames(proxy),
    keys = Object.keys(proxy),
    symbol = Object.getOwnPropertySymbols(proxy);

    console.log(names.length);
    console.log(names[0]);

    console.log(keys.length);
    console.log(keys[0]);

    console.log(symbol.length);
    console.log(symbol[0])
```


###  apply、construct陷阱函数
只有apply、construct要求代理目标对象必须是一个函数；apply和construct陷阱函数对函数内部方法[[Call]]和[[Construct]]进行拦截，也就是apply陷阱函数对函数调用进行拦截，construct陷进函数对new操作进行拦截；
apply陷阱函数接受三个参数：trapTarget、thisArg(函数内部this)、arugmentsList函数参数列表
new陷阱函数接受二个参数：trapTarget、argumentsList
```js
let target = function(){return 42},
    proxy = new Proxy(target,{
        apply:function(trapTarget,thisArg,argumentList){
            return Reflect.apply(trapTarget,thisArg,argumentList)
        },
        construct:function(trapTarget,argumentList){
            return Reflect.construct(trapTarget,argumentList)
        }
    });

    console.log(typeof proxy);
    console.log(proxy());
    var instance = new proxy();
    console.log(instance instanceof target)
    console.log(instance instanceof proxy)

```

```js
function sum(...values){
    return values.reduce((pre,cur)=>pre+cur,0);
}

let sumProxy = new Proxy(sum,{
    apply(trapTarget,thisArg,argumentList){
        argumentList.forEach(arg=>{
            if(typeof arg !== "number"){
                throw new TypeError("all arguments must be number");
            }
        })
        return Reflect.apply(trapTarget,thisArg,argumentList);
    },
    construct(trapTarget,argumentList){
        throw new TypeError("this function can't be called with new");
    }
})

console.log(sumProxy(1,2,3,4));

console.log(sumProxy(1,"2"));

let result = new sumProxy();

```
反之，也可约束函数必须使用new，否则报错，并且传入参数全部为数字
```js
function sum(...values){
   this.values = values;
}

let sumProxy = new Proxy(sum,{
    apply(trapTarget,thisArg,argumentList){
         throw new TypeError("this function can't be called directly");
    },
    construct(trapTarget,argumentList){
       
        argumentList.forEach(arg=>{
            if(typeof arg !== "number"){
                throw new TypeError("all arguments must be number");
            }
        })
        return Reflect.construct(trapTarget,argumentList);
    }
})



let result = new sumProxy(1,2,3,4);
console.log(result);
console.log(result.values);
sumProxy(1,2,3,4)

```

使用new.target来约束一个函数必须使用new生成对象
```js
let numbers = function(...values){
    if(typeof new.target === "undefined"){
        throw new TypeError("the function must be called with new");
    }
    this.values = values
}

let instance = new numbers(1,2,3);
console.log(instance.values);
numbers(12,2)
```

使用apply陷阱函数代理规避已有new约束
```js
let numbers = function(...values){
    if(typeof new.target === "undefined"){
        throw new TypeError("the function must be called with new");
    }
    this.values = values
}

let numberProxy = new Proxy(numbers,{
    apply(trapTarget,thisArg,args){
        return Reflect.construct(trapTarget,args);
    }
})

let instance = numberProxy(1,2,3);
console.log(instance.values)


```

### 重写抽象类基础函数
Reflect.construct第三个参数用于给new.target赋值。
例如new.target不能是构造器自身
```js
class AbstractNumbers {
    constructor(...values){
        if(new.target === AbstractNumbers){
            throw new TypeError("this function must be inherited from")
        }
        this.values =values;
    }
}

class Numbers extends AbstractNumbers {

}
let instance = new Numbers(1,2,3);
console.log(instance.values)
new AbstractNumbers(12,3)
```

通过代理指定new.target绕过限制
```js
class AbstractNumbers {
    constructor(...values){
        if(new.target === AbstractNumbers){
            throw new TypeError("this function must be inherited from")
        }
        this.values =values;
    }
}

let AbstractNumbersProxy = new Proxy(AbstractNumbers,{
    construct(trapTarget,args){
        return Reflect.construct(trapTarget,args,function(){})
    }
})
let instance = new AbstractNumbersProxy(1,2,3);
console.log(instance.values)

```

### 可调用的类构造器
不能new触发构造器的construct，而是直接调用构造器触发call，利用代理apply拦截，并且在apply陷阱函数中返回新的对象。
```js
class Person{
    constructor(name){
        this.name = name;
    }
}

let PersonProxy = new Proxy(Person,{
    apply(trapTarget,thisArgs,args){
        return new trapTarget(...args);
    }
})

let me = PeronProxy("lvanboy")
console.log(me.name);
console.log(me instanceof PersonProxy);
console.log(me instanceof Person);

```


### 可撤销的代理
代理创建，绑定到目标对象上，就不能解绑;但当你撤销代理,使用Proxy.revocable方法,接受参数同Proxy构造器proxy,revoke函数;revoke函数被调用后,就不能对proxy对象进行更多的操作;任何与该代理对象交互的意图都会触发陷阱函数,从而抛出错误.

```js
let target = {
    name:"target"
};

let {proxy,revoke} = Proxy.revocable(target,{});

console.log(proxy.name);
revoke();
console.log(target.name);
console.log(proxy.name);

```

### 解决数组问题
检索数组索引
对于一个字符串属性p来说,当且仅当TOString(TOUnit32(p))等于p且TOUnit32(p)不等于2的32次方-1;它才能作为数组索引.
代码实现为:
```js
function toUnit32(value){
    return Math.floor(Math.abs(Number(value))) % Math.pow(2,32);
}
function isArrayIndex(key){
    let numbericKey = toUnit(key);
    return String(numbericKey) === key && numbericKey < (Math.pow(2,32)-1);
}

```
在新增元素时增加长度属性,即当一个大于length-1的数组索引被使用时,length属性需要增加,由set陷阱函数代理;
```js
function toUnit32(value){
    return Math.floor(Math.abs(Number(value))) % Math.pow(2,32);
}
function isArrayIndex(key){
    let numbericKey = toUnit32(key);
    return String(numbericKey) === key && numbericKey < (Math.pow(2,32)-1);
}

function createArray(length=0){
    return new Proxy({length},{
        set(trapTarget,key,value){
            let currentLength = Reflect.get(trapTarget,"length");
            if(isArrayIndex(key)){
                let numbericKey = Number(key);
                if(numbericKey >= currentLength){
                    Reflect.set(trapTarget,"length",numbericKey+1);
                }
            }
            return Reflect.set(trapTarget,key,value);
        }
    })
}

let colors = createArray(3);
console.log(colors.length);

colors[0] = "red";
colors[1] = "red1";
colors[2] = "red2";

colors[3] = "black";
console.log(colors.length);
console.log(colors[3])

```

在减少长度属性时移除元素,也就是在设置key为length时,对应的value到curlen-1对应的值都需要移除
```js
function toUnit32(value){
    return Math.floor(Math.abs(Number(value))) % Math.pow(2,32);
}
function isArrayIndex(key){
    let numbericKey = toUnit32(key);
    return String(numbericKey) === key && numbericKey < (Math.pow(2,32)-1);
}

function createArray(length=0){
    return new Proxy({length},{
        set(trapTarget,key,value){
            let currentLength = Reflect.get(trapTarget,"length");
            if(isArrayIndex(key)){
                let numbericKey = Number(key);
                if(numbericKey >= currentLength){
                    Reflect.set(trapTarget,"length",numbericKey+1);
                }
            }else if(key === "length"){
                if(value < currentLength){
                    for(let i = currentLength-1;i>=value;i--){
                        Reflect.deleteProperty(trapTarget,i);
                    }
                }
            }
            return Reflect.set(trapTarget,key,value);
        }
    })
}

let colors = createArray(3);
console.log(colors.length);
colors[1] = "red";
colors[0] = "green";
colors[2] = "blue";
colors[3] = "black";
console.log(colors.length);
colors.length = 2;
console.log(colors.length);

console.log(colors[3])
console.log(colors[2])
console.log(colors[1])
console.log(colors[0])

```

### 代理类
使用代理的类最简单的方式,创建一个类返回一个这个类的代理;
```js
class Thing{
    constructor(){
        return new Proxy(this,{})
    }
}

let thing = new Thing();
console.log(thing instanceof Thing);
```

创建一个代理类的自定义Array对象
```js
function toUnit32(value){
    return Math.floor(Math.abs(Number(value))) % Math.pow(2,32);
}
function isArrayIndex(key){
    let numbericKey = toUnit32(key);
    return String(numbericKey) === key && numbericKey < (Math.pow(2,32)-1);
}

class createArray{
    constructor(length = 0){
        this.length = length;
        return new Proxy(this,{
            set(trapTarget,key,value){
                let currentLength = Reflect.get(trapTarget,"length");
                if(isArrayIndex(key)){
                    let numbericKey = Number(key);
                    if(numbericKey >= currentLength){
                        Reflect.set(trapTarget,"length",numbericKey+1);
                    }
                }else if(key === "length"){
                    if(value < currentLength){
                        for(let i = currentLength-1;i>=value;i--){
                            Reflect.deleteProperty(trapTarget,i);
                        }
                    }
                }
                return Reflect.set(trapTarget,key,value);
            }
        })
    }
    
}

let colors =new createArray(3);
console.log(colors.length);
colors[1] = "red";
colors[0] = "green";
colors[2] = "blue";
colors[3] = "black";
console.log(colors.length);
colors.length = 2;
console.log(colors.length);

console.log(colors[3])
console.log(colors[2])
console.log(colors[1])
console.log(colors[0])

```

### 将代理对象作为原型使用
在把代理作为原型时,仅当操作的默认行为会按惯例追踪原型时,代理陷阱才会调用.这限制了代理对象作为原型的能力.
以下的代理函数永远不会执行.
```js
let target ={};
let newTarget =Object.create(new Proxy(target,{
    defineProperty(trapTarget,thisArgs,args){
        return false;
    }
}))

Object.defineProperty(newTarget,"name",{
    name:"lvanboy"
})

console.log(newTarget.name);
console.log(newTarget.hasOwnProperty("name"))


```
在读取属性的时候,会触发原型的属性查找.试图触发get陷阱函数代理
```js
let target ={};
let things =Object.create(new Proxy(target,{
    get(trapTarget,key,receiver){
        throw new ReferenceError(`${key} dones't exist`);
    }
}))

things.name = "thing";


console.log(things.name);

let res = things.unknown;

```


在原型上使用set陷阱函数
```js
let target ={};
let things =Object.create(new Proxy(target,{
    set(trapTarget,key,value,receiver){
        return Reflect.set(trapTarget,key,value,receiver)
    }
}))

console.log(things.hasOwnProperty("name"));

things.name = "things";

console.log(things.hasOwnProperty("name"));

//再次设置name将不在去原型上查找,则不会触发set陷阱函数
things.name = "none";

console.log(things.name)

```

在原型上使用has陷阱函数
```js
let target ={};
let things =Object.create(new Proxy(target,{
    has(trapTarget,key){
        console.log("proto")
        return Reflect.has(trapTarget,key)
    }
}))

console.log("name" in things); 

things.name = "has";

console.log("name" in things);

```


### 代理作为类的原型
类的prototype是可以写入的,通过继承,将构造器的原型写入子类;
```js
function NoSuchProperty(){

}

let proxy = new Proxy({
    height:100
},{
    get(trapTarget,key,receiver){
        if(!(key in trapTarget)){
            throw new Error(`${key} dones't exist`);
        }else{
           return Reflect.get(trapTarget,key,receiver);
        }
    }
})

NoSuchProperty.prototype = proxy;

class Square extends NoSuchProperty{
    constructor(length,width){
        super()
        this.length = length;
        this.width = width;
    }
}

let shape = new Square(10,20);
let area = shape.length * shape.width;
console.log(area);
let shapeProto = Object.getPrototypeOf(shape);
console.log(shapeProto === proxy)
let shapeUpProto = Object.getPrototypeOf(shapeProto);
console.log(shapeUpProto === proxy);
console.log(shape.height);

```

