const { Router } = require('express');
const { saveFileS3, getFilesS3, getFileS3 } = require('../lib/utils');
const { requiresAuth } = require('express-openid-connect');

const router = Router();

router.get('/', async (req, res) => {
    const files = await getFilesS3(req.user?.nickname ?? null);
    res.render('index', { 
        title: 'Home',
        user: req.user,
        files: req.user ? files : files.slice(0, 3),
    });
});

router.get('/upload', requiresAuth(), (req, res) => {
    res.render('upload', { 
        title: 'Upload',
        user: req.user ,
    });
});

router.post('/upload', requiresAuth(), async (req, res) => {
    const { file } = req.files;
    if (file){
        try {
            await saveFileS3(file, req.user.nickname);
            return res.status(201).json({ message: 'File uploaded', path: `upload/${file.name}` });
        } catch (error) {
            return res.status(500).json({ message: 'Error uploading file' });
        }
    }
    res.status(400).json({ message: 'No file provided' });
});

router.get('/upload/:key', async (req, res) => {
    const { key } = req.params;

    const file = await getFileS3(key, req.user?.nickname ?? null);
    if (file) {
        return res.render('upload-id', { 
            title: key,
            user: req.user,
            file,
        });
    }
    return res.redirect('/');
});

router.get('/upload/:userId/:key', async (req, res) => {
    const { key, userId } = req.params;

    if (userId !== req.user?.nickname) {
        return res.redirect('/');
    }

    const file = await getFileS3(key, req.user?.nickname ?? null);
    if (file) {
        return res.render('upload-id', { 
            title: key,
            user: req.user,
            file,
        });
    }
    return res.redirect('/');
});

router.use((req, res, next) => {
    res.status(404).render('error', { title: 'Page not found', code: 404, user: req.user });
});

module.exports = router;