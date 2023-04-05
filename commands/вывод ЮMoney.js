const withdrawalYoomoney = (context, users) =>
{
    if (users[context.senderId].ban) return context.send('Ваш аккаунт заморожен, обратитесь к админу');

    context.send("Не доступно");
}

module.exports = withdrawalYoomoney;