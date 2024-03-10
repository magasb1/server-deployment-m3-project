const { Router } = require('express');
const { saveFileS3, getFilesS3, getFileS3 } = require('../lib/utils');
const { requiresAuth } = require('express-openid-connect');

const router = Router();

router.get('/', async (req, res) => {
    const files = await getFilesS3();
    res.render('index', { 
        title: 'Home',
        user: req.user ?? null,
        files: req.user ? files : files.slice(0, 3),
    });
});

router.get('/upload', requiresAuth(), (req, res) => {
    res.render('upload', { 
        title: 'Upload',
        user: req.user ?? null,
    });
});

router.post('/upload', requiresAuth(), async (req, res) => {
    const { file } = req.files;
    if (file){
        try {
            await saveFileS3(file);
            return res.status(201).json({ message: 'File uploaded', path: `upload/${file.name}` });
        } catch (error) {
            return res.status(500).json({ message: 'Error uploading file' });
        }
    }
    res.status(400).json({ message: 'No file provided' });
});

router.get('/upload/:key', async (req, res) => {
    const { key } = req.params;
    const file = await getFileS3(key);
    if (file) {
        return res.render('upload-id', { 
            title: key,
            user: req.user ?? null,
            file,
        });
    }
    return res.redirect('/');
    
});

module.exports = router;