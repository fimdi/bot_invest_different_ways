const fs = require('fs');

function random(min, max) 
{
  	let rand = min + Math.random() * (max + 1 - min);
  	return Math.floor(rand);
}

async function save(way, data) 
{
  	fs.writeFileSync(way, JSON.stringify(data, null, '\t'));
}

function prettify(num) 
{
    if ( isNaN(num) ) return NaN;

  	let str = String(num);
    let start = str.length - 1;
    let point = str.indexOf('.');

    if ( point != -1 )
    {
        start = point - 1;
        str = str.slice(0, point) + "," + str.slice(point + 1);
    }

    let digits = 1;
    for (i = start; i != 0; i--, digits++)
    {
        if ( digits == 3 )
        {
            digits = 0;

            str = str.slice(0, i) + " " + str.slice(i);
        }
    }

    if ( str[0] == "-" && str[1] == " " ) str = "-" + str.slice(2);

    return str;
}

function displayInvestmentMethod(el)
{
    return `№ ${el.number}
${el.incomeDayPercentage >= 0 ? "Доход" : "Расход"} в день: ${Math.abs( el.incomeDayPercentage )}%
Налог в день: ${prettify(+el.taxDayRubles)} ₽
Максимум: ${prettify(el.maximumInvestment)} ₽
Срок ${el.term} ${lineEnding(el.term, ["день", "дня", "дней"])}`
}

async function getTop(parameter, text, pool)
{
	let i = 1;
    let [users] = await pool.query('SELECT id, name, ?? FROM users ORDER BY ?? DESC LIMIT 10',
    [parameter, parameter]);

    const top = users.map(el => `${i++}) [id${el.id}|${el.name}] — ${text} ${prettify(el[parameter])} ₽`);
    if (top.length < 10)
    {
	    let empty = 10 - top.length;
	    for (let j = 0; j < empty; j++) top.push(`${i++}) Пусто`);
    }
	return top;
}

function lineEnding(n, text_forms) 
{  
    n = Math.abs(n) % 100; 
    var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

function rounding(number)
{
    return Math.floor(number * 100) / 100;
}

module.exports = {
    displayInvestmentMethod,
    rounding,
    lineEnding,
    getTop,
    random,
    save,
    prettify
}