const utils = require('../utils.js');
const { Keyboard } = require('vk-io');
const sendInvestmentMethod = require('./sendInvestmentMethod.js')

// function generateInvestmentMethods(methods) 
// {
//     let res = [];
//     methods = utils.shuffle(methods).slice(0, 5);
    
//     methods.forEach(el => res.push(utils.displayInvestmentMethod(el)));

//     return res.join("\n\n");
// }

module.exports = async (context, user, pool) => 
{
    let [listInvestmentMethods] = await pool.query('SELECT * FROM listInvestmentMethods');
    
    let available = listInvestmentMethods.length - (user.usedInvestmentMethods === null ? 0 : user.usedInvestmentMethods.length);
    
    await context.send(
`🚤Выберите способ инвестирования
        
Всего для вас доступно: ${available} ${utils.lineEnding(available, ["способ", "способа", "способов"])}

ПОВТОРНАЯ ИНВЕСТИЦИЯ ОБНУЛЯЕТ ПРОШЛУЮ ИНВЕСТИЦИЮ`);

    sendInvestmentMethod(context, 1, listInvestmentMethods, user);
    

}