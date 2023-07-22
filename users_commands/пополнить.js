const { Keyboard } = require('vk-io');
const config = require('../config.json');

module.exports = (context) => 
{
    context.send(`💳Выберите способ пополнения:`, {
        keyboard: Keyboard.builder()
        .textButton({
            label: 'Вручную',
            color: Keyboard.POSITIVE_COLOR
        })
        .urlButton({
            label: 'Кексик',
	        url: config.link_keksik,
            color: Keyboard.POSITIVE_COLOR,
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