const { SlashCommandBuilder } = require('@discordjs/builders')
const { Message, MessageEmbed } = require('discord.js')
const moment = require('moment')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Replies with server info!'),
    /**
     * @param {Message} interaction 
     */
    async execute(interaction) {
        const serverInfoEmbed = new MessageEmbed()
            .setColor('#000000')
            .setTitle(interaction.guild.name)
            .setDescription(`Server created at ${moment(interaction.guild.createdAt).format('D MMMM YYYY [@] hh:mm a')}\n(About ${moment(interaction.guild.createdAt).fromNow()})`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Server Owner', value: `<@${interaction.guild.ownerId}>`, inline: true },
                { name: '🆔 Server ID', value: interaction.guild.id, inline: true },
                { name: '👥 Members', value: `Total Members: **${interaction.guild.memberCount}**`, inline: true },
            )
            .setFooter('NextBot')

        await interaction.reply({ embeds: [serverInfoEmbed] })
    }
}