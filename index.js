const users = require('./data/users.json');
const data = require('./data/data.json');
const config = require('./config.json');
const utils = require('./utils.js');

const steal = require('./commands/функция кражи.js');
const invest = require('./commands/функция инвестирования.js');
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
const activatePromoCode = require('./commands/активировать промокод.js');
const edit = require('./admin_commands/редактировать.js');
const _replenish = require('./admin_commands/пополнить.js');
const _withdraw = require('./admin_commands/вывести.js');
const _delete = require('./admin_commands/удалить.js');
const create = require('./admin_commands/создать.js');
const promoCode = require('./admin_commands/промокод.js');
const investmentMethod = require('./admin_commands/способ инвестиции.js');
const deletePromoCode = require('./admin_commands/удалить промокод.js');
const ban = require('./admin_commands/бан.js');
const unban = require('./admin_commands/разбан.js');
const viewProfile = require('./admin_commands/посмотреть профиль.js');
const commands = require('./admin_commands/команды.js');

var CronJob = require('cron').CronJob;
const { VK, Keyboard } = require('vk-io');
const { QuestionManager } = require('vk-io-question');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '141.8.195.65',
    port: 3306,
    user: 'a0672554_Victor',
    password: '59rFx2RvVPGDZ9bq',
    database: 'a0672554_investing_DW_Den',
	charset: 'utf8mb4_general_ci'
});
const vk = new VK({
	token: config.group_token,
	pollingGroupId: config.group_id,
	apiMode: 'parallel_selected'
});

const questionManager = new QuestionManager();
vk.updates.use(questionManager.middleware);

const DAY = 86400000;

function everyDay()
{
	let day = Math.floor( (Date.now() - data.onlineDate) / DAY );
	if ( day < 1 ) return;

	data.statistics.newUsers = 0;
	data.statistics.weWork += 1;

	pool.query('UPDATE users SET attemptsSteal = 1 WHERE attemptsSteal = 0');
	pool.query('UPDATE users SET protection = false WHERE protection = true');
	pool.query(`
	UPDATE 
		users u, 
		usersInvestmentMethods i
	SET
		u.balanceForWithdrawal = u.balanceForWithdrawal + (u.invested * i.incomeDayPercentage / 100 - i.taxDayRubles) * IF(? > i.daysLeft, i.daysLeft, ?),
		i.daysLeft = i.daysLeft - IF(? > i.daysLeft, i.daysLeft, ?)
	WHERE
		u.investmentMethodId  = i.id
	`, [day, day, day, day]);

	let date = new Date();
	data.onlineDate = Number( new Date(date.getFullYear(), date.getMonth(), date.getDate()) );
	utils.save('./data/data.json', data);
}
everyDay();

const job = new CronJob('00 00 00 * * *', async () => 
{
	everyDay();
});
job.start();

let cache = {};

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
	}

	return user;
}

// async function createWayInvestment(method)
// {
// 	let [res] = await pool.query('INSERT INTO usersInvestmentMethods(`number`, `incomeDayPercentage`, `taxDayRubles`, `term`, `daysLeft`) VALUES(?, ?, ?, ?, ?)', 
// 	[method.id, method.incomeDayPercentage, method.taxDayRubles, method.term, method.daysLeft]);

// 	return res.insertId;
// }

// (async () =>
// {
// 	let US = await Promise.all(Object.keys(users).map(async (e) => 
// 	{
// 		return `(${e}, ${ pool.escape(users[e].name) }, ${users[e].balanceForWithdrawal}, ${users[e].balanceForInvestment}, ${users[e].invested}, ${ users[e].investmentMethod == null ? null : await createWayInvestment(users[e].investmentMethod) }, ${ pool.escape(JSON.stringify(users[e].usedInvestmentMethods)) }, ${users[e].withdrawn}, ${users[e].replenished}, ${users[e].stolenFromUser}, ${users[e].stolenByUser}, ${users[e].attemptsSteal}, ${users[e].ban}, ${users[e].protection})`
// 	}));
	
	
// 	await pool.query(`INSERT INTO users(id, name, balanceForWithdrawal, balanceForInvestment, invested, investmentMethodId, usedInvestmentMethods, withdrawn, replenished, stolenFromUser, stolenByUser, attemptsSteal, ban, protection) VALUES\n` + US.join(',\n'))
// })()


vk.updates.on('message_new', async (context) => 
{
	let user = await getUser(context.senderId);

	if ( context.senderId in cache )
	{
		context.state.user = cache[context.senderId];
		delete cache[context.senderId];
	}
	if ( !user )
	{
		let [userData] = await vk.api.users.get({user_id: context.senderId});
		
		await pool.query('INSERT INTO users(id, name) VALUES(?, ?)',
		[context.senderId, userData.first_name]);

		user = await getUser(context.senderId);
	}
	if ( user?.usedInvestmentMethods == null ) user.usedInvestmentMethods = [];
	if ( context.text == "" ) return;

	let text = context.text;
	let arr = text.split(" ");

	if ( /^(Начать|Start|Старт|Меню|Запуск|Привет|Хай|Здравствуйте|Hello)$/i.test(context.text) )
	{
		return menu(context);
	}
	if ( /^(🖥Профиль|Профиль)$/i.test(context.text) )
	{
		return profile(context, user, pool);
	}
	if ( /^(📑Инвестировать|Инвестировать)$/i.test(context.text) )
	{
		cache[context.senderId] = { pastMessage: "инвестировать" };
		return investMessage(context, user, pool);
	}
	if ( /^(🖐Украсть|Украсть)$/i.test(context.text) )
	{
		cache[context.senderId] = { pastMessage: "украсть" };
		return stealMessage(context, user);
	}
	if ( /^(⬇Пополнить|Пополнить)$/i.test(context.text) )
	{
		return replenish(context);
	}
	if ( /^(👀Топ$|^Топ)$/i.test(context.text) )
	{
		return top(context);
	}
	if ( /^(⬆Вывести|Вывести)$/i.test(context.text) )
	{
		return withdraw(context, user);
	}
	if ( /^(💰Магнаты|Магнаты)$/i.test(context.text) )
	{
		return topBalance(context, pool);
	}
	if ( /^(🖐Воры|Воры)$/i.test(context.text) )
	{
		return topThieves(context, pool);
	}
	if ( /^(🕸Жертвы воров|Жертвы воров)$/i.test(context.text) )
	{
		return topVictims(context, pool);
	}
	if ( /^(⏳Инвесторы|Инвесторы)$/i.test(context.text) )
	{
		return topInvestors(context, pool);
	}
	if ( /^Вручную$/i.test(context.text) )
	{
		return manually(context);
	}
	if ( /^(🔁Репополнить|Репополнить)$/i.test(context.text) )
	{
		cache[context.senderId] = { pastMessage: "репополнить" };
		return re_replenishment(context);
	}
	if ( /^(💻Статистика бота|Статистика бота)$/i.test(context.text) )
	{
		return statistics(context, data, pool);
	}
	if ( /^(🔒Защитить средства|Защитить средства)$/i.test(context.text) )
	{
		return protectionOfFunds(context, user, pool);
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
	if ( /^(📝Активировать промокод|Активировать промокод)$/i.test(context.text) )
	{
		return activatePromoCode(context, pool);
	}
	if ( /^промокоды$/i.test(context.text) && config.owners.includes(context.senderId) )
	{

		let [promoCodes] = await pool.query(`SELECT * FROM promoCodes`);

		promoCodes = promoCodes.map(promoCode => 
`Промокод "${promoCode.name}" 
Cумма ${+promoCode.amount} ₽ 
Количество активаций ${promoCode.numberActivations}`).join("\n\n");

		return context.send("Промокоды\n\n" + (promoCodes.length == 0 ? "Отсутствуют" : promoCodes));
	}

	if ( config.owners.includes(context.senderId) )
	{
		if ( /^Добавить|^Убавить|^Присвоить/i.test(text) ) return await edit(context, arr, pool, getUser, text);

		if ( /^Пополнить/i.test(text) ) return await _replenish(context, user, arr, pool, getUser);
		if ( /^Вывести/i.test(text) ) return await _withdraw(context, user, arr, pool, getUser);
		
		if ( /^Удалить/i.test(text) )
		{
			if ( arr[1].toLowerCase() == "промокод" ) return await deletePromoCode(context, arr, pool);
			return await _delete(context, arr, pool, getUser);
		}
		if ( /^Создать/i.test(text) ) return await create(context, arr, pool, getUser, vk);

		if ( /^СпособИнвестиции/i.test(text) ) return await investmentMethod(context, arr, pool);
		if ( /^Промокод/i.test(text) ) return await promoCode(context, arr, pool);

		if ( /^Бан/i.test(text) ) return await ban(context, arr, pool, getUser);
		if ( /^Разбан/i.test(text) ) return await unban(context, arr, pool, getUser);
		if ( /^Профиль/i.test(text) ) return await viewProfile(context, arr, pool, getUser);

		if ( /^Команды/i.test(text) ) return await commands(context);
	}
	if ( !isNaN(text) && context.state.user?.pastMessage == "инвестировать") return await invest(context, user, pool);
	if ( text.toLowerCase() == "да" &&  context.state.user?.pastMessage == "репополнить") 
	{
		if (user.balanceForWithdrawal == 0) return context.send("На балансе для вывода 0 ₽");

		pool.query(`UPDATE users SET balanceForInvestment = balanceForInvestment + balanceForWithdrawal, balanceForWithdrawal = 0 WHERE id = ?`, 
		[context.senderId]);

		return context.send("Деньги успешно переведены с баланса для вывода на баланс для инвестрования");
	}
	if ( context.state.user?.pastMessage == "украсть" )
	{
		return steal(context, user, data, vk, pool, getUser);
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

async function run() 
{
    await vk.updates.start();
    console.log("Бот запущен!");
}
run().catch(console.error);