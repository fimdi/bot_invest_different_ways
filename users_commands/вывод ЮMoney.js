module.exports = (context, user) =>
{
    if ( user.ban ) return context.send('Ваш аккаунт заморожен, обратитесь к админу');

    context.send("Не доступно");
}