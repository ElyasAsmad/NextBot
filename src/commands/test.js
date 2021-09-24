const { SlashCommandBuilder } = require('@discordjs/builders')
const { Message } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test argument'),
    /**
     * @param {Message} msg 
     */
    async execute(msg) {
        console.log(msg)
    }
}