const { Client, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageComponentInteraction } = require('discord.js');
const config = require('../../config.json');
const axios = require('axios').default;
const { unescape } = require('html-escaper');
const { SearchByKeyword } = require('./youtubeParser')
const ytdl = require('ytdl-core')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

const buttonEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

/**
 * 
 * @param {CommandInteraction} message 
 * @param {Array} messageArgs 
 */
const searchSong = (message, messageArgs) => {

    return new Promise(async (resolve, reject) => {

        await message.deferReply()

        const paramsArr = messageArgs.splice(1, messageArgs.length)

        const userParams = paramsArr.join(' ')

        try {
            const results = await SearchByKeyword(userParams, false, 5)

            const searchResults = results.items.map((item) => {
                return {
                    title: item.title,
                    videoId: item.id,
                    url: `https://www.youtube.com/watch?v=${item.id}`,
                    channel: item.shortBylineText.runs[0].text,
                    thumbnail: item.thumbnail.thumbnails.at(-1).url
                }
            })

            resolve({
                userParams: userParams,
                searchResults: searchResults
            })
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * @param {CommandInteraction} interaction
 * @param {String} userParams
 * @param {Array} results 
 */
const displayResults = async (interaction, userParams, results, userInfo, client) => {

    const resultArray = results.map((item, index) => {
        return { name: `${index + 1}. ${item.title}`, value: item.channel }
    })

    const buttonArray = []

    for (let i = 0; i < resultArray.length; i++) {
        buttonArray.push(
            new MessageButton()
                .setCustomId(`button_${i}`)
                .setLabel(buttonEmoji[i])
                .setStyle('SECONDARY')
        );
    }

    const buttonRow = new MessageActionRow()
        .addComponents(...buttonArray)

    const resultEmbed = new MessageEmbed()
        .setColor('#000000')
        .setTitle('🔍 Showing Results For ' + '`' + userParams + '`')
        .setAuthor(`Requested by ${userInfo.username}`, userInfo.avatarURL)
        .addFields(...resultArray)
        .setTimestamp()
        .setFooter('NextBot', interaction.client.user.avatarURL({ dynamic: true }))
    
    await interaction.editReply({ 
        embeds: [resultEmbed],
        components: [buttonRow] 
    })

    const filter = (message) => {
        if (message.user.id === userInfo.id) return true;
        return message.reply({ content: `You can't use this button!` })
    }

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        max: 1
    })

    collector.on('collect', btnInteraction => {
        const userChoice = btnInteraction.customId
        queueSong(interaction, results, userChoice, client, btnInteraction)
    })

}

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {Object[]} results 
 * @param {String} userChoice 
 * @param {Client} client
 * @param {MessageComponentInteraction} btnInteraction
 */
const queueSong = async (interaction, results, userChoice, client, btnInteraction) => {

    const queueEmbed = new MessageEmbed()
        .setColor('#000000')

    const choice = parseInt(userChoice.split('_')[1])
    const queue = client.queue.get(interaction.guild.id)

    const memberCache = interaction.guild.members.cache.get(interaction.member.user.id)

    const { channel } = memberCache.voice;

    if (!channel) {
        queueEmbed.setAuthor('You need to be in a voice channel first!')
        return await btnInteraction.followUp({ embeds: queueEmbed })
    }

    const song = results[choice]

    if (!queue) {

        const queueConstruct = {
            textChannel: interaction.channel,
            voiceChannel: channel,
            connection: null,
            songs: [],
            loop: false,
            volume: 20,
            playing: true,
            player: null,
            audioResource: null,
            subscription: null
        }

        queueConstruct.songs.push(song);
            
        const settings = {
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        }

        // Join Voice Channel
        const connection = joinVoiceChannel(settings)
        const player = createAudioPlayer()
        const subscription = connection.subscribe(player)

        console.log('Status 159', player.state.status)

        queueConstruct.connection = connection;
        queueConstruct.player = player
        queueConstruct.subscription = subscription

        queueConstruct.audioResource = parseAudioStream(song.url)
        queueConstruct.audioResource.volume.setVolumeLogarithmic(queueConstruct.volume / 100)

        queueConstruct.player.play(queueConstruct.audioResource)

        client.queue.set(interaction.guildId, queueConstruct)

        const playEmbed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`🎵 Now Playing: **${song.title}** !`)
            .setThumbnail(song.thumbnail)
            .setFields(
                { name: 'Requested by', value: `<@${interaction.user.id}>` }
            )

        return await btnInteraction.reply({ embeds: [playEmbed] })

    } else {

        // queue is available
        // TODO: push new song into list
        queue.player.on(AudioPlayerStatus.Idle, () => {
            console.log('player is idle')

            const nextSong = queue.songs[1]

            if (nextSong !== undefined) {

                queue.songs.shift()
    
                const audioRes = parseAudioStream(queue.songs[0].url)
    
                queue.audioResource = audioRes
                queue.audioResource.volume.setVolumeLogarithmic(queue.volume / 100)
    
                queue.player.play(audioRes)
    
                const playEmbed = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
                    .setDescription(`🎵 Now Playing: **${queue.songs[0].title}** !`)
                    .setThumbnail(queue.songs[0].thumbnail)
    
                queue.textChannel.send({ embeds: [playEmbed] })
            
            } else {

                if (queue.songs[0] !== undefined) {
                    queue.connection.destroy()
                    client.queue.delete(interaction.guildId)
                }

                interaction.channel.send({ content: 'Oh no! Your song queue has ended :( You can add more songs by typing `/play`!' })

            }

        })

        queue.player.on('error', error => {
            console.log(error)
        })

        queue.songs.push(song)



        const playEmbed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`🎵 **${song.title}** has been added to the queue !`)
            .setThumbnail(song.thumbnail)
            .setFields(
                { name: 'Requested by', value: `<@${interaction.user.id}>` }
            )

        return await btnInteraction.reply({ embeds: [playEmbed] })

    }

}

/**
 * 
 * @param {String} url 
 */
const parseAudioStream = (url) => {

    const stream = ytdl(url, {
        filter: 'audioonly'
    })

    return createAudioResource(stream, { inlineVolume: true })

}

module.exports = {
    searchSong,
    displayResults,
    parseAudioStream
}