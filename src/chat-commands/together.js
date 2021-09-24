const { Message, Client } = require('discord.js')

/**
 * 
 * @param {Message} message 
 * @param {Client} client
 */
const Together = async (message, client) => {

    if (message.member.voice.channel) {
        client.discordTogether
            .createTogetherCode(message.member.voice.channel.id, 'youtube')
            .then(async invite => {
                return message.channel.send(`${invite.code}`);
            })
    }

} 

module.exports = {
    Together
}