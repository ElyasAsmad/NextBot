const { SlashCommandBuilder } = require('@discordjs/builders')
const { CommandInteraction, MessageEmbed } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Returns the current volume if you dont provide a value for this command')
        .addStringOption(option => 
            option.setName('volume')
                .setDescription('Input a value in a range from 0 to 100')
                .setRequired(false)),
    /**
     * @param {CommandInteraction} msg 
     */
    async execute(msg, client) {

        const queue = client.queue.get(msg.guildId)

        if (msg.options.getString('volume') === '' || msg.options.getString('volume') === null) {
            const volumeEmbed = new MessageEmbed()
                .setAuthor('NextBot', msg.client.user.avatarURL({ dynamic: true }))
                .setTitle('Current Volume')
                .setDescription(queue.volume.toString())
                .setFields(
                    { name: '💡 Pro Tips', value: 'Set a new volume by providing a value (0 - 100) after typing `/volume`.\nEg. `/volume 50` ' }
                )
                .setTimestamp()
                .setFooter('NextBot 2021', msg.client.user.avatarURL({ dynamic: true }))

            msg.reply({ embeds: [volumeEmbed] })

        } else {

            const userVol = msg.options.getString('volume')

            const constructNew = { ...queue, volume: parseInt(userVol) }
            client.queue.set(msg.guildId, constructNew)

            queue.audioResource.volume.setVolumeLogarithmic(userVol / 100)

            const volEmbed = new MessageEmbed()
                .setAuthor('NextBot', msg.client.user.avatarURL({ dynamic: true }))
                .setTitle('Change Volume')
                .setDescription('🎵 NextBot volume has been set to ' + userVol + '%')
                .setTimestamp()
                .setFooter('NextBot 2021', msg.client.user.avatarURL({ dynamic: true }))

            msg.reply({ embeds: [volEmbed] })

        }
    }
}