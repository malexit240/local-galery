function displayImage(image) {
    const container = document.getElementById("images-container");

    let div = document.createElement("div");
    div.className = "image-container";

    let img = document.createElement("img");
    img.src = image.image;
    img.className = "image"
    img.setAttribute("image-id", image.id);
    div.onclick = event => {
        goToImage(image.id);
    }
    div.append(img);

    container.append(div);

}

function loadImagesInCollection() {
    window.images = new Array();

    window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
            if (window.collection.images.includes(cursor.key)) {

                displayImage(cursor.value);
                window.images.push(cursor.value);
            }
            cursor.continue();
        }
    };
}

function getCollection() {
    window.db.transaction("collectionsStorage").objectStore("collectionsStorage").get(Number(window.collection_id)).onsuccess = event => {
        window.collection = event.target.result;
    }
}

function downloadImagesAsArchiveButton() {
    button = document.getElementById("download-button");
    button.onclick = event => {
        button.setAttribute('disabled', '');
        button.innerHTML = 'Wait';
        var zip = new JSZip();
        window.images.forEach(element => {
            zip.file(`${element.name}`, (element.image.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "")), { base64: true });
        })

        zip.generateAsync({ type: "blob" })
            .then(content => {
                saveAs(content, "example.zip");
                button.removeAttribute('disabled');
                button.innerHTML = 'Click!';
            });
    }
}

function deleteCollection() {
    RequestToDB(() => {
        window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").delete(Number(window.collection_id)).onsuccess = event => {
            window.history.back();
        }
    })
}


function deleteCollectionWithImage() {
    RequestToDB(() => {
        let objectStore = window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage");
        objectStore.openCursor().onsuccess = event => {

            let image = event.target.result;
            if (image) {
                if (window.collection.images.includes(image.value.id)) {
                    objectStore.delete(image.value.id);
                }
                image.continue();
            }
            else {
                deleteCollection();
            }
        }
    })

}


(function () {

    let argument = document.location.href.split('?')[1];
    if (argument.split('=')[0] == 'id') {
        window.collection_id = argument.split('=')[1];
        RequestToDB(getCollection);
        RequestToDB(loadImagesInCollection);
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

    downloadImagesAsArchiveButton();

})();
