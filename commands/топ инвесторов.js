const utils = require('../utils.js');

const topInvestors = (context, users) =>
{
    let top = utils.getTop(users, "invested", "инвестировал");

    context.send(`Финансово грамотные.\n\n${ top.join('\n') }`);
}

module.exports = topInvestors;