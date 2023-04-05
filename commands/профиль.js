const utils = require('../utils.js');

const profile = (context, users) => {
    let incomeDayPercentage = users[context.senderId].investmentMethod?.incomeDayPercentage;
    let term = users[context.senderId].investmentMethod?.term;
    
    context.send(
`🖥ПРОФИЛЬ
ID: ${context.senderId}
        
💰БАЛАНС
Для вывода: ${ utils.prettify(users[context.senderId].balanceForWithdrawal) } ₽
Для инвестирования: ${ utils.prettify(users[context.senderId].balanceForInvestment) } ₽
        
📑ИНВЕСТИРОВАННО
-> ${ utils.prettify(users[context.senderId].invested) } ₽
        
⚙СПОСОБ ИНВЕСТИЦИИ
${users[context.senderId].investmentMethod === null ? "Отсутствует" :
`№ ${users[context.senderId].investmentMethod.id}
${incomeDayPercentage >= 0 ? "Доход" : "Расход"} в день: ${Math.abs(incomeDayPercentage)} %
Налог в день: ${users[context.senderId].investmentMethod.taxDayRubles} ₽
Срок ${term} ${ utils.lineEnding(term, ["день", "дня", "дней"]) }

Осталось дней: ${users[context.senderId].investmentMethod.daysLeft}`}

🗄СТАТИСТИКА
Выведенно: ${ utils.prettify(users[context.senderId].withdrawn) } ₽
Пополненно: ${ utils.prettify(users[context.senderId].replenished) } ₽
Украдено у вас: ${ utils.prettify(users[context.senderId].stolenFromUser) } ₽
Украли вы: ${ utils.prettify(users[context.senderId].stolenByUser) } ₽`);
}

module.exports = profile;