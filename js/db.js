function openIndexedDB() {
    /**this funciton opens connection to IndexedDB and save db instance as window.db */
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if (!window.indexedDB) {
        alert("indexedDB not aloowed");
        return;
    }

    let request = window.indexedDB.open("ImagesDB", 1);
    window.request = request;

    request.onupgradeneeded = event => {
        let db = event.target.result;

        db.createObjectStore("imagesStorage", { keyPath: "id", autoIncrement: true })
        db.createObjectStore("collectionsStorage", { keyPath: "id", autoIncrement: true })
    }

    window.request.addEventListener('success', event => { window.db = event.target.result; });


    request.onerror = event => {
        alert(`indexedDB not aloowed ${event.target.errorCode}`);
    }

    return request;

}

function RequestToDB(callback) {
    /**this function garanted that caalback will have access to window.db */
    if (!window.db) {
        let request = window.request || openIndexedDB();
        request.addEventListener('success', event => { callback() })
    }
    else {
        callback();
    }
}

function addImageToDB(image) {
    /**this function saves image in db and returns promise to return saved image-object(with id) */
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
    /**this function returns promise to return all images from db*/
    let promise = new Promise((resolve, reject) => {
        let images = [];
        RequestToDB(() => {
            window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    images.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve(images);
                }
            };
        })

    })

    return promise;
}

function getImage(id) {
    /** this function returns promise to return image-object by id*/
    let promise = new Promise((resolve, reject) => {
        RequestToDB(() => {
            window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").get(Number(id)).onsuccess = event => {
                resolve(event.target.result);
            }
        })
    })

    return promise;
}

function getImagesByTag(tag) {
    /**this function returns promise to return images by tag */
    let promise = new Promise((resolve, reject) => {
        RequestToDB(() => {
            let images = [];
            window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = event => {
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

function getCollection(id) {
    /**this function return promise to return collection by id */
    const promise = new Promise((resolve, reject) => {
        RequestToDB(() => {
            window.db.transaction("collectionsStorage").objectStore("collectionsStorage").get(Number(id)).onsuccess = event => {
                resolve(event.target.result);
            }
        })
    });
    return promise;

}

function getImagesInCollection(collection) {
    /** this function returns promise to return images in collection*/
    const promise = new Promise((resolve, reject) => {
        let images = [];
        RequestToDB(() => {
            window.db.transaction("imagesStorage").objectStore("imagesStorage").openCursor().onsuccess = event => {
                let cursor = event.target.result;
                if (cursor) {
                    if (collection.images.includes(cursor.key)) {
                        images.push(cursor.value);
                    }
                    cursor.continue();
                }
                else {
                    resolve(images);
                }
            };
        });
    });

    return promise;
}

function deleteCollection(id) {
    /**this function delete collection from collectionsStore */
    const promise = new Promise((resolve, reject) => {
        RequestToDB(() => {
            window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").delete(Number(id)).onsuccess = event => {
                resolve();
            }
        })
    });

    return promise;
}


function deleteCollectionWithImage(collection) {
    /**this function delete collection from collectionsStore and delete all includes in it images */
    const promise = new Promise((resolve, reject) => {
        RequestToDB(() => {
            let objectStore = window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage");
            objectStore.openCursor().onsuccess = event => {

                let image = event.target.result;
                if (image) {
                    if (collection.images.includes(image.value.id)) {
                        objectStore.delete(image.value.id);
                    }
                    image.continue();
                }
                else {
                    deleteCollection(collection.id);
                    resolve();
                }
            }
        })
    });

    return promise;
}

function addCollection(name) {
    /**this function adds collection to db */
    const promise = new Promise(resolve => {
        RequestToDB(() => {
            let objectStore = window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage")

            objectStore.add({
                name: name,
                images: []
            });

            objectStore.openCursor(null, 'prev').onsuccess = event => {
                resolve(event.target.result.value);
            }
        });
    })
    return promise;
}

function getCollections() {
    /**this function returns promise to return all collections */
    const promise = new Promise(resolve => {
        RequestToDB(() => {
            let collections = [];
            window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").openCursor().onsuccess = event => {
                let cursor = event.target.result;
                if (cursor) {
                    collections.push(cursor.value)
                    cursor.continue();
                }
                else
                    resolve(collections);
            }
        })
    });
    return promise;
}

function clearAll() {
    /**this function clear all stores */
    RequestToDB(() => {
        window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").clear().onsuccess = event => {
            document.location.href = document.location.href;
        }
        window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").clear();

    })
}
