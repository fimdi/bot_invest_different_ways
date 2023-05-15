const utils = require('../utils.js');

module.exports = async (context, pool) =>
{
    let res = await context.question(`Введите промокод...`);
	text = res.text;
		
    let [[promoCode]] = await pool.query(`SELECT * FROM promoCodes WHERE name = ?`, [text]);
	if ( !promoCode ) return context.send("Такого промокода нет");
	if (promoCode.activated == null) promoCode.activated = [];
	if ( promoCode.activated.includes(context.senderId) ) return context.send("Вы уже активировали промокод");
		
	promoCode.activated.push(context.senderId);
	pool.query(`UPDATE promoCodes SET numberActivations = ?, activated = ? WHERE name = ?`, [--promoCode.numberActivations, JSON.stringify(promoCode.activated), text]);
	//promoCode.numberActivations -= 1;

	let sum = +promoCode.amount;
	pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + ? WHERE id = ?`, [sum, context.senderId]);
	//users[context.senderId].balanceForInvestment = utils.rounding(users[context.senderId].balanceForInvestment + sum);

	if (promoCode.numberActivations <= 0) pool.query(`DELETE FROM promoCodes WHERE name = ?`, [text]);
	//delete promoCode;

	return context.send(`Вы успешно активировали промокод на сумму ${ utils.prettify(sum) } ₽`);
}