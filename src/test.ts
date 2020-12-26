(async () => {

    // const timer = setInterval(() => console.log('hoge'), 5000);
    // timer.refresh();
    // timer.refresh();

    class User {
        name = 'namea';
        order(name, status) {
            const hoge = {
                ho: name,
                status: status
            }
            console.log('hoge :>> ', hoge);
            return hoge
        }
        say() {
            const h = this.order.bind(null, 'tarou');
            h('op');
        }
    }
    const instance = new User();
    instance.say();
    

    // setInterval(() => timer.refresh(), 500);
    // https://www.freeforexapi.com/api/live?pairs=USDJPY
    // http://www.gaitameonline.com/rateaj/getrate


})()
