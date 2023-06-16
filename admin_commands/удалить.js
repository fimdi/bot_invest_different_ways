module.exports = async (context, arr, pool, getUser) =>
{
    if ( arr.length < 3 ) return context.send("Чего-то не хватает");

    let parameter = arr[2].toLowerCase();
    let user = await getUser(arr[1])
    
    if ( !user ) return context.send("Пользователя нет в боте");
    
    if ( parameter == "аккаунт" )
    {
        pool.query(`DELETE FROM usersInvestmentMethods WHERE id = ?`, [user.investmentMethodId]);
        pool.query(`DELETE FROM users WHERE id = ?`, [arr[1]]);

        context.send(`Имя: ${ user.name }\nАккаунт удалён`)
    }
    if ( parameter == "способинвестиции" )
    {
        pool.query(`DELETE FROM usersInvestmentMethods WHERE id = ?`, [user.investmentMethodId]);

        context.send(`Имя: ${ user.name }\nСпособ инвестиции удалён`)
    }
}