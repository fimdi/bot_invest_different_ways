const steal = async (context, users, data, vk, id) =>
{
    let sum = users[context.senderId].invested * 0.1; // 10% от инвестирования

    if (users[context.senderId].invested == 0) return context.send("Для кражи необходимо инвестировать");
    if (users[context.senderId].attemptsSteal == 0) return context.send("На сегодня у вас осталось 0 попыток");
    if ( users[id].balanceForWithdrawal == 0 ) return context.send("У этого пользователя нет денег");
    if ( users[id].balanceForWithdrawal < sum ) sum = users[id].balanceForWithdrawal;
    
    users[id].balanceForWithdrawal -= sum;
    users[id].stolenFromUser += sum;
    users[context.senderId].balanceForWithdrawal += sum / 2; // половина пользователю
    users[context.senderId].stolenByUser += sum;
    users[context.senderId].attemptsSteal -= 1;
    data.statistics.incomeFromThefts += sum / 2; // половина боту

    context.send(`Вы украли ${sum} ₽, но донести до дома вы смогли только половину: ${sum / 2} ₽`);
    
    vk.api.messages.send({
        user_id: id,
        random_id: Date.now(),
        message: `[id${context.senderId}|Вор] украл у вас ${sum} ₽, отомсти ему! ID: ${context.senderId}`
    })
}

module.exports = steal;