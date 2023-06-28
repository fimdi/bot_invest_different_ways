module.exports = async (context, arr, pool, getUser) =>
{
    if ( arr.length < 2 ) return context.send("Чего-то не хватает");
    
    let user = await getUser(arr[1]);

    if ( arr[2] == undefined )
    {
        await pool.query(`UPDATE users SET withdrawn = withdrawn + balanceForWithdrawal, balanceForWithdrawal = 0 WHERE id = ?`, [arr[1]])
        let user2 = await getUser(arr[1]);
        context.send(`Имя: ${user.name}\nВыведено: ${user.balanceForWithdrawal}\nБыло: ${user.balanceForWithdrawal}\nСтало: ${user2.balanceForWithdrawal}`)
    }
    else
    {
        await pool.query(`UPDATE users SET balanceForWithdrawal = balanceForWithdrawal - ?, withdrawn = withdrawn + ? WHERE id = ?`, [arr[2], arr[2], arr[1]]);
        let user2 = await getUser(arr[1]);
        context.send(`Имя: ${user.name}\nВыведено: ${arr[2]}\nБыло: ${user.balanceForWithdrawal}\nСтало: ${user2.balanceForWithdrawal}`)
    }
}