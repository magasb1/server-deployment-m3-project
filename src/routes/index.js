const { Router } = require('express');
const { saveFileS3, getFilesS3, getFileS3, emptyS3BucketByPrefix, deleteFileS3 } = require('../lib/utils');
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

router.get('/Settings', requiresAuth(), (req, res) => {
    res.render('settings', { 
        title: 'Settings',
        user: req.user ,
    });
});

router.post('/upload', requiresAuth(), async (req, res) => {
    const { file } = req.files;
    const { nickname } = req.user;
    if (file){
        try {
            await saveFileS3(file, nickname);
            return res.status(201).json({ message: 'File uploaded', path: `upload/${nickname}/${file.name}` });
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

router.get('/upload/:userId/:name', async (req, res) => {
    const { name, userId } = req.params;
    
    if (userId !== req.user?.nickname) {
        return res.redirect('/');
    }
    const key = `${userId}/${name}`;

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

router.delete('/upload', requiresAuth(), async (req, res) => {
    const { key } = req.body;
    if (!key) {
        return res.status(400).json({ message: 'No key provided' });
    }
    if (key.split('/')[0] !== req.user.nickname) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const response = await deleteFileS3(key);
    console.log(response)
    res.status(200).json({ message: 'File deleted' });
});

router.delete('/empty-bucket', requiresAuth(), async (req, res) => {
    const { nickname } = req.user;
    await emptyS3BucketByPrefix(nickname)
    res.status(200).json({ message: 'Bucket emptied' });
});

router.use((req, res, next) => {
    res.status(404).render('error', { title: 'Page not found', code: 404, user: req.user });
});

module.exports = router;