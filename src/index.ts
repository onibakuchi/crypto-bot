const timeout = (sec) => {
    return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    })
}

const run = (func, sec) => {
    func()
    const promise = new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    });
    promise.then(()=>run(func,sec))
}
