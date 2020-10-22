function getTagsFromDescription(description) {
    /**this function returns array of unique tags from description */
    let tags = description.match(/(#[A-z]|#[0-9])\w+/g) || [];
    tags = [...new Set(tags)];
    return tags;
}

function addImage(file, description) {
    /**this function create image-object from data
     *  then calls function for saving  it to db
     * and return promise to return saved image-object*/
    const promise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', event => {
            let blob = event.target.result
            let imageElement = new Image();
            imageElement.src = blob;
            imageElement.onload = event => {
                let format = "square";

                if (imageElement.naturalWidth > imageElement.naturalHeight) {
                    format = "album";
                }
                else if (imageElement.naturalWidth < imageElement.naturalHeight) {
                    format = "portret";
                }

                let tags = getTagsFromDescription(description);

                let image = {
                    name: file.name,
                    sizes: { width: imageElement.naturalWidth, height: imageElement.naturalHeight },
                    format: format,
                    wage: file.size / 1024 / 1024,
                    mimetype: file.type.replace('image/', ''),
                    create_time: file.lastModified,
                    image: blob,
                    description: description,
                    tags: tags
                };
                addImageToDB(image).then(resolve);

            }
        });
        reader.readAsDataURL(file);
    });
    return promise;
}

function startImageLoader() {
    /**this function add image loader functionality to page */

    const add_button = document.getElementById('add-image');
    let file = null;

    document.getElementById('file-selector').addEventListener('change', event => {
        add_button.removeAttribute('disabled');
        file = event.target.files[0];
    });

    add_button.onclick = event => {

        if (!file.type.match('image.*')) {
            sendMessage('The selected file does not appear to be an image', 30);
            return;
        }

        let description = document.getElementById('description-text-area').value;

        addImage(file, description).then(displayImage);

        add_button.setAttribute('disabled', true);
    }
}

function displayImage(image) {
    /**this function displays image-object on page */
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

function searchByName(event) {
    /**this function check whether image name matches with search name and follows to image page if it true */
    const search_word = document.getElementById('search-field').value;

    if (search_word.length == 0) {
        sendMessage('search field must not be empty', 20);
        return;
    }

    let cursor = event.target.result;
    if (cursor) {
        if (cursor.value.name.includes(search_word)) {
            goToImage(cursor.value.id);
        }
        cursor.continue();
    }
    else {
        sendMessage('did not found image with this name', 20);
    }
}

function searchByTag(event) {
    /**this function follows to page with images by tag */
    const search_word = document.getElementById('search-field').value;
    getImagesByTag(search_word).then(images => {
        if (images.length > 0)
            goToTag(search_word);
        else
            sendMessage('did not found images by this tag', 20);
    })

}

function GlobalSearch() {
    /**this function choose type of search (by name or tag) in dependency from first symbol in search field */
    const search_word = document.getElementById('search-field').value;

    let findByName = true;

    if (search_word.startsWith('#'))
        findByName = false;

    RequestToDB(() => {
        window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = (findByName && searchByName) || searchByTag;
    });
}

function sendMessage(message, level = 20) {
    /**this function show status message on page*/
    let center_status_bar = document.getElementById('center-status-bar');
    let status_block = document.getElementById('status-bar');
    let status_message = document.getElementById('status');
    center_status_bar.style.setProperty('z-index', 99);
    status_block.style.opacity = 1;
    status_message.textContent = message;

    switch (level) {
        case 20:
            status_block.style.setProperty('background-color', '#d1ecf1d4');
            break;
        case 30:
            status_block.style.setProperty('background-color', '#fff3cdd4');
            break;
        case 40:
            status_block.style.setProperty('background-color', '#f8d7dad4');
            break;
    }

    setTimeout(() => {
        status_block.style.opacity = 0;
        center_status_bar.style.setProperty('z-index', -1);
    }, 100 * message.length);
}