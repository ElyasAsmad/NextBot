const { SlashCommandBuilder } = require('@discordjs/builders')
const { Client, CommandInteraction } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('together')
        .setDescription('Watch YouTube together!'),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const memberCache = interaction.guild.members.cache.get(interaction.user.id)
        if(memberCache.voice.channel) {
            const invite = await client.discordTogether.createTogetherCode(memberCache.voice.channel, 'youtube')
            return interaction.channel.send(`Click here: ${invite.code}`)
        }
    }
}