Promise是异步编程的另一种选择，工作方式类似于其他语言中进行延迟并在将来执行作业。

### 事件模型
当用户按下一个按钮，onclick就触发了；该事件可能会对此进行响应，从而将一个新的作业添加到作业队列的尾部。
事件处理程序直到事件发生才会被执行，此时它会拥有合适的上下文；
```js
let button = document.getElementById("my-btn");
button.onclick = function(event){
    console.log("Clicked");
}

```

### 回调模式
在Node.js被创建后，它通过普及回调函数编程模式提升了异步编程模型；异步代码会在未来的某个时候执行，所以提前将函数作为参数传入；
```js
readFile("exampele.txt",function(err,contents){
    if(err){
        throw err;
    }
    console.log(contents)
})
console.log('hi')

```
这是Node中常见的错误优先(error-first)的回调函数风格。使用回调函数模式，readFile会立刻开始执行，并在开始读取磁盘时暂停；这意味着'hi'被先打印；当readFile结束操作后，它会将回调函数以及相关参数作为一个新的作业加入作业队列的尾部。在之前的作业都结束，该作业才会执行。过深的回调函数嵌套，也将导致代码可读性下降，调试困难。

### Promise
Promise是为异步操作的结果所准备的占位符。函数可以返回一个Promise，而不必订阅一个事件或者向函数传递回调参数；

Promise生命周期
1. pending state (异步操作未结束)
一旦异步操作结束，并进入两种状态中的一种
2. fulfilled(Promise的异步操作成功)
3. rejected(Promise的异步操作未成功结束)
内部的[[PromiseState]] 属性被设置为"pending"、"fulfilled"、"rejected";该属性无法读取，但可通过then方法在状态改变时，做出特定操作。then方法接受两个参数，第一个是Promise完成时调用的函数，第二个参数是Promise被拒绝时调用的参数。
新的Promise使用Promise构造器来创建，构造器接受一个被称为执行器的函数，该执行会被传递两个名为resolve和reject的函数作为参数。resolve函数在执行器成功结束时调用，执行器失败后reject函数应被调用。resolve和reject在执行器内部被调用时，一个作业被添加到作业队列中。
```js
let promise = new Promise(function(resolve,reject){
    readFile("exampele.txt",function(err,contents){
        if(err){
            reject(err);
        }
        resolve(contents)
    })
})
promise.then(function(contents){

},function(err){

})

promise.then(function(content){})


promise.then(null,function(err){})


```

Promise也具有catch方法，其行为等同于只传递拒绝处理函数给then
```js
promise.catch(function(err){

})
//等价于
promise.then(null,function(err){})

```

then和catch的意图是组合使用它们来正确处理异步操作的结果；事件模型倾向于出错时不被触发，回调函数始终记得检查错误参数；Promise中，若未提供拒绝处理函数，所有的错误就会静默发生；建议始终附加一个拒绝处理函数。

setTimeout也是同样的道理，在一定延迟后作业才会添加到队列。
```js
setTimeout(function(){
    console.log("timeOut")
},0);
console.log("hi");

```
Promise中的执行器会立刻执行，早于后续的任何代码；
```js
let promise = new Promise(function(resolve,reject){
    console.log("Promise")
    resolve()
})
console.log("hi")

```

调用resolve触发异步操作；传递给then和catch的函数会被异步执行，并且是加入到作业队列后再执行；
```js
let promise = new Promise(function(resolve,reject){
    console.log("Promise");
    resolve()
})

console.log("hi");
promise.then(function(){
    console.log("Resolved")
})

```

### 创建已处理的Promise
创建特定值得Promise,Promise.resolve方法接受一个值，并返回完成状态，这意味着没有任何得作业调度发生，并且需要向Promise添加一个或者多个处理函数来提取参数。
```js
let promise = Promise.resolve(42);
promise.then(function(value){
    console.log(value);
})

```
同理使用Promise.reject可接受一个值，返回拒绝状态；
```js
let promise = Promise.reject(100);
promise.catch(function(value){
    console.log(value)
})

```


Promise.resolve和Promise.reject都能接受非Prommise的thenable作为参数。当一个对象拥有一个能接受resolve和reject的then方法时，该对象就被视为非Promise的thenable
```js
let thenable = {
    then:function(resolve,reject){
        resolve(42)
    }
}
let p1 = Promise.resolve(thenable)
p1.then(function(value){
  console.log(value)
})

```
```js
let thenable = {
    then:function(resolve,reject){
        reject(110)
    }
}
let p1 = Promise.resolve(thenable);
p1.catch(function(value){
    console.log(value)
})

```

在ES6之前，很多库都使用了thenable，因此将thenable转化为正规的Promise就很重要了，能对已存在的库向下兼容。
当你不确定一个对象是否为Promise时，将该对象传给Promise.resolve。

### 执行器错误
如果在执行器内部抛出错误，那么Promise的拒绝处理函数就会被调用。
```js
let promise = new Promise(function(resolve,reject){
    throw new Error("Explosion");
})
promise.catch(function(error){
    console.log(error.toString());
})

```
在每个执行器中存在隐式的try-catch，发生错误将被捕获，传递给拒绝处理函数，下面是等价写法
```js
let promise = new Promise(function(resolve,reject){
    try{
        throw new Error("Explosion");
    }catch(err){
        reject(err);
    }
})
promise.catch(function(error){
    console.log(error.message);
})

```

全局的Promise拒绝处理函数
Promise最具争议的方面之一是：当一个promise被拒绝时，缺少拒绝处理函数，就会静默失败。无论Promise是否被解决，你都可以在任何时候调用then和catch使其正确工作。
```js
let rejected = Promise.reject(42);
rejected.catch(function(value){
    console.log(value);
})

```

### Node.js的拒绝处理

process对象存在两个关联到Promise的拒绝处理的事件：
1. unhandledRejection  当Promise被拒绝，而在事件循环的一个轮次中没有任何拒绝处理函数被调用，就会触发
2. rejectionHandled  当Promise被拒绝，而在事件循环的一个轮次之后有拒绝处理函数被调用，该事件就会触发

这两个事件主要为了帮助识别已拒绝但未处理的promise
```js
let rejected;
process.on("unhandledRejection",function(reason,promise){
    console.log(reason.message);
    console.log(rejected == promise);
})

rejected = Promise.reject(new Error("Explosion"));

```

```js
let rejected;
process.on("rejectionHandled",function(promise){
    console.log(rejected === promsie);
})

reject = Promise.reject(new Error("Explision"));

setTimeout(function(){
    rejected.catch(function(value){
        console.log(value.message)
    })
})

```
此处的rejectionHandled事件在拒绝处理函数延迟调用前被调用时触发。为了正确追踪潜在的未被处理的拒绝，建立一个map存贮，key存放已失败的promise，value存放promise失败的原因。
```js
let possiblyUnhandledRjections = new Map();

process.on("unhandledRejection",function(reason,promise){
    possiblyUnhandledRjections.set(promise,reson);
})

process.on("rejectionHandled",function(promise){
    possiblyUnhandledRjections.delete(promise);
})

setInterval(function(){
    possiblyUnhandledRjections.forEach(function(reason,promise){
        console.log(reason.message?reason.mesage:reason);
        //这里可做额外的处理
    })
    possiblyUnhandledRjections.clear();
},60000)

```

### 浏览器的拒绝处理
浏览器同样能触发两个事件，帮助识别未处理的拒绝。这两个事件会被window 触发。
1. unhandledRejection 
2. rejectionHanlded
浏览器的事件处理函数会接受到一个事件对象，包含type、promise、reason
```js
let rejected ;
window.onunhandledRejection(function(event){
    console.log(event.type);
    console.log(event.promise);
    console.log(event.reason.message);
})

window.onrejectionhandled = function(event){
    console.log(event.type);
    console.log(event.promise);
    console.log(event.reason.message);
}

rejected = new Promise(new Error("Explosion"));

```
同理在浏览器也能实现类似Node追踪未处理的拒绝

### 串联Promise
每次then或者catch的调用实际返回了一个新的promise，仅当前面的promise生命周期结束后，后一个promise才能被处理。
```js
let p1 = new Promise(function(resolve,reject){
    resolve(42);
})
p1.then(function(value){
    console.log(value);
}).then(function(){
    console.log("finished");
})

```
等价于
```js
let p1 = new Promise(function(resolve,reject){
    resolve(41);
})

let p2 = p1.then(function(value){
    console.log(value)
})

p2.then(function(){
    console.log("finished");
})

```

Promise链允许捕获前一个Promise的完成或者拒绝处理函数发生的错误

```js
let p = new Promise(function(resolve,reject){
    throw new Error("Explosion");
})
p.catch(function(error){
    console.log(error.message);
    throw new Error("Boom");
}).catch(function(error){
    console.log(error.message);
})
```

Promise链返回值
Promise链的重要特性就是能从当前Promise传递数据给下一个Promise。
```js
let p = new Promise(function(resolve,reject){
    reject(11);
})
p.catch(function(value){
    console.log(value);
    return value+1;
}).then(function(value){
    console.log(value);
})

```


```js
let p = new Promise(function(resolve,reject){
    resolve(12);
})

p.then(function(value){
    console.log(value);
    return value + 1;
}).then(function(value){
    console.log(value);
})

```

Promise链返回Promise
```js
let p1 = new Promise(function(reslove,reject){
    reslove(2);
})
let p2 = new Promise(function(resolve,reject){
    resolve(1);
})

p1.then(function(value){
    console.log(value);
    return p2;
}).then(function(value){
    console.log(value);
})

```

```js
let p1 = new Promise(function(reslove,reject){
    reslove(2);
})
let p2 = new Promise(function(resolve,reject){
    reject(1);
})

p1.then(function(value){
    console.log(value);
    return p2;
}).then(function(value){
    console.log(value);
})
```

p2被拒绝，第二个完成处理函数永远不会被拒绝。将其改为拒绝处理函数即可正常运行。
返回的thenable只能让你在promise结果之外定义附加响应，你能在完成处理函数中创建一个新的promise，来推迟完成函数的执行。
```js
let p = new Promise(function(resolve,reject){
    resolve(12);
})

p.then(function(value){
    console.log(value);
    let p2 = new Promise(function(reslove,rejecct){
        reslove(13);
    })
    return p2;
}).then(function(value){
    console.log(value);
})
```

以上每个例子每个时刻只能响应一个Promise，如果需要监视多个Promise进程，ES6的Promise提供了Promise.all、Promise.race.


Promise.all接受单个可迭代对象作为参数，并返回一个Promise。可迭代对象的元素都是Promise，只有所有的promise都完成后才能返回。

```js
let p1 = new Promise(function(resolve,reject){
    resolve(12);
})
let p2 = new Promise(function(resolve,reject){
    resolve(100);
})
let p3 = new Promise(function(resolve,reject){
    resolve(120);
})

let p4 = Promise.all([p1,p2,p3]);
p4.then(function(value){
    console.log(Array.isArray(value));
    console.log(value[0]);
    console.log(value[1]);
    console.log(value[2]);
})

```

若Promise.all任意promise被拒绝了，那么方法返回的Promise就会立刻被拒绝，不必等待其他Promise结束。
```js
let p1 = new Promise(function(resolve,reject){
    resolve(12);
})
let p2 = new Promise(function(resolve,reject){
    reject(100);
})
let p3 = new Promise(function(resolve,reject){
    resolve(120);
})

let p4 = Promise.all([p1,p2,p3]);
p4.catch(function(value){
    console.log(Array.isArray(value));
    console.log(value);
})

```

Promise.race提供可迭代对象，返回一个新的Promise；返回优先完成的那个promise；
```js
let p1 = Promise.resolve(42);
let p2 = new Promise(function(resolve,reject){
    resolve(100);
})
let p3 = new Promise(function(resolve,reject){
    resolve(120);
})

let p4 = Promise.race([p1,p2,p3])
p4.then(function(value){
    console.log(value);
})


```
```js

let p1 = new Promise(function(resolve,reject){
    setTimeout(()=> resolve(100),0)
   
})
let p2 = Promise.reject(42);
let p3 = new Promise(function(resolve,reject){
    setTimeout(()=> resolve(120),0)
})

let p4 = Promise.race([p1,p2,p3])
p4.catch(function(value){
    console.log(value);
})

```


### 继承Promise
正如其他内置类型，Promise可作为其他派生类的基类。在内置Promise的基础上扩展功能。
```js
class ProExt extends Promise{
    success(reslove,reject){
        return this.then(reslove,reject);
    }
    failure(reject){
        return this.catch(reject);
    }
}

let promise = new ProExt(function(resolve,reject){
    resolve(42)
})
promise.success(function(value){
    console.log(value);
}).failure(function(value){
    console.log(value);
})

```

自定义ProExt身上的静态方法resolve和reject需要传递内置Promise，这样才能被完成或者拒绝。这是因为这两个方法都使用了Symbol.species来决定需要返回的Promise类型。
```js
class ProExt extends Promise{
    success(reslove,reject){
        return this.then(reslove,reject);
    }
    failure(reject){
        return this.catch(reject);
    }
}
let p1 = new Promise(function(resolve,reject){
    resolve(12);
})
let p2 = ProExt.resolve(p1);
p2.success(function(value){
    console.log(value);
})
console.log(p2 instanceof ProExt);

```

### 异步任务运行Promise(难理解)
```js
let fs = require("fs");
function run(taskDef){
    let task = taskDef();
    let result = task.next();
    (function step(){
        if(!result.done){
            let promise = Promise.resolve(result.value);
            promise.then(function(value){
                result = task.next();
                step();
            }).catch(function(error){
                result = task.throw(error);
                step();
            })
        }
    }())
}

function readFile(filename){
    return new Promise(function(resolve,reject){
        fs.readFile(filename,function(err,content){
            if(err){
                reject(err);
            }
            resolve(content);
        })
    })
}

run(function *(){
    let contents = yield readFile("Class.md");
    console.log("done");
})

```