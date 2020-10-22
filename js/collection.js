
function downloadImagesAsArchiveButton(event) {
    /**this function-handler allows download images in collection as archive */
    let button = event.target;

    button.setAttribute('disabled', '');
    const oldTextContent = button.textContent;
    button.textContent = 'Wait';
    var zip = new JSZip();
    window.images.forEach(element => {
        zip.file(element.name, element.image.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, ""), { base64: true });
    })

    zip.generateAsync({ type: "blob" })
        .then(content => {
            saveAs(content, "example.zip");
            button.removeAttribute('disabled');
            button.textContent = oldTextContent;
        });
}




(function () {
    let argument = document.location.href.split('?')[1];
    if (argument.split('=')[0] == 'id') {
        window.collection_id = argument.split('=')[1];

        getCollection(window.collection_id).then(collection => {
            window.collection = collection
            getImagesInCollection(collection).then(images => {
                window.images = images;
                images.forEach(image => {
                    displayImage(image);
                })
            })
        });
    }
    else if (argument.split('=')[0] == 'tag') {
        window.tag = argument.split('=')[1];
        getImagesByTag(window.tag).then(images => {
            window.images = images;
            images.forEach(image => {
                displayImage(image);
            })

        });
    }

    document.getElementById("download-button").onclick = event => downloadImagesAsArchiveButton(event);
    document.getElementById("delete-only-collection-button").onclick = event => deleteCollection(window.collection_id).then(value => window.history.back());
    document.getElementById("delete-with-image-button").onclick = event => deleteCollectionWithImage(window.collection).then(value => window.history.back());

})();
