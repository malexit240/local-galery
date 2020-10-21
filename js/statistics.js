(function () {
    navigator.storage.estimate().then(value => {
        document.getElementById('used-space').style.width = `${value.usage / value.quota}%`;
        document.getElementById('used').innerHTML = parseFloat(value.usage / 1024 / 1024).toFixed(2) + 'MB';
        document.getElementById('total').innerHTML = parseFloat(value.quota / 1024 / 1024 / 1024).toFixed(2) + 'GB';
    })

    RequestToDB(() => {
        window.db.transaction("imagesStorage").objectStore("imagesStorage").count().onsuccess = event => {
            document.getElementById('files-amount').innerHTML = event.target.result;
        }
    })
}())

function clearAll() {
    RequestToDB(() => {
        window.db.transaction("imagesStorage", "readwrite").objectStore("imagesStorage").clear().onsuccess = event => {
            document.location.href = document.location.href;
        }
        window.db.transaction("collectionsStorage", "readwrite").objectStore("collectionsStorage").clear();

    })
}