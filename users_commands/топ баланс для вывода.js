const utils = require('../utils.js');

const topBalance = async (context, pool) =>
{
    let top = await utils.getTop("balanceForWithdrawal", "баланс", pool);

    context.send(`Почему ещё не вывели?\n\n${ top.join('\n') }`);
}

module.exports = topBalance;