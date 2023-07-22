const utils = require('../utils.js');

function generateInvestmentMethods(methods) 
{
    let res = [];
    methods = utils.shuffle(methods).slice(0, 5);
    
    methods.forEach(el => res.push(utils.displayInvestmentMethod(el)));

    return res.join("\n\n");
}

module.exports = async (context, user, pool) => 
{
    let [res] = await pool.query('SELECT * FROM listInvestmentMethods');
    
    let available = res.length - (user.usedInvestmentMethods === null ? 0 : user.usedInvestmentMethods.length);
    
    context.send(
`🚤Выберите способ инвестирования (отправте номер):
        
Всего для вас доступно: ${available} ${utils.lineEnding(available, ["способ", "способа", "способов"])}

ПОВТОРНАЯ ИНВЕСТИЦИЯ ОБНУЛЯЕТ ПРОШЛУЮ ИНВЕСТИЦИЮ

${generateInvestmentMethods(res)}`);
}