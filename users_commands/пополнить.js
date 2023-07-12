const { Keyboard } = require('vk-io');

module.exports = (context) => 
{
    context.send(`💳Выберите способ пополнения:`, {
        keyboard: Keyboard.builder()
        .textButton({
            label: 'Вручную',
            color: Keyboard.POSITIVE_COLOR
        })
        .textButton({
            label: 'ЮMoney',
            color: Keyboard.POSITIVE_COLOR,
            payload: {
                command: 'пополнение'
            }
        })
        .textButton({
            label: 'Кексик',
            color: Keyboard.NEGATIVE_COLOR,
            payload: {
                command: 'пополнение'
            }
        })
        .inline()
    });
}