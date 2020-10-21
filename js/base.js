function getTagsFromDescription(description) {
    let tags = description.match(/(#[A-z]|#[0-9])\w+/g) || new Array();
    tags = [...new Set(tags)];
    return tags;
}

function addImage(file, description) {

    const output = document.getElementById('output');
    const reader = new FileReader();
    reader.addEventListener('load', event => {
        let blob = event.target.result
        let imageElement = new Image();
        imageElement.src = blob;
        imageElement.onload = event => {
            let format = "squad";

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
                create_time: file.lastModified / 1000,
                image: blob,
                description: description,
                tags: tags
            };
            addImageToDB(image).then(displayImage);

        }
    });
    reader.readAsDataURL(file);
}

function startImageLoader() {
    const status = document.getElementById('status');

    const add_button = document.getElementById('add-image');
    let file = null;

    document.getElementById('file-selector').addEventListener('change', event => {
        add_button.removeAttribute('disabled');
        file = event.target.files[0];
    });

    add_button.onclick = event => {
        status.textContent = '';
        if (!file.type) {
            status.textContent = 'Error: The File.type property does not appear to be supported on this browser.';
            return;
        }
        if (!file.type.match('image.*')) {
            status.textContent = 'Error: The selected file does not appear to be an image.'
            return;
        }

        let description = document.getElementById('description-text-area').value;

        addImage(file, description);

        add_button.setAttribute('disabled', true);
    }
}

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

function downloadImage(image) {
    let url = image.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
    window.open(url);
}

function searchByName(event) {
    const search_word = document.getElementById('search-field').value;
    let cursor = event.target.result;
    if (cursor) {
        if (cursor.value.name.includes(search_word)) {
            goToImage(cursor.value.id);
        }
        cursor.continue();
    }
}

function searchByTag(event) {
    const search_word = document.getElementById('search-field').value;

    goToTag(search_word);
}

function GlobalSearch() {
    const search_word = document.getElementById('search-field').value;

    let findByName = true;

    if (search_word.startsWith('#'))
        findByName = false;

    RequestToDB(() => {
        window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = (findByName && searchByName) || searchByTag;
    });
}

