// backend/server.js
const express = require('express');
const fileUpload = require('express-fileupload');
const { convertDockerComposeToK8s } = require('./convert');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const port = 3000;

app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const dockerComposeFile = req.files.file;
    const dockerComposeContent = dockerComposeFile.data.toString('utf8');
    const files = convertDockerComposeToK8s(dockerComposeContent);

    const zipPath = path.join(__dirname, 'output.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        res.json({
            message: 'Files generated successfully',
            files,
            zipPath: '/download'
        });
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    Object.keys(files).forEach(serviceDir => {
        Object.keys(files[serviceDir]).forEach(fileName => {
            archive.append(files[serviceDir][fileName], { name: `${serviceDir}/${fileName}` });
        });
    });

    archive.finalize();
});

app.get('/download', (req, res) => {
    const zipPath = path.join(__dirname, 'output.zip');
    res.download(zipPath, 'k8s-deployments.zip', (err) => {
        if (err) {
            console.error(err);
        }
        fs.unlinkSync(zipPath);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
