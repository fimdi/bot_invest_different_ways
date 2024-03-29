module.exports = async (context, arr, pool, getUser) =>
{
    if ( arr.length < 2 ) return context.send("Чего-то не хватает");

    let user = await getUser(arr[1]);

    if ( !user.ban ) return context.send(`Имя: ${user.name}\nНе забанен`);
    pool.query(`UPDATE users SET ban = 0 WHERE id = ?`, [arr[1]]);
    context.send(`Имя: ${user.name}\nРазбанен`);
}