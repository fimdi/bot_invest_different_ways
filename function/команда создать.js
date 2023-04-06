const createCommand = async (context, arr, users, startProfile, vk) => 
{
    if (arr.length == 1) return context.send(`создать {ID}`);
    
    let id = +arr[1];
    let [userData] = await vk.api.users.get({user_id: id});
	
    users[id] = JSON.parse(startProfile);
	users[id].name = userData.first_name;

    context.send("Успешно");
}

module.exports = createCommand;