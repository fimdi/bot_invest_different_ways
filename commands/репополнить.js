const reReplenishment = (context, users) =>
{
    if (users[context.senderId].balanceForWithdrawal == 0) return context.send("На балансе для вывода 0 ₽")

    context.send(
`Репополнение - перевод заработанных денег на баланс для инвестирования.

Отправьте "да", если согласны на репополнение.`);
}

module.exports = reReplenishment;