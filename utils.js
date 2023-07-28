const fs = require('fs');
const crypto = require('crypto')

function random(min, max) 
{
  	let rand = min + Math.random() * (max + 1 - min);
  	return Math.floor(rand);
}

async function save(path, data) 
{
  	fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
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
    if ( top.length < 10 )
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
    if ( n > 10 && n < 20 ) { return text_forms[2]; }
    if ( n1 > 1 && n1 < 5 ) { return text_forms[1]; }
    if ( n1 == 1 ) { return text_forms[0]; }
    return text_forms[2];
}

function rounding(number)
{
    return Math.floor(number * 100) / 100;
}

function shuffle(array) 
{
    var i = array.length, j = 0, temp;

    while (i--) {
        j = Math.floor( Math.random() * (i+1) );

        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

function isAuthenticYoomoney(obj)
{
    const notification_secret = "uSwwJd1AsFvwgVbTIS14C0tL";

    const str = `${obj.notification_type}&${obj.operation_id}&${obj.amount}&${obj.currency}&${obj.datetime}&${obj.sender}&${obj.codepro}&${notification_secret}&${obj.label}`;
    
    const hash = crypto.createHash('sha1').update(str).digest('hex');
    
    console.log(hash)

    return obj.sha1_hash == hash;
}

function objectToArray(obj, arr, path)
{
    path = path === undefined ? "" : path + "/";

    for (key in obj)
    {
        if ( typeof obj[key] == "object" )
        {
            objectToArray(obj[key], arr, path + key);
        }
        else
        {
            arr.push({key: path + key, value: obj[key]});
        }
    }
}

function isAuthenticKeksik(obj)
{
    let arr = [];
    let hash = obj.hash;

    delete obj.hash;

    objectToArray(obj, arr);

    arr.sort((a, b) => {
        a = a.key; b = b.key;

        if ( a > b ) return 1;
        if ( a == b ) return 0;
        if ( a < b ) return -1;
    });

    let str = "";

    for (key of arr)
    {
        let value = key.value;
        if ( typeof key.value == 'boolean' )
        {
            if ( key.value ) 
                value = 1;
            else 
                value = "";
        }
        str = str + "," + value;
    }

    str = str.slice(1);
    str = str + "," + "4f1e7006b59a86f2d646f04d6c7a020906bd901999ae483f71";

    console.log(str)

    const sha256_hash = crypto.createHash('sha256').update(str).digest('hex');
    
    console.log(`sha256_hash: ${sha256_hash}\nhash: ${hash}`)

    return sha256_hash == hash;

    //console.log(JSON.stringify(arr, null, 2));
}

function randomSymbolsGenerator(quantity)
{
    const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
    let res = "";

    for (i = 0; i < quantity; i++)
    {
        res += symbols[random(0, symbols.length - 1)];
    }

    return res;
}

module.exports = {
    displayInvestmentMethod,
    rounding,
    lineEnding,
    getTop,
    random,
    randomSymbolsGenerator,
    save,
    prettify,
    shuffle,
    isAuthenticYoomoney,
    isAuthenticKeksik
}