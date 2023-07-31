const sendInvestmentMethod = require('./sendInvestmentMethod.js')

module.exports = async (context, pool, user) =>
{
    let [listInvestmentMethods] = await pool.query('SELECT * FROM listInvestmentMethods');

    let number = await context.question(`⌨Введите число от 1 до ${listInvestmentMethods.length}`);
    number = +number.text;

    if ( isNaN(number) ) return context.send('Это не число');
    if ( number < 1 ) return context.send('Минимум 1');
    if ( number > listInvestmentMethods.length ) return context.send(`Максимум ${listInvestmentMethods.length}`);

    sendInvestmentMethod(context, number, listInvestmentMethods, user);
}