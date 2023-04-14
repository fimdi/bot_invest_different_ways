const utils = require('../utils.js');

function shuffle(array) {
    var i = array.length, j = 0, temp;

    while (i--) {
        j = Math.floor( Math.random() * (i+1) );

        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

function generateInvestmentMethods(context, users, data) {
    let res = [];
    let arrId = 
    Object.keys(data.investmentMethods)
    .filter(el => !users[context.senderId].usedInvestmentMethods.includes( +el ) );
    
    arrId = shuffle(arrId).slice(0, 6);
    
    arrId.forEach(id =>
        res.push(
`№ ${id}
${data.investmentMethods[id].incomeDayPercentage >= 0 ? "Доход" : "Расход"} в день: ${Math.abs( data.investmentMethods[id].incomeDayPercentage )}%
Налог в день: ${data.investmentMethods[id].taxDayRubles} ₽
Срок ${data.investmentMethods[id].term} ${utils.lineEnding(data.investmentMethods[id].term, ["день", "дня", "дней"])}`)
    )

    return res.join("\n\n");
}

const invest = (context, users, data) => {
    let available = Object.keys(data.investmentMethods).length - users[context.senderId].usedInvestmentMethods.length;
    
    context.send(
`🚤Выбирите способ инвестирования (отправте номер):
        
Всего для вас доступно: ${available} ${ utils.lineEnding(available, ["способ", "способа", "способов"]) }

ПОВТОРНАЯ ИНВЕСТИЦИЯ ОБНУЛЯЕТ ПРОШЛУЮ ИНВЕСТИЦИЮ

${generateInvestmentMethods(context, users, data)}`);
}

module.exports = invest;