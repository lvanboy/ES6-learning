### 解构的由来
```js
let options = {
    repeat :true,
    save:false
}
let repeat = options.repeat,
    save = options.save;

```
该代码提取对象中的属性到本地变量中，如果大量数据需提取，逐个赋值的写法则太繁琐；ES6中引入解构解决了这个问题。


### 对象结构
```js
let  node = {
    type:"Identitier",
    name:"lvanboy"
}
let {type,name } = node;
console.log(type,name)
```

### 解构赋值

```js
let node = {
    type:"Identitier",
    name:"lvanboy"
},type = "a",name:"b";

({type,name} = node);
console.log(type,name);

```
**注意：这里必须使用小括号包裹花括号，因为花括号不允许直接出现在赋值号的左边，这里的花括号表示解构**

解构赋值表达式的值为表达式的右侧。

```js
let node = {
    type:"Identitier",
    name:"lvanboy"
},type = "a",name = "b";

function outputInfo(value){
    console.log(value === node)
}

outputInfo({type,name} = node);
console.log(type,name);

```

当解构表达式的右边计算结果为null或者undefined时，会抛出错误；当使用解构赋值语句时，所指定的本地变量在对象中没有找到同名属性，那么该变量会被赋值undefined,为了避免出现undefind情况，可初始化变量。
```js
let node = {
    type:"Identitier",
    name:"lvanboy"
}
let {type,name,value = true} = node;
console.log(type,name,value);

```

解构赋值的别名写法,变量别名也可以添加默认值
```js
let node = {
    type:"Identitier",
    name:"lvanboy"
}
let {type:localType,name:localName = "default"} = node;
console.log(localType,localName);

```

### 嵌套对象的解构
```js
let node = {
    type:"Identifier",
    name:"foo",
    loc:{
        start:{
            line:1,
            column:1
        },
        end:{
            line:1,
            column:4
        }
    }
}
let {loc:{start}} = node;
let {loc:{end:endAlias}} = node;
console.log(start.line,start.column);
console.log(endAlias.line,endAlias.column);
```


### 数组解构
对象解构作用在对象的属性名上，数组的解构作用在数组内部的位置上
```js
let colors = ["red","green","blue"];
let [firstColor,secondColor] = colors;
console.log(firstColor,secondColor);

```

解构模式中忽略一些项,使用逗号作为占位符
```js
let colors = ["red","green","blue"];
let [,,thirdColor] = colors;
console.log(thirdColor)

```

解构赋值
```js
let colors =  ["red","green","blue"],
firstColor = "black",
secondColor = "purple";

[firstColor,secondColor] = colors;
console.log(firstColor,secondColor);

```

变量交换
```js
let a = 1,b =2 ;
[a,b] = [b,a];
console.log(a,b)
```

解构默认值
```js
let colors = ["red"];
let [firstColor,secondColor = "green"] = colors;
console.log(firstColor,secondColor);
```

嵌套解构
```js
let colors = ["red",["green","lightGreen"],"blue"];
let [firstColor,[secondColor]] = colors;
console.log(firstColor,secondColor);
```

剩余项
```js
let colors = ["red","blue","green"];
let [firstColor,...restColor] = colors;
console.log(firstColor,restColor.length,restColor);
```

克隆
ES5
```js
var colors = ["red","blue","green"];
var cloneColors = colors.concat();
cloneColors[0] = "black";
console.log(colors,cloneColors)
```
ES6
```js
let colors = ["red","blue","green"];
let [...cloneColors] = colors;
cloneColors[0] = "black";
console.log(colors,cloneColors)
```

### 混合解构
```js
let node = {
    type:"Identifier",
    name:"lvanboy",
    loc:{
        start:{
            line:1,
            column:1
        },
        end:{
            line:2,
            column:2
        }
    },
    range:[0,4]
}

let {loc:{start},range:[startIndex]} = node;
console.log(start.line,start.column,startIndex);
```

参数解构
参数解构是必填项，否则报错，但可以提供默认值，使之兼容。
```js
function setCookie(name,value,{secure,path,domain,expires} = {}){
    console.log(secure,path,domain,expires);
}
setCookie("type","js",{
    secure:true,
    expires:60000
})

```
解构参数项本身也可以拥有默认值
```js
function setCookie(name,value,{secure = true,path = "/",domain="example",expires = 6000} = {}){
    console.log(secure,path,domain,expires);
}
setCookie("type","js")


```


