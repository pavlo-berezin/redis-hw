const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");

const hgetAllAsync = promisify(client.hgetall).bind(client);
const zrangeAsync = promisify(client.zrange).bind(client);
const smembersAsync = promisify(client.smembers).bind(client);
const sinterAsync = promisify(client.sinter).bind(client);

const statusListNames = {
  'In Progress': 'cart:status:in_progress',
  'Waiting for payment': 'cart:status:waiting',
  'Paid': 'cart:status:paid',
  'Canceled': 'cart:status:canceled'
};

client.on("error", function (error) {
  console.error(error);
});

async function getCartItems(id) {
  const items = await zrangeAsync(id, 0, -1, 'WITHSCORES');
  const result = [];

  for (let i = 0; i < items.length; i += 2) {
    let item = await hgetAllAsync(items[i]);
    let count = items[i + 1];

    result.push({ item, count });
  }

  return result;
}

// Замовлення по Id
async function getById(id) {
  const cartItem = await hgetAllAsync(`cart:${id}`);

  return {
    ...cartItem,
    user: await hgetAllAsync(cartItem.user),
    items: await getCartItems(cartItem.items),
  }
}

// Всі ідентифікатори замовлення статус яких Waiting for payment
async function getByStatus(status) {
  return smembersAsync(statusListNames[status]);
}

// Всі ідентифікатори замовлення певного замовника
async function getByUser(userId) {
  return smembersAsync(`cart:user:${userId}`);
}

// Всі ідентифікатори замовлення певного замовника з можливістю вказати статус для пошуку
async function getByUserAndStatus(userId, status) {
  return sinterAsync(`cart:user:${userId}`, statusListNames[status]);
}

(async () => {
  console.log('Cart by id:', await getById(1));
  console.log('Waiting for payment:', await getByStatus('Waiting for payment'));
  console.log('Cart ids by user:', await getByUser(1));
  console.log('Cart ids by user and status:', await getByUserAndStatus(1, 'Paid'));
  process.exit()
})();