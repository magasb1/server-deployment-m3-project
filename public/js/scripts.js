function uploadFile(event) {
    const file = event.target.files[0]
    const formData = new FormData()
    formData.append('file', file)
    console.log(file)
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        location.replace(data.path)
    })
    .catch(error => {
        console.error(error)
    })
}

function clearBucket() {
    const confirm = window.confirm('Are you sure you want to delete all files?')
    if (!confirm) return

    fetch('/empty-bucket', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        location.replace('/')
    })
    .catch(error => {
        console.error(error)
    })
}

function deleteById(id) {
    const confirm = window.confirm('Are you sure you want to delete this file?')
    if (!confirm) return

    fetch(`/upload/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        location.replace("/")
    })
    .catch(error => {
        console.error(error)
    })
}


// Initialize the page
(async () => {

document.querySelector('#formFile')?.addEventListener('change', uploadFile)
document.querySelector('#clearBucket')?.addEventListener('click', clearBucket)
})()