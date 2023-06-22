module.exports = async (context, arr, pool, getUser, text) =>
{
    if ( arr.length < 4 ) return context.send("Чего-то не хватает");
    let user = await getUser(arr[1]);
    let parameter;
    let investmentMethod = false;

    switch ( arr[2].toLowerCase() )
    {
        case "длявывода":
            parameter = "balanceForWithdrawal"
            break;
        case "дляинвестирования":
            parameter = "balanceForInvestment"
            break;
        case "инвестированно":
            parameter = "invested"
            break;
        case "выведено":
            parameter = "withdrawn"
            break;
        case "пополнено":
            parameter = "replenished"
            break;
        case "украденоувас":
            parameter = "stolenFromUser"
            break;
        case "украливы":
            parameter = "stolenByUser"
            break;

        case "доходвдень":
            parameter = "incomeDayPercentage";
            investmentMethod = true;
            break;
        case "налогвдень":
            parameter = "taxDayRubles";
            investmentMethod = true;
            break;
        case "срок":
            parameter = "term";
            investmentMethod = true;
            break;
        case "осталосьдней":
            parameter = "daysLeft";
            investmentMethod = true;
            break;
    }

    if ( investmentMethod )
    {
        let [[method]] = await pool.query(`SELECT * FROM usersInvestmentMethods WHERE id = ?`, [user.investmentMethodId]);

        if ( /^Добавить/i.test(text) )
        {
            await pool.query(`UPDATE usersInvestmentMethods SET ?? = ?? + ? WHERE id = ?`, [parameter, parameter, arr[3], user.investmentMethodId]);
            let [[method2]] = await pool.query(`SELECT * FROM usersInvestmentMethods WHERE id = ?`, [user.investmentMethodId]);
            context.send(`Имя: ${user.name}\nСвойство: ${arr[2].toLowerCase()}\nДобавлено: ${arr[3]}\nБыло: ${method[parameter]}\nСтало: ${method2[parameter]}`)
        }
        if ( /^Убавить/i.test(text) )
        {
            await pool.query(`UPDATE usersInvestmentMethods SET ?? = ?? - ? WHERE id = ?`, [parameter, parameter, arr[3], user.investmentMethodId]);
            let [[method2]] = await pool.query(`SELECT * FROM usersInvestmentMethods WHERE id = ?`, [user.investmentMethodId]);
            context.send(`Имя: ${user.name}\nСвойство: ${arr[2].toLowerCase()}\nУбавлено: ${arr[3]}\nБыло: ${method[parameter]}\nСтало: ${method2[parameter]}`)
        }
        if ( /^Присвоить/i.test(text) )
        {
            pool.query(`UPDATE usersInvestmentMethods SET ?? = ? WHERE id = ?`, [parameter, arr[3], user.investmentMethodId]);
            context.send(`Имя: ${user.name}\nСвойство: ${arr[2].toLowerCase()}\nПрисвоино: ${arr[3]}\nБыло: ${method[parameter]}`)
        }
    }
    else
    {
        if ( /^Добавить/i.test(text) )
        {
            await pool.query(`UPDATE users SET ?? = ?? + ? WHERE id = ?`, [parameter, parameter, arr[3], arr[1]]);
            let user2 = await getUser(arr[1]);
            context.send(`Имя: ${user.name}\nСвойство: ${arr[2].toLowerCase()}\nДобавлено: ${arr[3]}\nБыло: ${user[parameter]}\nСтало: ${user2[parameter]}`)
        }
        if ( /^Убавить/i.test(text) )
        {
            await pool.query(`UPDATE users SET ?? = ?? - ? WHERE id = ?`, [parameter, parameter, arr[3], arr[1]]);
            let user2 = await getUser(arr[1]);
            context.send(`Имя: ${user.name}\nСвойство: ${arr[2].toLowerCase()}\nУдавлено: ${arr[3]}\nБыло: ${user[parameter]}\nСтало: ${user2[parameter]}`)
        }
        if ( /^Присвоить/i.test(text) )
        {
            pool.query(`UPDATE users SET ?? = ? WHERE id = ?`, [parameter, arr[3], arr[1]]);
            context.send(`Имя: ${user.name}\nСвойство: ${arr[2].toLowerCase()}\nПрисвоино: ${arr[3]}\nБыло: ${user[parameter]}`)
        }
    }
}