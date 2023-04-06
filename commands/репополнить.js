const reReplenishment = (context, users) =>
{
    context.send(
`Репополнение - перевод заработанных денег на баланс для инвестирования.

Отправьте "да", если согласны на репополнение.`);
}

module.exports = reReplenishment;