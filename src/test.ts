const orders = new Map();

const ord ={
    name:'hoge',
    size:2
}
console.log(ord);
orders.set('hoge', ord)

const ord2 = orders.get('hoge');
console.log('--');
console.log(ord2);

ord2['size'] = 26;
console.log(ord2);
console.log('--');

const ord3 = orders.get('hoge');
console.log(ord3);