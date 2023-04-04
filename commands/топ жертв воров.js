const utils = require('../utils.js');

const victimsThieves = (context, users) =>
{
    let top = utils.getTop(users, "stolenFromUser", "обворовали на");

    context.send(`Ночью надо спать.\n\n${ top.join('\n') }`);
}

module.exports = victimsThieves;