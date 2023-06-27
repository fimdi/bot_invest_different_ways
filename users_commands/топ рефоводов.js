const utils = require('../utils.js');

async function getTopRefovods(pool)
{
	let i = 1;
    let [users] = await pool.query(`SELECT
        referrals.userId AS id, users.name, COUNT(*) AS numberReferrals
    FROM
        referrals, users
    WHERE
        referrals.userId = users.id
    GROUP BY
        userId
    ORDER BY
        numberReferrals DESC LIMIT 10`);

    const top = users.map(el => `${i++}) [id${el.id}|${el.name}] — привёл ${utils.prettify(el.numberReferrals)}`);
    if ( top.length < 10 )
    {
	    let empty = 10 - top.length;
	    for (let j = 0; j < empty; j++) top.push(`${i++}) Пусто`);
    }
	return top;
}

module.exports = async (context, pool) =>
{
    let top = await getTopRefovods(pool);

    context.send(`Интересно, откуда?\n\n${top.join('\n')}`);
}