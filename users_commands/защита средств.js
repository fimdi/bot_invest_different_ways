const protectionOfFunds = (context, user, pool) =>
{
    if ( user.protection ) return context.send("Ваши средства уже под защитой (до 00:00)");

    pool.query(`UPDATE users SET protection = 1 WHERE id = ?`, [context.senderId]);
    //users[context.senderId].protection = true;
    context.send("Вы успешно защищены от краж до 00:00")
}

module.exports = protectionOfFunds;