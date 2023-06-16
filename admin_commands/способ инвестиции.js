module.exports = async (context, arr, pool) =>
{
    if ( arr.length < 5 ) return context.send("Чего-то не хватает");

    let [res] = await pool.query(`INSERT INTO listInvestmentMethods(incomeDayPercentage, taxDayRubles, term, maximumInvestment) VALUES(?, ?, ?, ?)`, [arr[1], arr[2], arr[3], arr[4]]);

    return context.send(`Способ инвестиции создан, номер: ${ res.insertId }`);
}