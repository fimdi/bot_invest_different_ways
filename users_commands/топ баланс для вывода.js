const utils = require('../utils.js');

module.exports = async (context, pool) =>
{
    let top = await utils.getTop("balanceForWithdrawal", "баланс", pool);

    context.send(`Почему ещё не вывели?\n\n${top.join('\n')}`);
}