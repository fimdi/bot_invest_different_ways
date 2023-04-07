const utils = require('../utils.js');
const { Keyboard } = require('vk-io');

const profile = (context, users) => {
    let id = context.senderId;
    let incomeDayPercentage = users[id].investmentMethod?.incomeDayPercentage;
    let term = users[id].investmentMethod?.term;
    
    context.send(
`🖥ПРОФИЛЬ
ID: ${id}
        
💰БАЛАНС
Для вывода: ${ utils.prettify(users[id].balanceForWithdrawal) } ₽
Для инвестирования: ${ utils.prettify(users[id].balanceForInvestment) } ₽
        
📑ИНВЕСТИРОВАННО
-> ${ utils.prettify(users[id].invested) } ₽
        
⚙СПОСОБ ИНВЕСТИЦИИ
${users[id].investmentMethod === null ? "Отсутствует" :
`№ ${users[id].investmentMethod.id}
${incomeDayPercentage >= 0 ? "Доход" : "Расход"} в день: ${Math.abs(incomeDayPercentage)} %
Налог в день: ${users[id].investmentMethod.taxDayRubles} ₽
Срок ${term} ${ utils.lineEnding(term, ["день", "дня", "дней"]) }

Осталось дней: ${users[id].investmentMethod.daysLeft}`}

🗄СТАТИСТИКА
Выведенно: ${ utils.prettify(users[id].withdrawn) } ₽
Пополненно: ${ utils.prettify(users[id].replenished) } ₽
Украдено у вас: ${ utils.prettify(users[id].stolenFromUser) } ₽
Украли вы: ${ utils.prettify(users[id].stolenByUser) } ₽`, users[id].balanceForWithdrawal && !users[id].protection ? {
    keyboard: Keyboard.builder()
    .textButton({
        label: '🔒Защитить средства',
        color: Keyboard.POSITIVE_COLOR
    })
    .inline()
} : {});
}

module.exports = profile;