const fs = require('fs');
const { S3Client, PutObjectCommand, ListObjectsCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ 
    region: 'us-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

module.exports = {
    saveFile: async (file) => {
        const { name, data } = file;
        const path = `public/uploads/${name}`;
        await fs.promises
            .writeFile(path, data);
        return path;
    },
    saveFileS3: async (file) => {
        const { name, data } = file;
        const params = {
            Bucket: 'images-aws'
        };
        const command = new PutObjectCommand(params);
        const response = await s3.send(command);

    },
    listFiles: async () => {
        const dir = 'public/uploads';
        const files = await fs.promises
            .readdir(dir, { 
                withFileTypes: true,

            });
        // remove dot files and directories
        return files
          .filter(file => file.isFile())
          .filter(file => !file.name.startsWith('.'))
          .map(file => file.name);
    },
    listFilesS3: async () => {
        const params = {
            Bucket: 'images-aws'
        };
        const response = await s3.send(new ListObjectsCommand(params));
        return response.Contents.map(file => file.Key);
    },
}