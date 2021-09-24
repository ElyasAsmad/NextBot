const yt = require('youtube-search-without-api-key')

const testData = async () => {

    const videos = await yt.search('Alan Walker Faded')

    console.log(videos)

}

testData()