const formatter = new Intl.NumberFormat("ru");
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

// function prettify(num) 
// {
//   	let a = formatter.format(num / 1000);
//   	a = a.replace(/[,]/g, " ");
//   	return a.replace(".", ",");
// }

function prettify(num) 
{
  	return formatter.format(num);
}

function getTop(users, parameter,  text)
{
	let i = 1;

    const top = Object.keys(users)
    .sort((a, b) => users[b][parameter] - users[a][parameter])
    .slice(0, 10).map(key => `${i++}) [id${key}|${users[key].name}] — ${text} ${users[key][parameter]} ₽`);
    if (top.length < 10)
    {
	    let empty = 10 - top.length;
	    for (let j = 0; j < empty; j++) top.push(`${i++}) Пусто`);
    }

	return top;
}

function lineEnding(n, text_forms) {  
    n = Math.abs(n) % 100; 
    var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

exports.lineEnding = lineEnding;
exports.getTop = getTop;
exports.random = random;
exports.save = save;
exports.prettify = prettify;