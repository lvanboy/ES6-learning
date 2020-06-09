## 支持Unicode处理字符串方法

JS中的字符串使用固定16位的双字节编码方式称作：USC-2.

ES6为全面支持UTF-16新增的方法：codePointAt(pos),参数pos是需要转码的位置,并返回 Unicode 编码点值的非负整数。

```js
var text = "a";
console.log(text.charCodeAt(0));  //97
console.log(text.charCodeAt(1));  //NaN
console.log(text.charCodeAt(2));  //NaN

console.log(text.codePointAt(0)); //97
console.log(text.codePointAt(1)); //undefined
console.log(text.codePointAt(2)); //undefined

```

与之对应的相反操作String.fromCodePoint(),将给定的码点转化成单个字符
```js
console.log(String.fromCodePoint(32))

```
normalize(),指定了4种Unicode标准形式,
* Normalization	Form	Canonical	Composition	  ("NFC")，这是默认值；
* Normalization	Form	Canonical	Decomposition	("NFD")；
* Normalization	Form	Compatibility	Composition	("NFKC"	)；
* Normalization	Form	Compatibility	Decomposition	("NFKD")。

,在进行字符串比较时，将它们转化成同一种形式，如：
```js
const arr = ["hello","world","JS"]; 
const normalized = arr.map(str=>str.normalize()); //将字符串转化成标准形式，使用默认标准NFC
console.log(normalized);
normalized.sort((a,b)=>{   //升序排列字符串
    if(a<b){
        return -1;
    }else if(a == b){
        return 0;
    }else {
        return 1;
    }
})

```
normalize存在的意义，在于开发国际化应用。

正则表达式可以完成字符串很多的通用操作，ES6为正则表达式定义了用于处理Unicode的**u**的标志。


## 识别子字符串的方法
* includes()，给定子串，存在返回true，不存在返回false
* startsWith(str,index),给定子串，出现在字符串起始位置，返回true，否则返回false
* endsWith(str,len),给定子串，出现在字符串结束位置，返回true，否则返回false

```js
const msg = "Hello World!";
console.log(msg.startsWith("Hell"))
console.log(msg.endsWith("!"))
console.log(msg.includes(" Wor"));

console.log(msg.startsWith("hell"));
console.log(msg.endsWith("!!"));
console.log(msg.includes("jk"));

console.log(msg.startsWith("H",1));
console.log(msg.endsWith("!",11));
console.log(msg.includes("Hell",5))

```

## repeat方法
repeat(nums),nums字符串重复次数；
```js
console.log("x".repeat(0));//""
console.log(".".repeat(2.5)); //..
console.log("abc".repeat(3)); //abcabcabc
```
可用于创建缩进等特殊格式，不会造成阅读困难；
```js
let indent = " ".repeat(4);
let indentLevel = 1;
let code = "for(let i = 0;i<10;i++){"
code =indent + code ;
code = indent.repeat(++indentLevel) +"console.log(i)"
code = indent.repeat(--indentLevel) + "}";

```

## 正则表达式的y标志
y标志影响正则表达式搜索时的粘贴属性，它表示在字符串中检索匹配的字符时，应当从正则表达式的lastIndex属性值的位置开始，没有匹配成功则停止搜索。

```js
let text = "hello1 hello2 hello3",
pattern = /hello\d\s?/,
result = pattern.exec(text),
globalPattern = /hello\d\s?/g,
globalResult = globalPattern.exec(text),
stickyPattern = /hello\d\s?/y,
stickyResult = stickyPattern.exec(text);
console.log(result[0]);
console.log(globalResult[0]);
console.log(stickyResult[0])

pattern.lastIndex = 1;
globalPattern.lastIndex = 1;
stickyPattern.lastIndex = 1;
result = pattern.exec(text);
globalResult = globalPattern.exec(text);
stickyResult = stickyPattern.exec(text);
```

关于sticky标志，需要记住：
1. 只有调用正则对象上的exec或者test方法，lastIndex属性才会生效；
2. 若使用^字符来匹配字符串起始处，粘连的正则表达式只会匹配字符串的起始位置或者在多行模式(m)下匹配首行

通过正则对象的sticky属性判断y标志是否存在
```js
let pattern = /hello\d/y;
console.log(pattern.sticky)

```

## 复制正则表达式
```js
let reg = /ab/i;
let reg1 = new RegExp(reg,"g"); // es5报错，es6可用
console.log(reg.toString()) //  /ab/i
console.log(reg1.toString()) // /ab/g
console.log(reg.test("ab"));//true
console.log(reg1.test("ab"));//true
console.log(reg.test("AB"));//true
console.log(reg1.test("AB"));//false

```

## 获取正则的标志
在ES5中，一般是通过toString+substring的方式；
```js
function getFlags(re){
    let text = re.toString();
    return text.substring(text.lastIndexOf("/") + 1,text.length);
}
let re = /ab/ig
getFlags(re);

```
而在ES6中，则通过flags属性；
```js
let re = /ab/ig;
console.log(re.flags);
console.log(re.source);

```

## 模板字符串
ES6模板字符串是对JS以下功能的补充：
1. 多行字符串
2. 基本的字符串格式化：使用已有变量对字符串进行替换
3. HTML转移

HTML转移
```js
let msg = `\`Hello\n;`;
console.log(msg);
console.log(typeof msg);
console.log(msg.length);

```

ES5中如果希望换行，通过\,并且反斜杠后不能有任何字符
```js
var msg = "multiline \
    string";
console.log(msg);
console.log(msg.length)

```
或者数组的形式
```js
var msg = ["multiline","string"].join("\n");
console.log(msg)

```
ES6支持的多行
```js
let msg = `multiline
        string
`
console.log(msg);
console.log(msg.length)
```

为了美观性，一般都会保证HTML格式的整齐，这样模板字符串中所有的空格都会保留下来，其中包括一些不预期的，如；
```js
let html = `
    <div>
        <h1>xxx</h1>
    </div>
`.trim(); //去掉换行产生多余的一行
console.log(html)
```

替换已有变量
```js
let name = "lvanboy",msg = `Hello ${name}`;
console.log(msg);
```
当然也可以是JS的表达式
```js
let count = 10,
    price = 0.25,
    msg = `${count} items cost $${(count * price).toFixed(2)}.`;
console.log(msg)

```
当然也可以嵌套
```js
let name = "lvanboy",day = "01",
    msg = `Hello,${
        `my name is ${name}`
    },${day}`;
console.log(msg)
```

## 标签化模板
通过标签化模板，模拟模板字符串的默认行为,literals是被解析变量所分割的原始字符，substitutions为JS变量或者表达式
```js
function passthru(literals,...substitutions){
    let result = "";
    for(let i = 0;i<substitutions.length;i++){
        result+=literals[i];
        result+=substitutions[i];
    }
    result+=literals[literals.length-1]
    return result;
}

let count = 10,
    price = 0.25,
    msg = passthru`${count} items cost $${(count * price).toFixed(2)}`;

```

在模板字符串中可获取未经过解析的原始字符串
```js
let msg = String.raw`Hi\n${2+3}!`;
let msg1 = String.raw `Hi\u000A!`; 
console.log(msg);
console.log(msg1);
```
通过标签化模板模拟String.raw，通过将literals.raw获取未被转移的字符
```js
function raw(literals,...substitutions){
    let result = "";
    for(let i = 0;i<substitutions.length;i++){
        result+=literals.raw[i];
        result+=substitutions[i];
    }
    result+=literals[literals.length-1]
    return result;
}

let msg = raw`Hi\n${2+3}!`;
console.log(msg);

```



