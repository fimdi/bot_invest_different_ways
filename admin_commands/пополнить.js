module.exports = async (context, user, arr, pool, getUser) =>
{
    if ( arr.length < 2 ) return context.send("Чего-то не хватает");

    await pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + ?, replenished = replenished + ? WHERE id = ?`, [arr[2], arr[2], arr[1]])
    let user2 = await getUser(arr[1]);
    context.send(`Имя: ${user.name}\nПополнено: ${arr[2]}\nБыло: ${user.balanceForInvestment}\nСтало: ${user2.balanceForInvestment}`)
}