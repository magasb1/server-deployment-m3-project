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
    })
    .catch(error => {
        console.error(error)
    })
}


// Initialize the page
(async () => {

document.querySelector('#formFile')?.addEventListener('change', uploadFile)
})()