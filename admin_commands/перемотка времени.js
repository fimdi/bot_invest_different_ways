const utils = require('../utils.js');

module.exports = async (context, arr, pool, data) =>
{
    data.statistics.weWork += +arr[1];
    utils.save('./data.json', data);

    await pool.query(`
	UPDATE
		users u, 
		usersInvestmentMethods i
	SET
		u.balanceForWithdrawal = u.balanceForWithdrawal + (u.invested * i.incomeDayPercentage / 100 - i.taxDayRubles) * IF(? > i.daysLeft, i.daysLeft, ?),
		i.daysLeft = i.daysLeft - IF(? > i.daysLeft, i.daysLeft, ?)
	WHERE
		u.investmentMethodId  = i.id
	`, [arr[1], arr[1], arr[1], arr[1]]);

    context.send(`Время перемотано на ${arr[1]} ${utils.lineEnding(arr[1], ["день", "дня", "дней"])}`);
}