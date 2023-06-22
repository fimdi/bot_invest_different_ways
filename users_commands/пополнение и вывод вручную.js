const { Keyboard } = require('vk-io');
const config = require('../config.json');

module.exports = (context) => 
{
    context.send(`✉ПИШИТЕ —> [id${config.owners[0]}|админу]`, {
    keyboard: Keyboard.builder()
        .urlButton({
            label: 'Админ',
            url: `https://vk.com/id${config.owners[0]}`
        })
        .inline()
    })
}