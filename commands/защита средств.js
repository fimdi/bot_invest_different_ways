const protectionOfFunds = (context, users) =>
{
    if (users[context.senderId].protection) return context.send("Ваши средства уже под защитой (до 00:00)");

    users[context.senderId].protection = true;
    context.send("Вы успешно защищены от краж до 00:00")
}

module.exports = protectionOfFunds;