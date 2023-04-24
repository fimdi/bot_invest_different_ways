const users = require('./data/users.json');
const data = require('./data/data.json');
const config = require('./config.json');
const utils = require('./utils.js');

const editCommand = require('./function/команда редактировать.js');
const createCommand = require('./function/команда создать.js');
const steal = require('./function/функция кражи.js');
const invest = require('./function/функция инвестирования.js');
const createPromoCode = require('./function/создать промокод.js');

var CronJob = require('cron').CronJob;
const { VK, Keyboard, resolveResource } = require('vk-io');
const { QuestionManager } = require('vk-io-question');

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

for (key in users)
{
	if ( !users[key].hasOwnProperty("protection") ) users[key].protection = false;
}

vk.updates.on('message_new', async (context, next) => 
{
	if ( !users[context.senderId] ) 
	{
		let [userData] = await vk.api.users.get({user_id: context.senderId});
		
		users[context.senderId] = JSON.parse(startProfile);
		users[context.senderId].name = userData.first_name;
		data.statistics.newUsers += 1;
	}

	return next();
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

const commands = [
	{
		regexp: /^Начать|Start|Старт|Меню|Запуск|Привет|Хай|Здравствуйте|Hello$/i,
		function: require('./commands/меню.js')
	},
	{
		regexp: /^🖥Профиль|Профиль$/i,
		function: require('./commands/профиль.js')
	},
	{
		regexp: /^📑Инвестировать|Инвестировать$/i,
		function: require('./commands/инвестировать.js')
	},
	{
		regexp: /^🖐Украсть|Украсть$/i,
		function: require('./commands/украсть.js')
	},
	{
		regexp: /^⬇Пополнить$|^Пополнить$/i,
		function: require('./commands/пополнить.js')
	},
	{
		regexp: /^⬆Вывести|Вывести$/i,
		function: require('./commands/вывести.js')
	},
	{
		regexp: /^👀Топ|Топ$/i,
		function: require('./commands/топ.js')
	},
	{
		regexp: /^💰Магнаты$/i,
		function: require('./commands/топ баланс для вывода.js')
	},
	{
		regexp: /^🖐Воры$/i,
		function: require('./commands/топ воров.js')
	},
	{
		regexp: /^🕸Жертвы воров$/i,
		function: require('./commands/топ жертв воров.js')
	},
	{
		regexp: /^⏳Инвесторы$/i,
		function: require('./commands/топ инвесторов.js')
	},
	{
		regexp: /^Вручную$/i,
		function: require('./commands/пополнение и вывод вручную.js')
	},
	{
		regexp: /^Кексик$/i,
		function: require('./commands/пополнение кексиком.js'),
		payload: "пополнение"
	},
	{
		regexp: /^ЮMoney$/i,
		function: require('./commands/пополнение ЮMoney.js'),
		payload: "пополнение"
	},
	{
		regexp: /^ЮMoney$/i,
		function: require('./commands/вывод ЮMoney.js'),
		payload: "вывод"
	},
	{
		regexp: /^🔁Репополнить|Репополнить$/i,
		function: require('./commands/репополнить.js')
	},
	{
		regexp: /^🔒Защитить средства|Защитить средства$/i,
		function: require('./commands/защита средств.js')
	},
	{
		regexp: /^💻Статистика бота|Статистика бота$/i,
		function: require('./commands/статистика бота.js')
	}
];

let cache = {};

vk.updates.on('message_new', async (context) => 
{
	let text = context.text;
	let arr;
	try {
		arr = text.split(" ");
	} catch (err) {
		console.log(err, Date.now(), context.senderId)
	}
	let indexInCommands = 
	commands.findIndex(command => command.regexp.test(text) && context.messagePayload?.command == command.payload); // индекс команды

	
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
	if (context.text == "Начать" && context.messagePayload?.command == 'start')
	{
		return commands[0].function(context);
	}
	if (context.senderId in cache)
	{
		context.state.user = cache[context.senderId];
		delete cache[context.senderId];
	}
	if ( config.owners.includes(context.senderId) )
	{
		if ( /^ред$/i.test(arr[0]) ) return editCommand(context, arr, users, startProfile, vk);
		if ( /^создать$/i.test(arr[0]) ) return createCommand(context, arr, users, startProfile, vk, data);
	}
	if ( !isNaN(text) && context.state.user?.pastMessage == "инвестировать") return invest(context, users, data);
	if ( text.toLowerCase() == "да" &&  context.state.user?.pastMessage == "репополнить") 
	{
		if (users[context.senderId].balanceForWithdrawal == 0) return context.send("На балансе для вывода 0 ₽");

		users[context.senderId].balanceForInvestment = utils.rounding(users[context.senderId].balanceForInvestment + users[context.senderId].balanceForWithdrawal);
		users[context.senderId].balanceForWithdrawal = 0;

		return context.send("Деньги успешно переведены с баланса для вывода на баланс для инвестрования");
	}
	
	if ( indexInCommands == -1 )
	{
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
	}

	commands[indexInCommands].function(context, users, data); 

	if ( /^📑Инвестировать|Инвестировать$/i.test(text) ) cache[context.senderId] = { pastMessage: "инвестировать" }
	if ( /^🖐Украсть|Украсть$/i.test(text) ) cache[context.senderId] = { pastMessage: "украсть" }
	if ( /^🔁Репополнить|Репополнить$/i.test(text) ) cache[context.senderId] = { pastMessage: "репополнить" }
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