const invest = async (context, user, pool) =>
{
	let number = +context.text;
	if ( user.balanceForInvestment == 0 ) return context.send("Вам нечего инвестировать");
	if ( number == user.investmentMethodId ) return context.send("Этот способ уже используется вами, выберите другой");
	

	let [[method]] = await pool.query('SELECT * FROM listInvestmentMethods WHERE number = ?', [number])


	if ( user.usedInvestmentMethods?.includes(number) ) return context.send("Этот способ уже использьзован вами");
	
	if ( method == undefined ) return context.send("Такого способа инвестирования нет");
	
	if (user.investmentMethodId != null) pool.query(`DELETE FROM usersInvestmentMethods WHERE = ?`, 
	[user.investmentMethodId]);
	let res = await pool.query('INSERT INTO usersInvestmentMethods(`number`, `incomeDayPercentage`, `taxDayRubles`, `term`, `daysLeft`) VALUES(?, ?, ?, ?, ?)', 
	[id, method.incomeDayPercentage, method.taxDayRubles, method.term, method.term]);
	
	await pool.query(`UPDATE users SET invested = ?, balanceForInvestment = ?, 
	investmentMethodId = ? WHERE id = ?`, 
	[user.balanceForInvestment, 0, res[0].insertId, context.senderId]);
	
    context.send("Успешно инвестировали"); 
}

module.exports = invest;