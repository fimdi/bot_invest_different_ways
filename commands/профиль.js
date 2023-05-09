const utils = require('../utils.js');
const { Keyboard } = require('vk-io');

const profile = async (context, user, pool) => {
    let investmentMethod = "Отсутствует";
    
    if (user.investmentMethodId != null) 
    {
        let [[res]] = await pool.query('SELECT * FROM usersInvestmentMethods WHERE id = ?', [user.investmentMethodId]);
        investmentMethod = `№ ${res.number}
${res.incomeDayPercentage >= 0 ? "Доход" : "Расход"} в день: ${Math.abs(res.incomeDayPercentage)} %
Налог в день: ${res.taxDayRubles} ₽
Срок ${res.term} ${ utils.lineEnding(res.term, ["день", "дня", "дней"]) }
        
Осталось дней: ${res.daysLeft}`;
    }
    let id = context.senderId;
    
    context.send(
`🖥ПРОФИЛЬ
ID: ${id}
        
💰БАЛАНС
Для вывода: ${ utils.prettify(user.balanceForWithdrawal) } ₽
Для инвестирования: ${ utils.prettify(user.balanceForInvestment) } ₽
        
📑ИНВЕСТИРОВАННО
-> ${ utils.prettify(user.invested) } ₽
        
⚙СПОСОБ ИНВЕСТИЦИИ
${ investmentMethod }

🗄СТАТИСТИКА
Выведенно: ${ utils.prettify(user.withdrawn) } ₽
Пополненно: ${ utils.prettify(user.replenished) } ₽
Украдено у вас: ${ utils.prettify(user.stolenFromUser) } ₽
Украли вы: ${ utils.prettify(user.stolenByUser) } ₽`, user.balanceForWithdrawal && !user.protection ? {
    keyboard: Keyboard.builder()
    .textButton({
        label: '📝Активировать промокод',
        color: Keyboard.POSITIVE_COLOR
    })
    .row()
    .textButton({
        label: '🔒Защитить средства',
        color: Keyboard.POSITIVE_COLOR
    })
    .inline()
} : {
    keyboard: Keyboard.builder()
    .textButton({
        label: '📝Активировать промокод',
        color: Keyboard.POSITIVE_COLOR
    })
    .inline()
});
}

module.exports = profile;