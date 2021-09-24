const config = require('../../config.json');
const { Message, Collection } = require('discord.js');
const { searchSong, displayResults } = require('../functions/playSong.js');
const { Together } = require('../chat-commands/together')

module.exports = {
    name: 'messageCreate',
    once: false,
    /**
     * @param {Message} interaction
     * @param {Collection} client
     */
	async execute(interaction, client) {

        if (interaction.author.bot) return;
        if (!interaction.content.startsWith(config.prefix)) return;

        const messageArgs = interaction.content.split(' ');

        switch (messageArgs[0]) {
            case `${config.prefix}play`:
                const { userParams, searchResults } = await searchSong(interaction, messageArgs)
                displayResults(interaction, userParams, searchResults, { username: interaction.author.username, avatarURL: `https://cdn.discordapp.com/avatars/${interaction.author.id}/${interaction.author.avatar}`, id: interaction.author.id })
                break;
            case `${config.prefix}together`:
                Together(interaction, client)
                break;
            default:
                break;
        }

	},
};