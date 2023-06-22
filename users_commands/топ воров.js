const utils = require('../utils.js');

module.exports = async (context, pool) =>
{
    let top = await utils.getTop("stolenByUser", "украл", pool);

    context.send(`Отомстите им!\n\n${top.join('\n')}`);
}