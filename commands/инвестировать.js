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

function generateInvestmentMethods(methods) {
    let res = [];
    methods = shuffle(methods).slice(0, 5);
    
    methods.forEach(el =>
        res.push(
`№ ${el.number}
${el.incomeDayPercentage >= 0 ? "Доход" : "Расход"} в день: ${Math.abs( el.incomeDayPercentage )}%
Налог в день: ${el.taxDayRubles} ₽
Максимум: ${el.maximumInvestment} ₽
Срок ${el.term} ${utils.lineEnding(el.term, ["день", "дня", "дней"])}`)
    )

    return res.join("\n\n");
}

const invest = async (context, user, pool) => 
{
    let [res] = await pool.query('SELECT * FROM listInvestmentMethods');
    
    let available = res.length - (user.usedInvestmentMethods === null ? 0 : user.usedInvestmentMethods.length);
    
    context.send(
`🚤Выбирите способ инвестирования (отправте номер):
        
Всего для вас доступно: ${available} ${ utils.lineEnding(available, ["способ", "способа", "способов"]) }

ПОВТОРНАЯ ИНВЕСТИЦИЯ ОБНУЛЯЕТ ПРОШЛУЮ ИНВЕСТИЦИЮ

${ generateInvestmentMethods(res) }`);
}

module.exports = invest;