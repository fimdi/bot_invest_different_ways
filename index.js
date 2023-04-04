const users = require('./data/users.json');
const data = require('./data/data.json');
const config = require('./config.json');
const utils = require('./utils.js');

const editCommand = require('./commands/команда редактировать.js');
const createCommand = require('./commands/команда создать.js');
const steal = require('./commands/_функция кражи.js');
const invest = require('./commands/_функция инвестирования.js');

const { VK, Keyboard } = require('vk-io');
const { QuestionManager } = require('vk-io-question');

const vk = new VK({
	token: config.group_token,
	pollingGroupId: config.group_id,
	apiMode: 'parallel_selected'
});
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
	"ban": false
});

const questionManager = new QuestionManager();
vk.updates.use(questionManager.middleware);

vk.updates.on('message_new', async (context, next) => 
{
	if (!users[context.senderId]) 
	{
		let [userData] = await vk.api.users.get({user_id: context.senderId});
		users[context.senderId] = JSON.parse(startProfile);
		users[context.senderId].name = userData.first_name;
	}

	return next();
});

const DAY = 86400000;
function everyDay()
{
	let date = new Date();
	let tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
	let day = Math.floor( (Date.now() - data.onlineDate) / DAY );

	if (day < 1) return setTimeout(everyDay, +tomorrow - Date.now())
	//

	for (user in users)
	{
		if( !users[user].attemptsSteal ) users[user].attemptsSteal = 1;

		if (users[user].investmentMethod != null) // если у пользователя есть способ инвестирования
		{
			let multiplier = (day > users[user].investmentMethod.daysLeft ? users[user].investmentMethod.daysLeft : day);
			let res = (users[user].invested * users[user].investmentMethod.incomeDayPercentage / 100) - users[user].investmentMethod.taxDayRubles;
			
			users[user].balanceForWithdrawal += res * multiplier;
			users[user].investmentMethod.daysLeft -= multiplier;
		}
	}

	//
	data.onlineDate = Number( new Date(date.getFullYear(), date.getMonth(), date.getDate()) );
	setTimeout(everyDay, DAY);
}
everyDay();

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
		regexp: /^⬇Пополнить|Пополнить$/i,
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
	}
];

let cache = {};

vk.updates.on('message_new', async (context) => 
{
	if (context.senderId in cache)
	{
		context.state.user = cache[context.senderId];
		delete cache[context.senderId];
	}
	
	let text = context.text;
	let arr = text.split(" ");

	if ( config.owners.includes(context.senderId) )
	{
		if ( /^ред$/i.test(arr[0]) ) return editCommand(context, arr, users, startProfile, vk);
		if ( /^создать$/i.test(arr[0]) ) return createCommand(context, arr, users, startProfile, vk);
	}
	
	if ( !isNaN(text) ) // если пользователь отправил число
	{
		if ( context.state.user?.pastMessage == "инвестировать" ) return invest(context, users, data);
		if ( context.state.user?.pastMessage == "украсть" ) return steal(context, users, data, vk);
	};

	let indexInCommands = 
	commands.findIndex(command => command.regexp.test(text) && 
								  context.messagePayload?.command == command.payload); // индекс команды
	
	if ( indexInCommands == -1 )
	{
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

	// если команда "инвестировать"
	if ( indexInCommands == 2 ) cache[context.senderId] = { pastMessage: "инвестировать" }
	// если команда "украсть"
	if ( indexInCommands == 3 ) cache[context.senderId] = { pastMessage: "украсть" }
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