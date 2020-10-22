function displayCollection(collection) {
    /**this function displays collection on page */
    const collections_list = document.getElementById("collections-list");

    let div = document.createElement('div');
    div.className = 'collection-preview';

    let p = document.createElement("p");
    let img = document.createElement('img');
    img.className = 'image-preview';


    RequestToDB(() => {
        window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = event => {
            let cursor = event.target.result;
            if (cursor) {
                if (collection.images.includes(cursor.value.id))
                    img.src = cursor.value.image;
                else
                    cursor.continue();
            }
            else {
                img.width = 300;
                img.height = 300;
            }
        }
    })

    div.onclick = event => goToCollection(collection.id);
    p.textContent = collection.name;

    div.append(p);
    div.append(img);
    collections_list.append(div);
}




function displayAllImagesPreview() {
    /**this function display link to all images */
    const div = document.getElementById('all-images-preview');
    div.onclick = event => {
        goToAllImages();
    }

    let img = document.createElement('img');
    img.className = 'image-preview';

    RequestToDB(() => {
        window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = event => {
            let cursor = event.target.result;
            if (cursor) {
                img.src = cursor.value.image;
            }
            else {
                img.width = 300;
                img.height = 300;
            }
        }
    })

    div.append(img);

}


(function () {
    displayAllImagesPreview();

    getCollections().then(collections => collections.forEach(collection => {
        displayCollection(collection);
    }));

    document.getElementById('create-collection-button').onclick = event => {
        const name = document.getElementById("collection-name-input").value;
        if (name.length <= 64 && name.length) {
            addCollection(name).then(collection => {
                displayCollection(collection);
            })
        }
        else if (!name.length) {
            sendMessage('Collection name must not be empty', 40);
        }
        else {
            sendMessage('Collection name must be smaller than 64 characters', 40);
        }

    };


}())