const { resolveResource } = require('vk-io');
const utils = require('../utils.js');

function steal(context, user, data, pool, selectedUser, id, sendMessage)
{
    let sum = utils.rounding(user.invested * 0.1); // 10% от инвестирования

    if ( user.invested == 0 ) return context.send("Для кражи необходимо инвестировать");
    if ( user.attemptsSteal == 0 ) return context.send("На сегодня у вас осталось 0 попыток");
    if ( selectedUser.protection ) return context.send("Этот пользователь защищён от краж до 00:00");
    if ( selectedUser.balanceForWithdrawal <= 0 ) return context.send("У этого пользователя нет денег");
    if ( selectedUser.balanceForWithdrawal < sum ) sum = selectedUser.balanceForWithdrawal;
    
    let halfSum = utils.rounding(sum / 2);

    pool.query(`
    UPDATE 
        users 
    SET 
        balanceForWithdrawal = ?,
        stolenFromUser = ?
    WHERE 
        id = ?`, [selectedUser.balanceForWithdrawal - sum, selectedUser.stolenFromUser + sum, id]);

    pool.query(`
    UPDATE
        users
    SET
        balanceForWithdrawal = ?,
        stolenByUser = ?,
        attemptsSteal = attemptsSteal - 1
    WHERE
        id = ?
    `, [user.balanceForWithdrawal + halfSum, user.stolenByUser + sum, context.senderId]);
    data.statistics.incomeFromThefts = utils.rounding( data.statistics.incomeFromThefts + halfSum ); // половина боту

    context.send(`Вы украли ${ utils.prettify(sum) } ₽, но донести до дома вы смогли только половину: ${ utils.prettify(halfSum) } ₽`);
    
    sendMessage(id, `[id${ context.senderId }|Вор] украл у вас ${ utils.prettify(sum) } ₽, отомсти ему! ID: ${ context.senderId }`);

    utils.save('./data.json', data);
}

module.exports = async (context, user, data, vk, pool, getUser, sendMessage) =>
{
    let selectedUser = await getUser(context.text);
    if ( selectedUser ) return steal(context, user, data, pool, selectedUser, +context.text, sendMessage);

	const resource = await resolveResource({ api: vk.api, resource: context.text })
	.catch(err => { return context.send("Пользователь не найден"); });

	if ( resource?.type == 'user' )
	{
        selectedUser = await getUser(resource.id);
		if ( selectedUser ) return steal(context, user, data, pool, selectedUser, resource.id, sendMessage);

		return context.send("Данный пользователь не зарегистрирован в боте");
	}
}