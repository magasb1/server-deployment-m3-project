const { Router } = require('express');
const { saveFile, listFiles } = require('../lib/utils');

const router = Router();

router.get('/', async (req, res) => {
    const files = await listFiles();
    res.render('index', { 
        title: 'Home',
        user: req.user ?? null,
        files,
    });
});

router.get('/upload', (req, res) => {
    res.render('upload', { 
        title: 'Upload',
        user: req.user ?? null,
    });
});

router.post('/upload', async (req, res) => {
    const { file } = req.files;
    if (file){
        try {
            await saveFile(file);
            return res.status(201).json({ message: 'File uploaded' });
        } catch (error) {
            return res.status(500).json({ message: 'Error uploading file' });
        }
    }
    res.status(400).json({ message: 'No file provided' });
});

module.exports = router;