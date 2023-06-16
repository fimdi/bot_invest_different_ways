const utils = require('../utils.js');

module.exports = async (context, arr, pool, getUser, vk) =>
{
    if ( arr.length < 3 ) return context.send("Чего-то не хватает");
    
    let parameter = arr[2].toLowerCase();
    
    if ( parameter == "аккаунт" )
    {
        let [userData] = await vk.api.users.get({user_id: arr[1]});
		
		await pool.query('INSERT INTO users(id, name) VALUES(?, ?)',
		[arr[1], userData.first_name]);

		user = await getUser(arr[1]);

        context.send(`Имя: ${ user?.name }\nАккаунт создан`)
    }
    if ( parameter == "способинвестиции" )
    {
        let user = await getUser(arr[1]);

        let [[selectedMethod]] = await pool.query(`SELECT * FROM listInvestmentMethods WHERE number = ?`, [arr[3]]);
        if ( selectedMethod == undefined ) return context.send("Такого способа инвестирования нет");

        if ( user.investmentMethodId != null ) pool.query(`DELETE FROM usersInvestmentMethods WHERE id = ?`, 
	    [user.investmentMethodId]);

        let [res] = await pool.query('INSERT INTO usersInvestmentMethods(`number`, `incomeDayPercentage`, `taxDayRubles`, `term`, `daysLeft`) VALUES(?, ?, ?, ?, ?)', 
	    [selectedMethod.number, selectedMethod.incomeDayPercentage, selectedMethod.taxDayRubles, selectedMethod.term, selectedMethod.term]);
	
	    await pool.query(`UPDATE users SET invested = ?, balanceForInvestment = ?, 
	    investmentMethodId = ?, usedInvestmentMethods = ? WHERE id = ?`, 
	    [user.balanceForInvestment, 0, res.insertId, JSON.stringify(user.usedInvestmentMethods), arr[1]]);

        let [[selectedUserMethod]] = await pool.query('SELECT * FROM usersInvestmentMethods WHERE id = ?', [res.insertId]);
        let investmentMethod = `№ ${ selectedUserMethod.number }
${ selectedUserMethod.incomeDayPercentage >= 0 ? "Доход" : "Расход" } в день: ${ Math.abs(selectedUserMethod.incomeDayPercentage) }%
Налог в день: ${ utils.prettify(selectedUserMethod.taxDayRubles) } ₽
Срок ${ selectedUserMethod.term } ${ utils.lineEnding(selectedUserMethod.term, ["день", "дня", "дней"]) }

Осталось дней: ${ selectedUserMethod.daysLeft }`;

        context.send(`Имя: ${ user.name }\nСпособ инвестиции создан\n${ investmentMethod }`)
    }
}