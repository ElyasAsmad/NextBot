const { SlashCommandBuilder } = require('@discordjs/builders')
const { CommandInteraction } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave and reset music queue!'),
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const guildId = interaction.guildId;

        const queue = client.queue.get(guildId);

        if (queue) {
            queue.connection.destroy()
            client.queue.delete(guildId);
            await interaction.reply('Music queue cleared!')
        }
    }
}