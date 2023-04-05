const editCommand = async (context, arr, users, startProfile, vk) => 
{
    const [ , id, command, number] = arr;
    
    if (arr.length == 1) {
        return context.send(
`ред {ID} {команда} {число}

Команды:

пополнить
инвестировать
баланс

бан
разбан
обнулить

Например:
ред 566928444 пополнить 10
ред 566928444 обнулить
`);
    }
    if ( !(id in users) ) 
    {
        return context.send('Такого id нету');
    }
    if ( command == "обнулить" )
    {
        let [userData] = await vk.api.users.get({user_id: id});
        
        users[id] = JSON.parse(startProfile);
        users[id].name = userData.first_name;
            
        return context.send(`Пользователь с ID ${id} обнулён`);
    }
    if ( command == "бан" )
    {
        users[id].ban = true;
            
        return context.send(`Пользователь с ID ${id} забанен`);
    }
    if ( command == "разбан" )
    {
        users[id].ban = false;
            
        return context.send(`Пользователь с ID ${id} разбанен`);
    }
    if (command != "пополнить" && command != "инвестировать" && command != "баланс")
    {
        return context.send(`ред ${id} {команда} {число}`);
    }
    if ( isNaN(number) )
    {
        return context.send(`ред ${id} ${command} {число}`);
    }
    
    if ( command == "пополнить" )
    {
        users[id].replenished += number;
        users[id].balanceForInvestment += number;

        return context.send(`Пользователю с ID ${id} на баланс для инвестирования было зачислено ${number}`);
    }
    if ( command == "баланс" )
    {
        users[id].balanceForWithdrawal += number;
        return context.send(`Пользователю с ID ${id} на баланс для вывода было зачислено ${number}`);
    }
    if ( command == "инвестировать" )
    {
        users[id].invested += number;
        return context.send(`Пользователю с ID ${id} было инвестировано ${number}`);
    }
}

module.exports = editCommand;