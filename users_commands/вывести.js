const { Keyboard } = require('vk-io');
const config = require('../config.json');

module.exports = (context, user) => 
{
    if ( user.ban ) return context.send('Ваш аккаунт заморожен, обратитесь к админу');
    
    context.send(`☑Выберите способ вывода (минимальный вывод ${config.min_withdrawal} ₽):`, {
        keyboard: Keyboard.builder()
        .textButton({
            label: 'Вручную',
            color: Keyboard.POSITIVE_COLOR
        })
        .textButton({
            label: 'ЮMoney',
            color: Keyboard.NEGATIVE_COLOR,
            payload: {
                command: 'вывод'
            }
        })
        .inline()
    });
}