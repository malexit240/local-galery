/**this file contains functions that follow to other addresses */

function goToImage(id) {
    window.location.href = `./image.html?id=${id}`;
}

function goToTag(tag) {
    window.location.href = `./collection.html?tag=${tag}`;
}

function goToCollection(id) {
    document.location.href = `./collection.html?id=${id}`
}

function goToAllImages() {
    document.location.href = `./all_images.html`
}