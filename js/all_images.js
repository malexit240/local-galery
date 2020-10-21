(function () {
    loadImagesFromDB().then(images => {
        images.forEach(image => {
            displayImage(image);
        })
    });
    RequestToDB(startImageLoader);
})();