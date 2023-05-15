module.exports = (context, arr, pool) =>
{
    if ( arr.length < 4 ) return context.send("Чего-то не хватает");
    if ( isNaN(arr[2]) ) return context.send("Сумма должна быть числом");
    if ( isNaN(arr[3]) ) return context.send("Количество должно быть числом");
    
    pool.query(`INSERT INTO promoCodes VALUES(?, ?, ?, ?)`,
    [arr[1], arr[2], arr[3], JSON.stringify([])]);

    return context.send(`Промокод "${arr[1]}" на сумму ${arr[2]} ₽ и количество активаций ${arr[3]} создан`);
}