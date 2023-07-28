const { Keyboard } = require('vk-io');
const config = require('../config.json');
const utils = require('../utils.js');
const applicationStorageTime = 3600000;

module.exports = (context, replenishmentIsExpected) =>
{
    if ( context.senderId in replenishmentIsExpected )
    {
        clearTimeout(replenishmentIsExpected[context.senderId].timerId);
    }

    let timerId = setTimeout(() =>
    {
        delete replenishmentIsExpected[context.senderId];
    }, applicationStorageTime);

    replenishmentIsExpected[context.senderId] = { 
        amount: +context.text, 
        label: `bot_invest_DW|${context.senderId}|${utils.randomSymbolsGenerator(8)}`, 
        date: Date.now(), 
        timerId 
    };

    console.log(`https://yoomoney.ru/quickpay/confirm.xml?receiver=${config.number_yoomoney}` +
    `&quickpay-form=button&paymentType=PC&sum=${+context.text}` +
    `&label=${replenishmentIsExpected[context.senderId].label}&successURL=https://vk.com/public${config.group_id}`);

    context.send(`✉Заявка на пополнение.

⏰Действует час.
    
🔩Деньги должны зачислиться автоматически.
В случае проблем обращайтесь к администрации.`, {
        keyboard: Keyboard.builder()
        .urlButton({
            label: 'Пополнить',
            color: Keyboard.POSITIVE_COLOR,
            url: `https://yoomoney.ru/quickpay/confirm.xml?receiver=${config.number_yoomoney}` +
            `&quickpay-form=button&paymentType=PC&sum=${+context.text}` +
            `&label=${replenishmentIsExpected[context.senderId].label}&successURL=https://vk.com/public${config.group_id}`
        })
        .inline()
    });
}