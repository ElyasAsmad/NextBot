const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, CommandInteraction } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Replies with the current song queue in your server!'),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {*} client 
     */
    async execute(interaction, client) {

        const queue = client.queue.get(interaction.guildId)

        if (!queue) {
            const errEmbed = new MessageEmbed()
                .setAuthor(interaction.client.user.username, interaction.client.user.avatarURL({ dynamic: true }))
                .setDescription(`We didn't have any song queue right now! Join a voice channel and request a song! :)`)

            return interaction.reply({ embeds: [errEmbed] })
        }

        const { songs } = queue;

        const songQueue = songs.map((item, index) => {
            return { name: `${index + 1}. ${item.title}`, value: item.channel }
        })

        const queueEmbed = new MessageEmbed()
            .setTitle(`**${interaction.guild.name}**`)
            .setDescription('🎵 Current Song Queue')
            .setThumbnail(interaction.guild.iconURL())
            .setFields(
                ...songQueue
            )
            .setTimestamp()
            .setFooter('NextBot 2021', interaction.client.user.avatarURL({ dynamic: true }))

        interaction.reply({ embeds: [queueEmbed] })

    }
}