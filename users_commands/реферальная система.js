const config = require('../config.json');

module.exports = async (context, pool, vk) =>
{
    let refLink = await vk.api.utils.getShortLink({
        url: `vk.com/write-${config.group_id}?ref=${context.senderId}`
    }).then((data) => {
        return data.short_url
    });
    let [userReferrals] = await pool.query(`SELECT * FROM referrals WHERE userId = ?`, [context.senderId]);
    
    console.log(userReferrals);

    context.send(`🔀Ваша реферальная ссылка:
${refLink}
    
💾За реферала вам будет начислено ${config.receive_refovod} ₽, а рефералу ${config.receive_referral} ₽ (на баланс для инвестирования)
    
✏Приглашено вами: ${userReferrals.length}`);
}