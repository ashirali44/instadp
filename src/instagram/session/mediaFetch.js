const fetchMediaResponse = function fetchMedia(apiData) {
    var data = apiData['items'][0];
    var tempData = {
        success : false,
        url : '',
        type :  '',
    }

    if(data!=null && data['video_versions'] && data['video_versions'].length > 0){
        tempData.type = 'VIDEO';
        tempData.success = true;
        tempData.duration = data['video_duration'];
        tempData.url = data['video_versions'][0].url;
        tempData.thumbnail = data['image_versions2'].candidates[0].url;
    }else{
        var image_urls = [];
        if(data['carousel_media'] && data['carousel_media'].length > 0 ){
          for(let a=0;a<data['carousel_media'].length;a++){
            image_urls.push(data['carousel_media'][a]['image_versions2']['candidates'][0].url);
          }
        }else{
            image_urls.push(data['image_versions2'].candidates[0].url);
        }
        tempData.type = 'IMAGE';
        tempData.success = true;
        tempData.url = image_urls;
    }

    return tempData;

}

module.exports = {
    fetchMediaResponse
}