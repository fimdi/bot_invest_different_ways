module.exports = (context, arr, pool) =>
{
    if ( arr.length < 3 ) return context.send("Чего-то не хватает");

    pool.query(`DELETE FROM promoCodes WHERE name = ?`, [arr[2]]);

    return context.send("Промокод удалён");
}