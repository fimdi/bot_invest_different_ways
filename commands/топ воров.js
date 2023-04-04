const utils = require('../utils.js');

const topThieves = (context, users) =>
{
    let top = utils.getTop(users, "stolenByUser", "украл");

    context.send(`Отомстите им!\n\n${ top.join('\n') }`);
}

module.exports = topThieves;