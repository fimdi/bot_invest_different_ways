const utils = require('../utils.js');
const { Keyboard } = require('vk-io');

module.exports = async (context, number, listInvestmentMethods, user) =>
{
    let investmentMethod = listInvestmentMethods.find(el => el.number == number);
    let colorInvestButton = user.usedInvestmentMethods.includes(number) || user.balanceForInvestment > investmentMethod.maximumInvestment ? Keyboard.NEGATIVE_COLOR : Keyboard.POSITIVE_COLOR;

    if ( number == listInvestmentMethods[0].number )
        return context.send(utils.displayInvestmentMethod(investmentMethod), {
            keyboard: Keyboard.builder()
            .textButton({
                label: '➡Вперёд',
                color: Keyboard.SECONDARY_COLOR,
                payload: {
                    nextNumber: number + 1
                }
            })
            .row()
            .textButton({
                label: '🔢Выбрать по номеру',
                color: Keyboard.SECONDARY_COLOR
            })
            .row()
            .textButton({
                label: '✅Инвестировать',
                color: colorInvestButton,
                payload: {
                    number
                }
            })
            .inline()
        });

    if ( number == listInvestmentMethods[listInvestmentMethods.length - 1].number )
    return context.send(utils.displayInvestmentMethod(investmentMethod), {
        keyboard: Keyboard.builder()
        .textButton({
            label: '⬅Назад️',
            color: Keyboard.SECONDARY_COLOR,
            payload: {
                backNumber: number - 1
            }
        })
        .row()
        .textButton({
            label: '🔢Выбрать по номеру',
            color: Keyboard.SECONDARY_COLOR
        })
        .row()
        .textButton({
            label: '✅Инвестировать',
            color: colorInvestButton,
            payload: {
                number
            }
        })
        .inline()
    });
    
    return context.send(utils.displayInvestmentMethod(investmentMethod), {
        keyboard: Keyboard.builder()
        .textButton({
            label: '⬅Назад️',
            color: Keyboard.SECONDARY_COLOR,
            payload: {
                backNumber: number - 1
            }
        })
        .textButton({
            label: '➡Вперёд',
            color: Keyboard.SECONDARY_COLOR,
            payload: {
                nextNumber: number + 1
            }
        })
        .row()
        .textButton({
            label: '🔢Выбрать по номеру',
            color: Keyboard.SECONDARY_COLOR
        })
        .row()
        .textButton({
            label: '✅Инвестировать',
            color: colorInvestButton,
            payload: {
                number
            }
        })
        .inline()
    });
}