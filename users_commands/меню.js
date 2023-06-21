const { Keyboard } = require('vk-io');
const config = require('../config.json');

module.exports = (context) => 
{
    let text = context.text.toLowerCase() == "меню" ? "Меню:" : 
`Приветствую тебя!
Здесь ты сможешь заработать рубли!
	
Для удобства у тебя появится клавиатура 🙂

Продолжая пользоваться ботом, вы принимаете "пользовательское соглашение": ${config.user_agreement}`;
	
	context.send({
        peer_id: context.peer_Id,
        message: text,
        keyboard: Keyboard.builder()
        .textButton({
            label: '🖥Профиль',
            color: Keyboard.SECONDARY_COLOR
        })
		.row()
        .textButton({
            label: '📑Инвестировать',
            color: Keyboard.POSITIVE_COLOR
        })
        .textButton({
            label: '🖐Украсть',
            color: Keyboard.NEGATIVE_COLOR
        })
		.row()
        .textButton({
            label: '⬇Пополнить',
            color: Keyboard.POSITIVE_COLOR
        })
        .textButton({
            label: '🔁Репополнить',
            color: Keyboard.POSITIVE_COLOR
        })
        .row()
        .textButton({
            label: '⬆Вывести',
            color: Keyboard.POSITIVE_COLOR
        })
        .row()
        .textButton({
            label: '👀Топ',
            color: Keyboard.PRIMARY_COLOR
        })
        .textButton({
            label: '💻Статистика бота',
            color: Keyboard.PRIMARY_COLOR
        })
        .row()
        .textButton({
            label: '👥Реферальная система',
            color: Keyboard.PRIMARY_COLOR
        })
    });
}