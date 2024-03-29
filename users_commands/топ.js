const { Keyboard } = require('vk-io');

module.exports = (context) => 
{
    context.send(`Выберите топ:`, {
        keyboard: Keyboard.builder()
        .textButton({
            label: '⏳Инвесторы',
            color: Keyboard.SECONDARY_COLOR
        })
        .row()
        .textButton({
            label: '💰Магнаты',
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
            label: '👥Рефоводы',
            color: Keyboard.SECONDARY_COLOR
        })
        .inline()
    });
}