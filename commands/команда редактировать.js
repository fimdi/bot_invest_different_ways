const editCommand = async (context, arr, users, startProfile, vk) => 
{
    if (arr.length == 1) {
        return context.send(
`ред {ID} {команда} {число}

Команды:
обнулить
пополнить
инвестировать
баланс

Например:
ред 566928444 пополнить 10
ред 566928444 обнулить
`);
    }
    if ( !(arr[1] in users) ) 
    {
        return context.send('Такого id нету');
    }
    if ( arr[2] == "обнулить" )
    {
        let id = +arr[1];
        let [userData] = await vk.api.users.get({user_id: id});
        
        users[id] = JSON.parse(startProfile);
        users[id].name = userData.first_name;
            
        return context.send("Успешно");
    }
    if (arr[2] != "пополнить" && arr[2] != "инвестировать" && arr[2] != "баланс")
    {
        return context.send(`ред ${arr[1]} {команда} {число}`);
    }
    if ( isNaN(arr[3]) ) 
    {
        return context.send(`ред ${arr[1]} ${arr[2]} {число}`);
    }
    
    if ( arr[2] == "пополнить" )
    {
        users[arr[1]].replenished += +arr[3];
        users[arr[1]].balanceForInvestment += +arr[3];

        return context.send("Успешно");
    }
    if ( arr[2] == "баланс" )
    {
        users[arr[1]].balanceForWithdrawal += +arr[3];
        return context.send("Успешно");
    }
    if ( arr[2] == "инвестировать" )
    {
        users[arr[1]].invested += +arr[3];
        return context.send("Успешно");
    }

    context.send("test");
}

module.exports = editCommand;