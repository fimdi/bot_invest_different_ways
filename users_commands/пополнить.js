const { Keyboard } = require('vk-io');

const replenish = (context) => {
    context.send(`💳Выберите способ пополнения:`, {
        keyboard: Keyboard.builder()
        .textButton({
            label: 'Вручную',
            color: Keyboard.POSITIVE_COLOR
        })
        .textButton({
            label: 'Кексик',
            color: Keyboard.NEGATIVE_COLOR,
            payload: {
                command: 'пополнение'
            }
        })
        .textButton({
            label: 'ЮMoney',
            color: Keyboard.NEGATIVE_COLOR,
            payload: {
                command: 'пополнение'
            }
        })
        .inline()
    });
}

module.exports = replenish;