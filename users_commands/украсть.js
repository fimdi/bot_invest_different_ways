const utils = require('../utils.js');

module.exports = (context, user) => 
{
    let attemptsSteal = user.attemptsSteal;

    context.send(
`🎯Сегодня вы можете украсть: ${attemptsSteal} ${utils.lineEnding(attemptsSteal, ["раз", "раза", "раз"])}
        
📟Отправьте id/ссылку человека, у которого хотите украсть.
        
Вы можете украсть не больше 10% от своей инвестиции (${utils.rounding(user.invested * 0.1)} ₽). Также 50% сгорает.`);
}