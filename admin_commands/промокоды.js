const utils = require('../utils.js');

module.exports = async (context, pool) =>
{
    let [promoCodes] = await pool.query(`SELECT * FROM promoCodes`);
		
	promoCodes = promoCodes.map(promoCode => 
`Промокод "${ promoCode.name }" 
Cумма ${ utils.prettify(promoCode.amount) } ₽ 
Количество активаций ${ promoCode.numberActivations }`).join("\n\n");
			
	context.send("Промокоды\n\n" + (promoCodes.length == 0 ? "Отсутствуют" : promoCodes));
}