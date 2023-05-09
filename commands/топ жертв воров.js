const utils = require('../utils.js');

const victimsThieves = async (context, pool) =>
{
    let top = await utils.getTop("stolenFromUser", "обворовали на", pool);

    context.send(`Ночью надо спать.\n\n${ top.join('\n') }`);
}

module.exports = victimsThieves;