const utils = require('../utils.js');

const topThieves = async (context, pool) =>
{
    let top = await utils.getTop("stolenByUser", "украл", pool);

    context.send(`Отомстите им!\n\n${ top.join('\n') }`);
}

module.exports = topThieves;