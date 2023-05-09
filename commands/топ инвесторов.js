const utils = require('../utils.js');

const topInvestors = async (context, pool) =>
{
    let top = await utils.getTop("invested", "инвестировал", pool);

    context.send(`Финансово грамотные.\n\n${ top.join('\n') }`);
}

module.exports = topInvestors;