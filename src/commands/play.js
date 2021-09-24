const { SlashCommandBuilder } = require('@discordjs/builders')
const { CommandInteraction } = require('discord.js')
const { searchSong, displayResults, playSong } = require('../functions/playSong')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song in your voice channel!')
        .addStringOption(option => 
            option.setName('song')
                .setDescription('Input a song name to be played')
                .setRequired(true)),
    /**
     * @param {CommandInteraction} msg 
     */
    async execute(msg, client) {
        const songArgs = ['/play', ...msg.options.getString('song').split(' ')];

        const { userParams, searchResults } = await searchSong(msg, songArgs);
        displayResults(msg, userParams, searchResults, { username: msg.user.username, avatarURL: `https://cdn.discordapp.com/avatars/${msg.user.id}/${msg.user.avatar}`, id: msg.user.id }, client)

    }
}