function addCollection() {
    const name = document.getElementById("collection-name-input").value;

    window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").add({
        name: name,
        images: []
    });

    window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").openCursor(null, 'prev').onsuccess = event => {
        let cursor = event.target.result;
        if (cursor)
            displayCollection(cursor.value);
    }
}

function displayCollection(collection) {
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

    div.onclick = event => {
        goToCollection(collection.id);
    }
    p.innerHTML = collection.name;
    div.append(p);
    div.append(img);
    collections_list.append(div);
}

function getCollections() {
    let collections = new Array();

    window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").openCursor().onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
            collections.push(cursor.value)
            cursor.continue();
        }
    }
    return collections;
}


function displayAllImagesPreview() {
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
    const create_button = document.getElementById('create-collection-button');

    displayAllImagesPreview();

    forEachCollection(displayCollection);

    create_button.addEventListener('click', event => {
        RequestToDB(addCollection);
    });


}())