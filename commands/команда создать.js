const utils = require('../utils.js');

const createCommand = async (context, arr, users, startProfile, vk, data) => 
{
    if (arr.length == 1) return context.send(
`создать {ID}
создать {процент дохода} {налог} {срок}`);
    
    if (arr.length == 2)
    {
        let id = +arr[1];
        let [userData] = await vk.api.users.get({user_id: id});
	
        users[id] = JSON.parse(startProfile);
	    users[id].name = userData.first_name;

        return context.send("Успешно");
    }
    if (arr.length == 4)
    {
        const arrId = Object.keys(data.investmentMethods);
        const size = Object.keys(data.investmentMethods).length;
        let maxId = 1;

        for (let i = 0; i < size; i++)
        {
            if (+arrId[i] > maxId) maxId = arrId[i];
        }


        const new_id = +maxId + 1;
        const res = await context.question(
`Правильно?

№ ${new_id}
${arr[1] >= 0 ? "Доход" : "Расход"} в день: ${Math.abs(arr[1])} %
Налог в день: ${arr[2]} ₽
Срок ${arr[3]} ${ utils.lineEnding(arr[3], ["день", "дня", "дней"]) }`);

        
    if (res.text.toLowerCase() == "да")
        {
            data.investmentMethods[new_id] = {
                "incomeDayPercentage": +arr[1],
                "taxDayRubles": +arr[2],
                "term": +arr[3]
            }

            return context.send("Успешно");
        }
    }
    
    context.send("Не успешно");
}

module.exports = createCommand;