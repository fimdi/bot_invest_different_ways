const invest = (context, users, data) =>
{
	let id = +context.text;

	if ( users[context.senderId].balanceForInvestment == 0 ) return context.send("Вам нечего инвестировать");
	if ( !data.investmentMethods[id] ) return context.send("Такого способа инвестирования нет");
	if ( id == users[context.senderId].investmentMethod?.id ) return context.send("Этот способ уже используется вами, выберите другой");
	if ( users[context.senderId].usedInvestmentMethods.includes(id) ) return context.send("Этот способ уже использьзован вами");
    	
	if ( users[context.senderId].investmentMethod?.id ) users[context.senderId].usedInvestmentMethods.push( users[context.senderId].investmentMethod.id );
	users[context.senderId].invested = users[context.senderId].balanceForInvestment;
	users[context.senderId].balanceForInvestment = 0;
	users[context.senderId].investmentMethod = 
	{
        "id": id,
        "incomeDayPercentage": data.investmentMethods[id].incomeDayPercentage,
        "taxDayRubles": data.investmentMethods[id].taxDayRubles,
        "term": data.investmentMethods[id].term,
		"daysLeft": data.investmentMethods[id].term
    }
        
    context.send("Успешно инвестировали"); 
}

module.exports = invest;