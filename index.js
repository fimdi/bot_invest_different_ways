const data = require('./data.json');
const config = require('./config.json');
const utils = require('./utils.js');

const { VK, Keyboard } = require('vk-io');
const { QuestionManager } = require('vk-io-question');
const mysql = require('mysql2/promise');
var CronJob = require('cron').CronJob;

const pool = mysql.createPool({
    host: '141.8.195.65',
    port: 3306,
    user: 'a0672554_Victor',
    password: '59rFx2RvVPGDZ9bq',
    database: 'a0672554_investing_DW_Victor',
	charset: 'utf8mb4_general_ci'
});
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
	data.statistics.weWork += 1;

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

vk.updates.on('message_new', async (context) => 
{
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

	if ( context.text == "" ) return;

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
	
	if ( /^ЮMoney$/i.test(text) && context.messagePayload?.command == "пополнение" )
		return require('./users_commands/вывод ЮMoney.js')(context, user);
	
	if ( /^ЮMoney$/i.test(text) && context.messagePayload?.command == "вывод" )
		return require('./users_commands/пополнение ЮMoney.js')(context);
	
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
		if ( /^Добавить|^Убавить|^Присвоить/i.test(text) ) return require('./admin_commands/редактировать.js')(context, arr, pool, getUser, text);

		if ( /^Пополнить/i.test(text) ) return require('./admin_commands/пополнить.js')(context, user, arr, pool, getUser);
		if ( /^Вывести/i.test(text) ) return require('./admin_commands/вывести.js')(context, user, arr, pool, getUser);
		
		if ( /^СпособИнвестиции/i.test(text) ) return require('./admin_commands/способ инвестиции.js')(context, arr, pool);
		if ( /^Промокод/i.test(text) ) return require('./admin_commands/промокод.js')(context, arr, pool);

		if ( /^Бан/i.test(text) ) return require('./admin_commands/бан.js')(context, arr, pool, getUser);
		if ( /^Разбан/i.test(text) ) return require('./admin_commands/разбан.js')(context, arr, pool, getUser);
		if ( /^Профиль/i.test(text) ) return require('./admin_commands/посмотреть профиль.js')(context, arr, pool, getUser);

		if ( /^Команды/i.test(text) ) return require('./admin_commands/команды.js')(context);
		if ( /^промокоды$/i.test(text) ) return require('./admin_commands/промокоды.js')(context);

		if ( /^Создать/i.test(text) ) return require('./admin_commands/создать.js')(context, arr, pool, getUser, vk);
		if ( /^Удалить/i.test(text) )
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

	if ( !isNaN(text) && context.state.user?.pastMessage == "инвестировать" ) 
		return require('./users_commands/функция инвестирования.js')(context, user, pool);

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

async function run() 
{
    await vk.updates.start();
    console.log("Бот запущен!");
}
run().catch(console.error);