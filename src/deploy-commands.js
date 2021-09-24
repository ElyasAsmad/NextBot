const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { token } = require('../config.json')
const fs = require('fs')

const guildId = '653140386218377227'
const clientId = '888150455396479016'

const commands = []
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        )

        console.log('Successfully registered application commands!')
    } catch (error) {
        console.log(error)
    }
})();