const utils = require('../utils.js');

module.exports = async (context, data, pool) =>
{
    const [[res]] = await pool.query(`SELECT COUNT(*) AS users, SUM(replenished) AS replenished, SUM(withdrawn) AS withdrawn, SUM(invested) AS invested FROM users`);
    
    context.send(
`💻Статистика бота:

👨Пользователей: ${res.users}
👥Новых за сегодня: ${data.statistics.newUsers}
    
📥Пополнено: ${utils.rounding(res.replenished)} ₽
📤Выведено: ${utils.rounding(res.withdrawn)} ₽
🏦Инвестировано: ${utils.rounding(res.invested)} ₽
    
🕙Мы работаем: ${data.statistics.weWork} ${utils.lineEnding(data.statistics.weWork, ["день", "дня", "дней"])}`);
}