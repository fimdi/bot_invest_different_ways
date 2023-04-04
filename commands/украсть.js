const utils = require('../utils.js');

const steal = (context, users) => {
    let attemptsSteal = users[context.senderId].attemptsSteal;

    context.send(
`🎯Сегодня вы можете украсть: ${attemptsSteal} ${ utils.lineEnding(attemptsSteal, ["раз", "раза", "раз"]) }
        
📟Отправьте id человека, у которого хотите украсть.
        
Вы можете украсть не больше 10% от своей инвестиции (${users[context.senderId].invested * 0.1} ₽)`);
}

module.exports = steal;