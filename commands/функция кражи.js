const { resolveResource } = require('vk-io');
const utils = require('../utils.js');

function steal(context, user, data, vk, pool, selectedUser, id)
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
    // selectedUser.balanceForWithdrawal = utils.rounding( selectedUser.balanceForWithdrawal - sum );
    // selectedUser.stolenFromUser = utils.rounding( selectedUser.stolenFromUser + sum );
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
    // user.balanceForWithdrawal = utils.rounding( user.balanceForWithdrawal + halfSum ); // половина пользователю
    // user.stolenByUser = utils.rounding( user.stolenByUser + sum );
    // user.attemptsSteal -= 1;
    data.statistics.incomeFromThefts = utils.rounding( data.statistics.incomeFromThefts + halfSum ); // половина боту

    context.send(`Вы украли ${ sum } ₽, но донести до дома вы смогли только половину: ${ halfSum } ₽`);
    
    vk.api.messages.send({
        user_id: id,
        random_id: Date.now(),
        message: `[id${ context.senderId }|Вор] украл у вас ${ sum } ₽, отомсти ему! ID: ${ context.senderId }`
    })

    utils.save('./data/data.json', data);
}

module.exports = async (context, user, data, vk, pool, getUser) =>
{
    let selectedUser = await getUser(context.text);
    if ( selectedUser ) return steal(context, user, data, vk, pool, selectedUser, id);

	const resource = await resolveResource({ api: vk.api, resource: context.text })
	.catch(err => { return context.send("Пользователь не найден"); });

	if ( resource?.type == 'user' )
	{
        selectedUser = await getUser(resource.id);
		if ( selectedUser ) return steal(context, user, data, vk, pool, selectedUser, resource.id);

		return context.send("Данный пользователь не зарегистрирован в боте");
	}
}