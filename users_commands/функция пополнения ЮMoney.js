const config = require('../config.json');
const applicationStorageTime = 900000;

module.exports = (context, replenishmentIsExpected) =>
{
    if ( context.senderId in replenishmentIsExpected )
    {
        clearTimeout(replenishmentIsExpected[context.senderId].timerId);
    }

    let timerId = setTimeout(() =>
    {
        delete replenishmentIsExpected[context.senderId];
    }, applicationStorageTime);
    replenishmentIsExpected[context.senderId] = { amount: +context.text, date: Date.now(), timerId };

    context.send(`✉Заявка на пополнение.

⏰Действует 15 минут.

💰Сумма: ${context.text} ₽
    
❗Переводить ТОЧНУЮ сумму по номеру (ЮMoney):
${config.number_yoomoney}
    
🔩Деньги должны зачислиться автоматически.
В случае проблем обращайтесь к админу.`);
}