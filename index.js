const data = require('./data.json');
const config = require('./config.json');
const utils = require('./utils.js');

const { VK, Keyboard } = require('vk-io');
const { QuestionManager } = require('vk-io-question');
const mysql = require('mysql2/promise');
const CronJob = require('cron').CronJob;
const express = require('express');
const app = express();

const PORT = 5050;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool(config.mysql_object);
const vk = new VK({
	token: config.group_token,
	pollingGroupId: config.group_id,
	apiMode: 'parallel_selected'
});

const questionManager = new QuestionManager();
vk.updates.use(questionManager.middleware);

async function everyDay()
{
	const millisecondsInDay = 86400000;
	let daysPassed = Math.floor( (Date.now() - data.onlineDate) / millisecondsInDay );
	if ( daysPassed < 1 ) return;

	data.statistics.newUsers = 0;
	data.statistics.weWork += daysPassed;

	await pool.query('UPDATE users SET attemptsSteal = 1 WHERE attemptsSteal = 0');
	await pool.query('UPDATE users SET protection = false WHERE protection = true');
	pool.query(`
	UPDATE
		users u, 
		usersInvestmentMethods i
	SET
		u.balanceForWithdrawal = u.balanceForWithdrawal + (u.invested * i.incomeDayPercentage / 100 - i.taxDayRubles) * IF(? > i.daysLeft, i.daysLeft, ?),
		i.daysLeft = i.daysLeft - IF(? > i.daysLeft, i.daysLeft, ?)
	WHERE
		u.investmentMethodId  = i.id
	`, [daysPassed, daysPassed, daysPassed, daysPassed]);

	let date = new Date();
	data.onlineDate = Number( new Date(date.getFullYear(), date.getMonth(), date.getDate()) );
	utils.save('./data.json', data);
}
everyDay();

const job = new CronJob('00 00 00 * * *', async () => 
{
	everyDay();
});
job.start();

async function getUser(id)
{
	let [[user]] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
	
	if ( user )
	{
		user.balanceForWithdrawal = Number(user.balanceForWithdrawal);
		user.balanceForInvestment = Number(user.balanceForInvestment);
		user.invested = Number(user.invested);
		user.withdrawn = Number(user.withdrawn);
		user.replenished = Number(user.replenished);
		user.stolenFromUser = Number(user.stolenFromUser);
		user.stolenByUser = Number(user.stolenByUser);

		if ( user?.usedInvestmentMethods == null ) user.usedInvestmentMethods = [];
	}

	return user;
}

async function sendMessage(id, message)
{
	try {
		await vk.api.messages.send({
			user_id: id,
			random_id: Date.now(),
			message: message
		});
	} catch (err)
	{
		console.log("Ошибка отправки сообщения:", err);
	}
}

let cache = {};
let replenishmentIsExpected = {};

app.post('/yoomoney/payment-acceptance', (req, res) =>
{
	const body = req.body;
	console.log(body)
	if ( !utils.isAuthenticYoomoney(body) ) return;

	for (id in replenishmentIsExpected)
	{
		if ( replenishmentIsExpected[id].amount == body.amount && replenishmentIsExpected[id].label == body.label )
		{
			sendMessage(id, `✅Перевод найден. Баланс для инвестирования пополнен на ${body.amount} ₽`)

			pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + ?, replenished = replenished + ? WHERE id = ?`, [body.amount, body.amount, id]);

			clearTimeout(replenishmentIsExpected[id].timerId);
			delete replenishmentIsExpected[id];
			break;
		}
	}

	res.send('OK');
});

// app.post('/keksik/payment-acceptance', (req, res) =>
// {
// 	let body = req.body;

//     console.log(JSON.stringify(body));
	
// 	if ( body.type == "confirmation" ) return res.send(`{"status": "ok", "code": ${config.code_keksik}}`);
//     if ( !isAuthenticKeksik(body) || body.type != "new_donate" || body.group != config.group_id ) return;

// 	let amount = body.donate.amount, userId = body.donate.user;
// 	pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + ?, replenished = replenished + ? WHERE id = ?`, [amount, amount, userId]);
// 	sendMessage(userId, `✅Перевод найден. Баланс для инвестирования пополнен на ${amount} ₽`)

//     res.send(`{"status": "ok", "code": ${config.code_keksik}}`);
// });

vk.updates.on('message_new', async (context) => 
{
	if ( context.isChat ) return;

	let user = await getUser(context.senderId);

	if ( !user )
	{
		let [userData] = await vk.api.users.get({user_id: context.senderId});
		
		await pool.query('INSERT INTO users(id, name) VALUES(?, ?)',
		[context.senderId, userData.first_name]);

		user = await getUser(context.senderId);
		data.statistics.newUsers += 1;
		context.isNew = true;
		utils.save('./data.json', data);
	}

	if ( context.referralValue && context.referralValue != context.senderId && context.isNew )
	{
		let refovod = await getUser(context.referralValue);;
		let [[referral]] = await pool.query(`SELECT * FROM referrals WHERE referralId = ?`, [context.senderId]);

		if ( refovod && !referral )
		{
			pool.query(`INSERT INTO referrals(userId, referralId) VALUES (?, ?)`, [context.referralValue, context.senderId]);
			pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + ? WHERE id = ?`, [config.receive_referral, context.senderId]);
			pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + ? WHERE id = ?`, [config.receive_refovod, context.referralValue]);

			user.balanceForInvestment += config.receive_referral;

			context.send(`Вы перешли по ссылке [id${context.referralValue}|пользователя] и получили ${config.receive_referral} ₽`);
			sendMessage(context.referralValue, `По вашей ссылке перешёл [id${context.senderId}|пользователь] и вы получили ${config.receive_refovod} ₽`);
		}
	}

	if ( context.senderId in cache )
	{
		context.state.user = cache[context.senderId];
		delete cache[context.senderId];
	}

	if ( !context.text ) return;

	let text = context.text;
	let arr = text.split(" ");
	
	if ( /^(Начать|Start|Старт|Меню|Запуск|Привет|Хай|Здравствуйте|Hello)$/i.test(text) )
		return require('./users_commands/меню.js')(context);
	
	if ( /^(🖥Профиль|Профиль)$/i.test(text) )
		return require('./users_commands/профиль.js')(context, user, pool);

	if ( /^(⬇Пополнить|Пополнить)$/i.test(text) )
		return require('./users_commands/пополнить.js')(context);
	
	if ( /^(👀Топ$|^Топ)$/i.test(text) )
		return require('./users_commands/топ.js')(context);
	
	if ( /^(⬆Вывести|Вывести)$/i.test(text) )
		return require('./users_commands/вывести.js')(context, user);
	
	if ( /^(💰Магнаты|Магнаты)$/i.test(text) )
		return require('./users_commands/топ баланс для вывода.js')(context, pool);
	
	if ( /^(🖐Воры|Воры)$/i.test(text) )
		return require('./users_commands/топ воров.js')(context, pool);
	
	if ( /^(🕸Жертвы воров|Жертвы воров)$/i.test(text) )
		return require('./users_commands/топ жертв воров.js')(context, pool);
	
	if ( /^(⏳Инвесторы|Инвесторы)$/i.test(text) )
		return require('./users_commands/топ инвесторов.js')(context, pool);

	if ( /^(👥Рефоводы|Рефоводы)$/i.test(text) )
		return require('./users_commands/топ рефоводов.js')(context, pool);
	
	if ( /^Вручную$/i.test(text) )
		return require('./users_commands/пополнение и вывод вручную.js')(context);
	
	if ( /^(💻Статистика бота|Статистика бота)$/i.test(text) )
		return require('./users_commands/статистика бота.js')(context, data, pool);

	if ( /^(🔒Защитить средства|Защитить средства)$/i.test(text) )
		return require('./users_commands/защита средств.js')(context, user, pool);
	
	if ( /^(📝Активировать промокод|Активировать промокод)$/i.test(text) )
		return require('./users_commands/активировать промокод.js')(context, pool);

	if ( /^(👥Реферальная система|Реферальная система)$/i.test(text) )
		return require('./users_commands/реферальная система.js')(context, pool, vk);

	if ( /^Кексик$/i.test(text) && context.messagePayload?.command == "пополнение" )
		return require('./users_commands/пополнение кексиком.js')(context);
	
	if ( /^ЮMoney$/i.test(text) && context.messagePayload?.command == "вывод" )
		return require('./users_commands/вывод ЮMoney.js')(context, user);
	
	if ( /^ЮMoney$/i.test(text) && context.messagePayload?.command == "пополнение" )
	{
		// return context.send(`Не доступно`);
		cache[context.senderId] = { pastMessage: "пополнение yoomoney" };
		return context.send(`⬇Сколько хочешь пополнить?`);
	}

	if ( /^(📑Инвестировать|Инвестировать)$/i.test(text) )
	{
		cache[context.senderId] = { pastMessage: "инвестировать" };
		return require('./users_commands/инвестировать.js')(context, user, pool);
	}

	if ( /^(🖐Украсть|Украсть)$/i.test(text) )
	{
		cache[context.senderId] = { pastMessage: "украсть" };
		return require('./users_commands/украсть.js')(context, user);
	}

	if ( /^(🔁Репополнить|Репополнить)$/i.test(text) )
	{
		cache[context.senderId] = { pastMessage: "репополнить" };
		return require('./users_commands/репополнить.js')(context);
	}

	if ( config.owners.includes(context.senderId) )
	{
		if ( /^Добавить |^Убавить |^Присвоить /i.test(text) ) return require('./admin_commands/редактировать.js')(context, arr, pool, getUser, text);

		if ( /^Пополнить /i.test(text) ) return require('./admin_commands/пополнить.js')(context, arr, pool, getUser);
		if ( /^Вывести /i.test(text) ) return require('./admin_commands/вывести.js')(context, arr, pool, getUser);
		
		if ( /^СпособИнвестиции /i.test(text) ) return require('./admin_commands/способ инвестиции.js')(context, arr, pool);
		if ( /^Промокод /i.test(text) ) return require('./admin_commands/промокод.js')(context, arr, pool);

		if ( /^Бан /i.test(text) ) return require('./admin_commands/бан.js')(context, arr, pool, getUser);
		if ( /^Разбан /i.test(text) ) return require('./admin_commands/разбан.js')(context, arr, pool, getUser);
		if ( /^Профиль /i.test(text) ) return require('./admin_commands/посмотреть профиль.js')(context, arr, pool, getUser);

		if ( /^Команды$/i.test(text) ) return require('./admin_commands/команды.js')(context);
		if ( /^Промокоды$/i.test(text) ) return require('./admin_commands/промокоды.js')(context, pool);

		if ( /^Перемотка /i.test(text) ) return require('./admin_commands/перемотка времени.js')(context, arr, pool, data);
		
		if ( /^Создать /i.test(text) ) return require('./admin_commands/создать.js')(context, arr, pool, getUser, vk);
		if ( /^Удалить /i.test(text) )
		{
			if ( arr[1].toLowerCase() == "промокод" ) return require('./admin_commands/удалить промокод.js')(context, arr, pool);
			return require('./admin_commands/удалить.js')(context, arr, pool, getUser);
		}
	}
	
	if ( text.toLowerCase() == "да" &&  context.state.user?.pastMessage == "репополнить" ) 
	{
		if ( user.balanceForWithdrawal == 0 ) return context.send("На балансе для вывода 0 ₽");

		pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + balanceForWithdrawal, balanceForWithdrawal = 0 WHERE id = ?`, 
		[context.senderId]);

		return context.send("Деньги успешно переведены с баланса для вывода на баланс для инвестрования");
	}

	if ( !isNaN(text) ) 
	{
		if ( context.state.user?.pastMessage == "инвестировать" )
			return require('./users_commands/функция инвестирования.js')(context, user, pool);

		if ( context.state.user?.pastMessage == "пополнение yoomoney" )
			return require('./users_commands/пополнение ЮMoney.js')(context, replenishmentIsExpected);
	}

	if ( context.state.user?.pastMessage == "украсть" )
		return require('./users_commands/функция кражи.js')(context, user, data, vk, pool, getUser, sendMessage);

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

app.listen(PORT, () =>
{
	console.log(`Server started on port ${PORT}`);
})

async function run() 
{
    await vk.updates.start();
    console.log("Бот запущен!");
}
run().catch(console.error);