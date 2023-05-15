const invest = async (context, user, pool) =>
{
	let number = +context.text;
	if ( user.balanceForInvestment == 0 ) return context.send("Вам нечего инвестировать");
	if ( user.usedInvestmentMethods.includes(number) ) return context.send("Этот способ уже использьзован вами");
	
	let [[selectedMethod]] = await pool.query(`SELECT * FROM listInvestmentMethods WHERE number = ?`, [number]);
	if ( selectedMethod == undefined ) return context.send("Такого способа инвестирования нет");
	if ( user.balanceForInvestment > selectedMethod.maximumInvestment ) return context.send("Этот способ пока что не подходит");
	///
	if (user.investmentMethodId != null) pool.query(`DELETE FROM usersInvestmentMethods WHERE id = ?`, 
	[user.investmentMethodId]);
	
	let [res] = await pool.query('INSERT INTO usersInvestmentMethods(`number`, `incomeDayPercentage`, `taxDayRubles`, `term`, `daysLeft`) VALUES(?, ?, ?, ?, ?)', 
	[selectedMethod.number, selectedMethod.incomeDayPercentage, selectedMethod.taxDayRubles, selectedMethod.term, selectedMethod.term]);
	
	await user.usedInvestmentMethods.push(selectedMethod.number);
	pool.query(`UPDATE users SET invested = ?, balanceForInvestment = ?, 
	investmentMethodId = ?, usedInvestmentMethods = ? WHERE id = ?`, 
	[user.balanceForInvestment, 0, res.insertId, JSON.stringify(user.usedInvestmentMethods), context.senderId]);
	
    context.send("Успешно инвестировали"); 
}

module.exports = invest;