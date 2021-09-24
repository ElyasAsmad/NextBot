const axios = require('axios').default
const youtubeEndpoint=`https://www.youtube.com`;

let GetYoutubeInitData = async (url) => {
    return new Promise((resolve, reject) => {
        axios.get(encodeURI(url)).then(page => {
            const data = page.data.split('var ytInitialData =')[1]
                .split("</script>")[0]
                .slice(0, -1);
            var apiToken =null;
            if (page.data.split("innertubeApiKey").length > 0) {
                apiToken = page.data.split("innertubeApiKey")[1].trim().split(",")[0].split('"')[2];
            }
            var context = null;
            if (page.data.split('INNERTUBE_CONTEXT').length > 0){
                context = JSON.parse(page.data.split('INNERTUBE_CONTEXT')[1].trim().slice(2, -2));
            }

            const initdata = JSON.parse(data);
            resolve({ initdata, apiToken, context})

        }).catch(err => {

            console.error(err);
            reject(err);

        })
    })
};

let GetData = async (keyword, withPlaylist = false, limit = 0) => {
    // let endpoint = `${youtubeEndpoint}/results?search_query=${keyword}`;
    let endpoint = `${youtubeEndpoint}/results?q=${keyword}&hl=en`
    return new Promise((resolve, reject) => {
        GetYoutubeInitData(endpoint).then(async page => {
            const sectionListRenderer =await page.initdata.contents
                .twoColumnSearchResultsRenderer
                .primaryContents
                .sectionListRenderer;
            let contToken = {};
            let items = [];
            await sectionListRenderer.contents.forEach(content => {
                if(content.continuationItemRenderer) {
                    contToken = content.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
                }else if(content.itemSectionRenderer) {
                    content.itemSectionRenderer.contents.forEach((item) => {
                        if(item.channelRenderer) {
                            let channelRenderer = item.channelRenderer;
                            items.push({ id: channelRenderer.channelId, type: 'channel', thumbnail: channelRenderer.thumbnail, title: channelRenderer.title.simpleText });
                        } else {
                            let videoRender = item.videoRenderer;
                            let playListRender = item.playlistRenderer;
                            
                            if (videoRender && videoRender.videoId) {
                                items.push(VideoRender(item));
                            }
                            if (withPlaylist) {
                                if (playListRender && playListRender.playlistId) {
                                    items.push({ id: playListRender.playlistId, type: 'playlist', thumbnail: playListRender.thumbnails, title: playListRender.title.simpleText, length: playListRender.videoCount, videos: playListRender.videos, videoCount: playListRender.videoCount, isLive:false });
                                }
                            }
                        }
                    });
                }
            });
            const apiToken = await page.apiToken;
            const context = await page.context;
            let nextPageContext = { context: context, continuation: contToken };

            const others = { nextPage: { nextPageToken: apiToken, nextPageContext: nextPageContext } }

            if (limit > 0) {
                resolve({ items: items.slice(0, limit), ...others })
            } else {
                resolve({ items: items, ...others })
            }
        }).catch(err => {
            console.error(err);
            reject(err);
        });
    });
};

let VideoRender = (json) => {
    try {
        if(json && (json.videoRenderer||json.playlistVideoRenderer)) {
            let videoRenderer= null;
            if (json.videoRenderer) {
                videoRenderer=json.videoRenderer
            }else if(json.playlistVideoRenderer) {
                videoRenderer=json.playlistVideoRenderer
            }
            var isLive=false;
            if (videoRenderer.badges&&videoRenderer.badges.length>0&&videoRenderer.badges[0].metadataBadgeRenderer&&videoRenderer.badges[0].metadataBadgeRenderer.style=="BADGE_STYLE_TYPE_LIVE_NOW") {
                isLive=true;
            }
            if (videoRenderer.thumbnailOverlays) {
                videoRenderer.thumbnailOverlays.forEach(item=>{
                    if(item.thumbnailOverlayTimeStatusRenderer&&item.thumbnailOverlayTimeStatusRenderer.style&&item.thumbnailOverlayTimeStatusRenderer.style=="LIVE") {
                        isLive=true;
                    }
                });
            }
            let id=videoRenderer.videoId;
            let thumbnail=videoRenderer.thumbnail;
            let title=videoRenderer.title.runs[0].text;
            let shortBylineText = (videoRenderer.shortBylineText)?videoRenderer.shortBylineText:'';
            let lengthText=(videoRenderer.lengthText)?videoRenderer.lengthText:'';
            return { id: id, type: 'video', thumbnail: thumbnail, title: title, shortBylineText: shortBylineText, length: lengthText, isLive:isLive };
        } else {
            return {};
        }
    }catch (ex) {
        throw ex;
    }
}

module.exports = {
    SearchByKeyword: GetData
}