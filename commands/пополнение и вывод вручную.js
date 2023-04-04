const { Keyboard } = require('vk-io');

const manually = (context) => 
{
    context.send("✉ПИШИТЕ —> [id566928444|админу]", {
    keyboard: Keyboard.builder()
        .urlButton({
            label: 'Админ',
            url: 'https://vk.com/gfk00'
        })
        .inline()
    })
}

module.exports = manually;