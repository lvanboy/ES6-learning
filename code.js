function* quips(name) {
    console.log("test");
    yield `你好${name}!`;
    if (name.startsWith("X")) {
        yield `你的名字${name}首字母是X，这很COOL`;
    }
    yield `我们下次再见`;
}

function test1() {
    var iter = quips("X-lvanboy");
    console.log(iter);
    console.log(iter.next());
    console.log(iter.next());
    console.log(iter.next());
    console.log(iter.next());
}


class RangeIterator {
    constructor(start, stop) {
        this.value = start;
        this.stop = stop;
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        var value = this.value;
        if (value < this.stop) {
            this.value++;
            return { done: false, value }
        } else {
            return { done: true, value: undefined }
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

// test2();

function* range(start, stop) {
    for (var i = start; i < stop; i++) {
        yield i;
    }
}



function test3() {
    for (var value of range(0, 3)) {
        console.log(value)
    }
}
test3();