const utils = require('../utils.js');

const topBalance = (context, users) =>
{
    let top = utils.getTop(users, "balanceForWithdrawal", "баланс");

    context.send(`Почему ещё не вывели?\n\n${ top.join('\n') }`);
}

module.exports = topBalance;