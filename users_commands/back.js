const sendInvestmentMethod = require('./sendInvestmentMethod');

module.exports = async (context, pool, user) =>
{
    let [listInvestmentMethods] = await pool.query('SELECT * FROM listInvestmentMethods');

    sendInvestmentMethod(context, context.messagePayload.backNumber, listInvestmentMethods, user)
}