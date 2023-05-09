module.exports = (context, arr, data) =>
{
    if ( arr.length == 2 )
    {
        delete data.promoCodes[arr[1]];
        return context.send("Промокод удалён");
    }
    if ( arr.length < 4 ) return context.send("Чего-то не хватает");
    if ( isNaN(arr[2]) ) return context.send("Сумма должна быть числом");
    if ( isNaN(arr[3]) ) return context.send("Количество должно быть числом");

    data.promoCodes[arr[1]] = {
        "amount": +arr[2],
        "numberActivations": +arr[3],
        "activated": []
    }

    return context.send(`Промокод "${arr[1]}" на сумму ${arr[2]} ₽ и количество активаций ${arr[3]} создан`);
}