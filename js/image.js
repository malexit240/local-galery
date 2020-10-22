function downloadImage() {
    saveAs(window.image.image, window.image.name);
};


function removeImage() {
    RequestToDB(() => {
        window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").delete(Number(window.image_id)).onsuccess = event => {
            window.history.back();
        }

    });
}

function includeImageToCollection(image_id, collection_id) {

    RequestToDB(() => {
        let objectStore = window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage")
        objectStore.get(collection_id).onsuccess = event => {
            let collection = event.target.result;
            collection.images.push(image_id);
            objectStore.put(collection)
        }
    });
}

function excludeImageToCollection(image_id, collection_id) {

    RequestToDB(() => {
        let objectStore = window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage")
        objectStore.get(collection_id).onsuccess = event => {
            let collection = event.target.result;
            collection.images.splice(collection.images.indexOf(image_id), 1);
            objectStore.put(collection)
        }
    });
}

function addHashTags(description) {
    let html = description;
    let tags = getTagsFromDescription(description);

    if (tags) {
        tags.forEach(element => {
            html = html.replaceAll(element, `<a href='./collection.html?tag=${element}'">${element}</a>`);
        });
    }

    return html;
}

function displayImage() {

    document.getElementById('big-size-image').setAttribute('src', window.image.image);
    document.getElementById('image-name').innerHTML = window.image.name;
    document.getElementById('image-format').innerHTML = window.image.format;
    document.getElementById('image-size-width').innerHTML = window.image.sizes.width;
    document.getElementById('image-size-height').innerHTML = window.image.sizes.height;
    document.getElementById('image-wage').innerHTML = parseFloat(window.image.wage).toFixed(2) + 'MB';
    document.getElementById('image-type').innerHTML = window.image.mimetype;
    document.getElementById('image-create-time').innerHTML = (new Date(window.image.create_time)).toDateString();
    document.getElementById('image-description').innerHTML = addHashTags(window.image.description);
    document.getElementById('image-tags').innerHTML = window.image.tags;

    const collections_element = document.getElementById("collections");

    getCollections().then(collections => collections.forEach(collection => {
        let div = document.createElement("div");
        div.className = "collection-element";
        div.collection_id = collection.id;
        div.in_collection = collection.images.includes(window.image_id);

        div.onclick = event => {
            if (div.in_collection)
                excludeImageToCollection(window.image_id, collection.id);
            else
                includeImageToCollection(window.image_id, collection.id);

            div.in_collection = !div.in_collection;

            p.style.visibility = div.in_collection ? "visible" : "hidden"

        }

        let p = document.createElement("p");
        p.innerHTML = collection.name;

        div.append(p);

        p = document.createElement("p");
        p.innerHTML = "V";

        p.style.visibility = div.in_collection ? "visible" : "hidden"

        div.append(p);

        collections_element.append(div);
    }))

}


function editName() {
    document.getElementById('name-edit').style.display = 'flex';
    document.getElementById('name-input').value = window.image.name.split('.')[0];
}

function changeName() {
    let nameInputElement = document.getElementById('name-input');
    let name = nameInputElement.value;
    let image = window.image;

    image.name = name + '.' + image.name.split('.')[1];

    RequestToDB(() => {
        window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").put(image).onsuccess = event => {
            window.image = image;
            document.getElementById('image-name').innerHTML = image.name;
            document.getElementById('name-edit').style.display = 'none';
        }
    });

}

function editDescription() {
    document.getElementById('description-edit').style.display = 'flex';
    document.getElementById('description-input').value = window.image.description;
}




function changeDescription() {
    let descriptionInputElement = document.getElementById('description-input');
    let description = descriptionInputElement.value;
    let image = window.image;

    image.description = description;
    image.tags = getTagsFromDescription(description);

    RequestToDB(() => {
        window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").put(image).onsuccess = event => {
            window.image = image;
            document.getElementById('image-description').innerHTML = addHashTags(image.description);
            document.getElementById('image-tags').innerHTML = image.tags;
            document.getElementById('description-edit').style.display = 'none';
        }
    });
}


(function () {

    window.image_id = Number(document.location.href.split('?')[1].split('=')[1]);

    getImage(window.image_id).then(image => {
        window.image = image;
        displayImage();
    });
}())