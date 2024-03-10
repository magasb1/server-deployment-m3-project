require('dotenv').config();
const fs = require('fs');
const { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ 
    region: process.env.AWS_REGION,
});

module.exports = {
    saveFile: async (file) => {
        const { name, data } = file;
        const path = `public/uploads/${name}`;
        await fs.promises
            .writeFile(path, data);
        return path;
    },
    getFiles: async () => {
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
    saveFileS3: async (file) => {
        const { name, data } = file;
        const params = {
            Bucket: process.env.CYCLIC_BUCKET_NAME,
            Key: name,
            Body: data,
        };
        const command = new PutObjectCommand(params);
        const response = await s3.send(command);
        return response;
    },
    getFilesS3: async () => {
        const params = {
            Bucket: process.env.CYCLIC_BUCKET_NAME,
        };
        const response = await s3.send(new ListObjectsCommand(params));
        const files = response.Contents
          .filter(file => !file.Key.startsWith('.') && !file.Key.endsWith('.zip'))

        const data = await Promise.all(files.map(async (file) => {
            const params = {
                Bucket: process.env.CYCLIC_BUCKET_NAME,
                Key: file.Key,
            };
            const response = await s3.send(new GetObjectCommand(params));
            const data = await new Promise((resolve, reject) => {
                const chunks = [];
                response.Body.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                response.Body.on('end', () => {
                    resolve(Buffer.concat(chunks));
                });
                response.Body.on('error', (error) => {
                    reject(error);
                });
            });
            return {
                name: file.Key,
                src: `data:image/jpeg;base64,${data.toString('base64')}`,
            };
        }));
        
        return data;
    },
    getFileS3: async (key) => {
        const params = {
            Bucket: process.env.CYCLIC_BUCKET_NAME,
            Key: key,
        };
        const response = await s3.send(new GetObjectCommand(params));
        const data = await new Promise((resolve, reject) => {
            const chunks = [];
            response.Body.on('data', (chunk) => {
                chunks.push(chunk);
            });
            response.Body.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            response.Body.on('error', (error) => {
                reject(error);
            });
        });
        return {
            name: key,
            src: `data:image/jpeg;base64,${data.toString('base64')}`,
        };
    },
}