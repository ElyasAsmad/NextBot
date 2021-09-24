const axios = require('axios').default;
const { Message } = require('discord.js')
const config = require('../../config.json')

/**
 * @param {Message} interaction 
 */
export const searchMusic = async (interaction) => {

    const searchResults = []
    const currentVoiceChannel = interaction.member.voice.channel;

    if(!currentVoiceChannel) {
        return await interaction.reply('Please join a voice channel first!')
    }

    const permissions = currentVoiceChannel.permissionsFor(interaction.client.user);

    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return await interaction.reply(`Sorry, I don't have permission to join that channel :(`)
    }

    // Music Search System
    axios.get(`https://www.googleapis.com/youtube/v3/search?key=${config.googleAPIkey}&q=${args}&part=snippet`)

}