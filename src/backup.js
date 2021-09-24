/**
 * @param {Channel} voiceChannel
 * @param {Interaction} interaction
 * @param {Array} searchResults 
 * @param {String} userChoice 
 */
 const queueSong = async (voiceChannel, interaction, searchResults, userChoice) => {

    const textChannel = interaction.channel;
    const guild = interaction.guild;

    const buttonClicked = parseInt(userChoice.split('_')[1])

    const queue = songQueue.get(guild.id);

    if (!queue) {
        const queueConstruct = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 1,
            playing: true
        }

        queueConstruct.songs.push(searchResults[buttonClicked])

        try {
            const connection = await connectToChannel(voiceChannel.id, guild);
            console.log(connection)
            queueConstruct.connection = connection;
            songQueue.set(guild.id, queueConstruct);

            playSong(guild, queueConstruct.songs[0]);

        } catch (error) {

            console.log(error);
            songQueue.delete(guild.id);
            return textChannel.send(error);
            
        }

    } else {

        queue.songs.push(searchResults[buttonClicked]);

        const songEmbed = new MessageEmbed()
            .setDescription(`${searchResults[buttonClicked]} has been added to the song queue!`)

        return textChannel.send({ embeds: [songEmbed] })

    }

}

/**
 * 
 * @param {String} channelId 
 * @param {Guild} guild 
 * @returns 
 */
const connectToChannel = async (channelId, guild) => {

    const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    })

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }

}

/**
 *
 * @param {Guild} guild 
 * @param {Object} songData 
 * @param {String} songData.title
 * @param {String} songData.videoId
 * @param {String} songData.url
 * @param {String} songData.channel
 * @param {String} songData.thumbnail
 * 
 */
const playSong = (guild, songData) => {

    const queue = songQueue.get(guild.id);

    if(!songData) {
        songQueue.delete(guild.id);
        return;
    }

    const playEmbed = new MessageEmbed()
        .setDescription(`🎵 Playing **${songData.title}** !`);

    queue.textChannel.send({ embeds: [playEmbed] })

}