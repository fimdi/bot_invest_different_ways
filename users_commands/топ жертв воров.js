const utils = require('../utils.js');

module.exports = async (context, pool) =>
{
    let top = await utils.getTop("stolenFromUser", "обворовали на", pool);

    context.send(`Ночью надо спать.\n\n${top.join('\n')}`);
}