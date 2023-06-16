const { Keyboard } = require('vk-io');

const top = (context) => {
    context.send(`Выбирети топ:`, {
        keyboard: Keyboard.builder()
        .textButton({
            label: '⏳Инвесторы',
            color: Keyboard.SECONDARY_COLOR
        })
        .row()
        .textButton({
            label: '🖐Воры',
            color: Keyboard.SECONDARY_COLOR
        })
        .row()
        .textButton({
            label: '🕸Жертвы воров',
            color: Keyboard.SECONDARY_COLOR
        })
        .row()
        .textButton({
            label: '💰Магнаты',
            color: Keyboard.SECONDARY_COLOR
        })
        .inline()
    });
}

module.exports = top;