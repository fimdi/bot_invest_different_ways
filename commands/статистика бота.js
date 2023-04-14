const utils = require('../utils.js');

const botStatistics = (context, users, data) =>
{
    const replenished = Object.keys(users).reduce((sum, current) => sum + users[current].replenished, 0);
    const withdrawn = Object.keys(users).reduce((sum, current) => sum + users[current].withdrawn, 0);
    const invested = Object.keys(users).reduce((sum, current) => sum + users[current].invested, 0);
    
    context.send(
`💻Статистика бота:

👨Пользователей: ${Object.keys(users).length}
👥Новых за сегодня: ${data.statistics.newUsers}
    
📥Пополнено: ${ utils.rounding(replenished) } ₽
📤Выведено: ${ utils.rounding(withdrawn) } ₽
🏦Инвестировано: ${ utils.rounding(invested) } ₽
    
🕙Мы работаем: ${data.statistics.weWork} ${ utils.lineEnding(data.statistics.weWork, ["день", "дня", "дней"]) }`);
}

module.exports = botStatistics;