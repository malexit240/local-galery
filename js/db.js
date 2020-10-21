function openIndexedDB() {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if (!window.indexedDB) {
        alert("indexedDB not aloowed");
        return;
    }

    let request = window.indexedDB.open("ImagesDB", 1);
    window.request = request;

    request.onupgradeneeded = function (event) {
        let db = event.target.result;

        db.createObjectStore("imagesStorage", { keyPath: "id", autoIncrement: true })
        db.createObjectStore("collectionsStorage", { keyPath: "id", autoIncrement: true })
    }

    window.request.addEventListener('success', event => { window.db = event.target.result; });


    request.onerror = function (event) {
        alert(`indexedDB not aloowed ${event.target.errorCode}`);
    }

    return request;

}

function RequestToDB(callback) {
    if (!window.db) {
        let request = window.request || openIndexedDB();
        request.addEventListener('success', event => { callback() })
    }
    else {
        callback();
    }
}

function forEachCollection(callback) {

    RequestToDB(() => {
        window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").openCursor().onsuccess = event => {
            let cursor = event.target.result;
            if (cursor) {
                callback(cursor.value)
                cursor.continue();
            }
        }
    })
}

function addImageToDB(image) {
    let promise = new Promise((resolve, reject) => {
        let transaction = window.db.transaction(["imagesStorage"], "readwrite");

        let objectStore = transaction.objectStore("imagesStorage")

        objectStore.add(image).onsuccess = event => {
            objectStore.openCursor(null, 'prev').onsuccess = event => {
                if (event.target.result) {
                    resolve(event.target.result.value);
                }
            }
        }
    })
    return promise;
}


function loadImagesFromDB() {
    window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            displayImage(cursor.value);
            cursor.continue();
        }
    };
}

function forEachImage(callback) {
    RequestToDB(() => {
        window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").openCursor().onsuccess = event => {
            let image = event.target.result;
            if (image) {
                callback(image);
                image.continue();
            }
        }
    })
}

function getImage(id) {
    let promise = new Promise((resolve, reject) => {
        RequestToDB(() => {
            window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").get(Number(id)).onsuccess = event => {
                let image = event.target.result;
                resolve(image);
            }
        })
    })

    return promise;
}

function getImagesByTag(tag) {
    let promise = new Promise((resolve, reject) => {
        RequestToDB(() => {
            let images = new Array();
            window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").openCursor().onsuccess = event => {
                let image = event.target.result;
                if (image) {
                    if (image.value.tags.includes(tag))
                        images.push(image.value);
                    image.continue();
                }
                else {
                    resolve(images);
                }


            }
        })
    })

    return promise;
}