const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");

client.on("error", function (error) {
  console.error(error);
});

const hmsetAsync = promisify(client.hmset).bind(client);
const zaddAsync = promisify(client.zadd).bind(client);
const saddAsync = promisify(client.sadd).bind(client);

Promise.all([
  hmsetAsync('item:1', 'name', 'iphone', 'price', '1000'),
  hmsetAsync('item:2', 'name', 'macbook', 'price', '2000'),
  hmsetAsync('item:3', 'name', 'ipad', 'price', '1500'),

  hmsetAsync('user:1', 'name', 'Pavlo', 'surname', 'Berezin', 'username', 'berezin'),
  hmsetAsync('user:2', 'name', 'Petro', 'surname', 'Budyak', 'username', 'budyak'),
  hmsetAsync('user:3', 'name', 'Oleh', 'surname', 'Petros', 'username', 'petros'),

  zaddAsync('cart:items:1', 3, 'item:1'),
  zaddAsync('cart:items:2', 1, 'item:1', 1, 'item:2'),
  zaddAsync('cart:items:3', 3, 'item:1', 2, 'item:3'),
  zaddAsync('cart:items:4', 1, 'item:1', 2, 'item:2'),

  hmsetAsync('cart:1', 'user', 'user:1', 'items', 'cart:items:1', 'total', '3000', 'status', 'In Progress'),
  hmsetAsync('cart:2', 'user', 'user:2', 'items', 'cart:items:2', 'total', '3000', 'status', 'Waiting for payment'),
  hmsetAsync('cart:3', 'user', 'user:3', 'items', 'cart:items:3', 'total', '6000', 'status', 'Paid'),
  hmsetAsync('cart:4', 'user', 'user:1', 'items', 'cart:items:4', 'total', '5000', 'status', 'Paid'),

  saddAsync('cart:status:in_progress', 'cart:1'),
  saddAsync('cart:status:waiting', 'cart:2'),
  saddAsync('cart:status:paid', 'cart:3', 'cart:4'),

  saddAsync('cart:user:1', 'cart:1', 'cart:4'),
  saddAsync('cart:user:2', 'cart:2'),
  saddAsync('cart:user:3', 'cart:3'),

]).then(() => {
  console.log('setup end');
  process.exit(0);
})
