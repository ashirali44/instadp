const fetchMediaResponse = function fetchMedia(apiData) {
    var data = apiData['items'][0];
    var tempData = {
        success: false,
        url: '',
        type: '',
    }

    if (data != null && data['video_versions'] && data['video_versions'].length > 0) {
        tempData.type = 'VIDEO';
        tempData.success = true;
        tempData.duration = data['video_duration'];
        tempData.url = data['video_versions'][0].url;
        tempData.thumbnail = data['image_versions2'].candidates[0].url;
    } else {
        var image_urls = [];
        if (data['carousel_media'] && data['carousel_media'].length > 0) {
            for (let a = 0; a < data['carousel_media'].length; a++) {
                image_urls.push(data['carousel_media'][a]['image_versions2']['candidates'][0].url);
            }
        } else {
            image_urls.push(data['image_versions2'].candidates[0].url);
        }
        tempData.type = 'IMAGE';
        tempData.success = true;
        tempData.url = image_urls;
    }

    return tempData;

}


const fetchStoriesfromApi = function fetchStories(apiresponse) {

    var stories = [];
    var tempData = {
        success: false,
        stories: [],
        type: 'STORY',
    }

    if (apiresponse.length > 0) {
        for (let a = 0; a < apiresponse.length; a++) {
            let isVideo = false;
            let url = '';
            if(apiresponse[a]['video_versions'] && apiresponse[a]['video_versions'].length>0){
                isVideo = true;
                url = apiresponse[a]['video_versions'][0].url;
            }  
            let story = {
                image : apiresponse[a]['image_versions2'].candidates[0].url,
                isvideo : isVideo,
                url : url
            }
            stories.push(story);
        }
        tempData.success = true;
        tempData.stories = stories;
    }else{
        tempData = {
            success : false,
            type: 'STORY',
            message: 'No Stories By User',
        };
    }
    return tempData;

}

module.exports = {
    fetchMediaResponse, fetchStoriesfromApi
}
