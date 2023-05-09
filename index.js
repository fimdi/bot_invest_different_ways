const users = require('./data/users.json');
const data = require('./data/data.json');
const config = require('./config.json');
const utils = require('./utils.js');

const editCommand = require('./commands/команда редактировать.js');
const createCommand = require('./commands/команда создать.js');
const steal = require('./commands/функция кражи.js');
const invest = require('./commands/функция инвестирования.js');
const createPromoCode = require('./commands/создать промокод.js');
const menu = require('./commands/меню.js');
const profile = require('./commands/профиль.js');
const investMessage = require('./commands/инвестировать.js');
const stealMessage = require('./commands/украсть.js');
const replenish = require('./commands/пополнить.js');
const withdraw = require('./commands/вывести.js');
const top = require('./commands/топ.js');
const topBalance = require('./commands/топ баланс для вывода.js');
const topThieves = require('./commands/топ воров.js');
const topVictims = require('./commands/топ жертв воров.js')
const topInvestors = require('./commands/топ инвесторов.js');
const manually = require('./commands/пополнение и вывод вручную.js');
const re_replenishment = require('./commands/репополнить.js');
const statistics = require('./commands/статистика бота.js');
const protectionOfFunds = require('./commands/защита средств.js');
const replenishmentKeksik = require('./commands/пополнение кексиком.js');
const replenishmentYooMoney = require('./commands/пополнение ЮMoney.js');
const withdrawalYooMoney = require('./commands/вывод ЮMoney.js');

var CronJob = require('cron').CronJob;
const { VK, Keyboard, resolveResource } = require('vk-io');
const { QuestionManager } = require('vk-io-question');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '141.8.195.65',
    port: 3306,
    user: 'a0672554_Victor',
    password: 'f59zd$CfEd@TZ9dccd',
    database: 'a0672554_bot_investing_different_ways',
	charset: 'utf8mb4_general_ci'
});
const vk = new VK({
	token: config.group_token,
	pollingGroupId: config.group_id,
	apiMode: 'parallel_selected'
});

const questionManager = new QuestionManager();
vk.updates.use(questionManager.middleware);

const startProfile = JSON.stringify({
	"name": "Пользователь",
	"balanceForWithdrawal": 0,
	"balanceForInvestment": 0,
	"invested": 0,
	"investmentMethod": null,
	"usedInvestmentMethods": [],
	"withdrawn": 0,
	"replenished": 0,
	"stolenFromUser": 0,
	"stolenByUser": 0,
	"attemptsSteal": 1,
	"ban": false,
	"protection": false
});

const DAY = 86400000;

function everyDay()
{
	let day = Math.floor( (Date.now() - data.onlineDate) / DAY );
	if ( day < 1 ) return;

	data.statistics.newUsers = 0;
	data.statistics.weWork += 1;

	for (user in users)
	{
		if( !users[user].attemptsSteal ) users[user].attemptsSteal = 1;
		if ( users[user].protection ) users[user].protection = false;

		if ( users[user].investmentMethod != null ) // если у пользователя есть способ инвестирования
		{
			let multiplier = (day > users[user].investmentMethod.daysLeft ? users[user].investmentMethod.daysLeft : day);
			let res = users[user].invested * users[user].investmentMethod.incomeDayPercentage / 100 - users[user].investmentMethod.taxDayRubles;
			
			users[user].balanceForWithdrawal = utils.rounding( users[user].balanceForWithdrawal + res * multiplier );
			users[user].investmentMethod.daysLeft -= multiplier;
		}
	}

	let date = new Date();
	data.onlineDate = Number( new Date(date.getFullYear(), date.getMonth(), date.getDate()) );
}
everyDay();

const job = new CronJob('00 00 00 * * *', async () => 
{
	everyDay();
});
job.start();

let cache = {};

vk.updates.on('message_new', async (context) => 
{
	if (context.senderId in cache)
	{
		context.state.user = cache[context.senderId];
		delete cache[context.senderId];
	}
	let [[user]] = await pool.query(`SELECT id, name, balanceForWithdrawal, balanceForInvestment, 
	invested, investmentMethodId, usedInvestmentMethods, withdrawn, replenished, stolenFromUser, 
	stolenByUser, attemptsSteal, ban+0 AS ban, protection+0 AS protection FROM users WHERE id = ?`, 
	[context.senderId]);
	if (user === undefined)
	{
		let [userData] = await vk.api.users.get({user_id: context.senderId});
		
		pool.query('INSERT INTO users(id, name) VALUES(?, ?)',
		[context.senderId, userData.first_name]);

		[[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [context.senderId]);
	}
	if (context.text == "") return;
	let text = context.text;
	let arr = text.split(" ");

	if ( /^Начать|Start|Старт|Меню|Запуск|Привет|Хай|Здравствуйте|Hello$/i.test(context.text) )
	{
		return menu(context);
	}
	if ( /^🖥Профиль|Профиль$/i.test(context.text) )
	{
		return profile(context, user, pool);
	}
	if ( /^📑Инвестировать|Инвестировать$/i.test(context.text) )
	{
		cache[context.senderId] = { pastMessage: "инвестировать" };
		return investMessage(context, user, pool);
	}
	if ( /^🖐Украсть|Украсть$/i.test(context.text) )
	{
		cache[context.senderId] = { pastMessage: "украсть" };
		return stealMessage(context, user);
	}
	if ( /^⬇Пополнить$|^Пополнить$/i.test(context.text) )
	{
		return replenish(context);
	}
	if ( /^👀Топ$|^Топ$/i.test(context.text) )
	{
		return top(context);
	}
	if ( /^⬆Вывести|Вывести$/i.test(context.text) )
	{
		return withdraw(context, user);
	}
	if ( /^💰Магнаты$/i.test(context.text) )
	{
		return topBalance(context, pool);
	}
	if ( /^🖐Воры$/i.test(context.text) )
	{
		return topThieves(context, pool);
	}
	if ( /^🕸Жертвы воров$/i.test(context.text) )
	{
		return topVictims(context, pool);
	}
	if ( /^⏳Инвесторы$/i.test(context.text) )
	{
		return topInvestors(context, pool);
	}
	if ( /^Вручную$/i.test(context.text) )
	{
		return manually(context);
	}
	if ( /^🔁Репополнить|Репополнить$/i.test(context.text) )
	{
		cache[context.senderId] = { pastMessage: "репополнить" };
		return re_replenishment(context);
	}
	if ( /^💻Статистика бота|Статистика бота$/i.test(context.text) )
	{
		return statistics(context);
	}
	if ( /^🔒Защитить средства|Защитить средства$/i.test(context.text) )
	{
		return protectionOfFunds(context);
	}
	if ( /^Кексик$/i.test(context.text) && context.messagePayload?.command == "пополнение")
	{
		return replenishmentKeksik(context);
	}
	if ( /^ЮMoney$/i.test(context.text) && context.messagePayload?.command == "пополнение")
	{
		return withdrawalYooMoney(context, user);
	}
	if ( /^ЮMoney$/i.test(context.text) && context.messagePayload?.command == "вывод")
	{
		return replenishmentYooMoney(context);
	}
	if ( /^📝Активировать промокод$/i.test(context.text) )
	{
		let res = await context.question(`Введите промокод...`);
		text = res.text;
		
		if ( !(text in data.promoCodes) ) return context.send("Такого промокода нет");
		if ( data.promoCodes[text].activated.includes(context.senderId) ) return context.send("Вы уже активировали промокод");
		
		data.promoCodes[text].activated.push(context.senderId);
		data.promoCodes[text].numberActivations -= 1;
		let sum = +data.promoCodes[text].amount;
		users[context.senderId].balanceForInvestment = utils.rounding(users[context.senderId].balanceForInvestment + sum);

		if (data.promoCodes[text].numberActivations <= 0) delete data.promoCodes[text];

		return context.send(`Вы успешно активировали промокод на сумму ${ utils.prettify(sum) } ₽`);
	}
	if ( /^промокоды$/i.test(context.text) && config.owners.includes(context.senderId) )
	{

		let res = Object.keys(data.promoCodes).map(el => 
`Промокод "${el}" 
Cумма ${data.promoCodes[el].amount} ₽ 
Количество активаций ${data.promoCodes[el].numberActivations}`).join("\n\n");

		return context.send("Промокоды\n\n" + (res.length == 0 ? "Отсутствуют" : res));
	}
	if ( /^промокод /i.test(context.text) && config.owners.includes(context.senderId) )
	{
		return createPromoCode(context, arr, data);
	}
	if ( config.owners.includes(context.senderId) )
	{
		if ( /^ред$/i.test(arr[0]) ) return editCommand(context, arr, users, startProfile, vk);
		if ( /^создать$/i.test(arr[0]) ) return createCommand(context, arr, users, startProfile, vk, data);
	}
	if ( !isNaN(text) && context.state.user?.pastMessage == "инвестировать") return await invest(context, user, pool);
	if ( text.toLowerCase() == "да" &&  context.state.user?.pastMessage == "репополнить") 
	{
		if (users[context.senderId].balanceForWithdrawal == 0) return context.send("На балансе для вывода 0 ₽");

		users[context.senderId].balanceForInvestment = utils.rounding(users[context.senderId].balanceForInvestment + users[context.senderId].balanceForWithdrawal);
		users[context.senderId].balanceForWithdrawal = 0;

		return context.send("Деньги успешно переведены с баланса для вывода на баланс для инвестрования");
	}
	if ( context.state.user?.pastMessage == "украсть" )
	{
		if ( text in users ) return steal(context, users, data, vk, text);

		const resource = await resolveResource({
            api: vk.api,
            resource: text
        })
		.catch((err) =>
		{
			return context.send("Пользователь не найден");
		});

		if (resource?.type == 'user')
		{
			if (resource.id in users) return steal(context, users, data, vk, resource.id);

			return context.send("Данный пользователь не зарегистрирован в боте");
		}
	}

	return context.send("Такой команды нет",
	{
		keyboard: Keyboard.builder()
		.textButton({
			label: 'Меню',
			color: Keyboard.SECONDARY_COLOR
		})
		.inline()
	});
});

setInterval(() =>
{
    utils.save('./data/data.json', data);
    utils.save('./data/users.json', users);
}, 3000);

async function run() 
{
    await vk.updates.start();
    console.log("Бот запущен!");
}
run().catch(console.error);