const { Interaction } = require('discord.js')

module.exports = {
	name: 'interactionCreate',

    /**
     * @param {Interaction} interaction 
     */
	async execute(interaction, client) {

        if (interaction.isCommand()) {

            const { client } = interaction
    
            const command = client.commands.get(interaction.commandName)
    
            if (!command) return;
    
            try {
                await command.execute(interaction, client)
            } catch (error) {
                await interaction.channel.send({ content: 'Oops, an error occured!', ephemeral: true })
                console.log(error)
            }

        }

	}
};