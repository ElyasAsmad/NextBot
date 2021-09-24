const { SlashCommandBuilder } = require('@discordjs/builders')
const { CommandInteraction, MessageEmbed } = require('discord.js')
const ytdl = require('ytdl-core')
const { createAudioResource } = require('@discordjs/voice')

const parseAudioStream = (url) => {

    const stream = ytdl(url, {
        filter: 'audioonly'
    })

    return createAudioResource(stream, { inlineVolume: true })

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip current song to the next song!'),
    /**
     * @param {CommandInteraction} msg 
     * @param {Map} client
     */
    async execute(msg, client) {
        
        const queue = client.queue.get(msg.guildId)

        queue.playing = false

        const skipEmbed = new MessageEmbed()
            .setTitle(`**${msg.guild.name}**`)
            .setDescription(`🎵 Skipping **${queue.songs[0].title}** now!`)
            .setThumbnail(msg.guild.iconURL())
            .setTimestamp()

        msg.reply({ embeds: [skipEmbed] })

        queue.player.stop()

    }
}