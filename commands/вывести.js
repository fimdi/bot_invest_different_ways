const { Keyboard } = require('vk-io');

const withdraw = (context, users) => {
    if (users[context.senderId].ban) return context.send('Ваш аккаунт заморожен, обратитесь к админу');
    
    context.send(`☑Выберите способ вывода (минимальный вывод 10 ₽):`, {
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

module.exports = withdraw;