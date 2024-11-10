const http = require('http');
const {Command} = require('commander');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();

app.use(express.json()); 

const application = new Command();
application 
    .requiredOption('-h, --host <host>', 'server host')
    .requiredOption('-p, --port <port>','server port')
    .requiredOption('-c, --cache <cahe>', 'cach directory path')
application.parse(process.argv);

const { host, port, cache } = application.opts();

if (!host || !port || !cache) {
  console.error('Помилка: Всі параметри (--host, --port, --cache) є обов’язковими');
  process.exit(1);
}

const NotesDirectory=path.join(__dirname, 'notes');
if (!fs.existsSync(NotesDirectory)) fs.mkdirSync(NotesDirectory);

app.get('/notes/:name', (req, res) => {
  const NotePath = path.join(NotesDirectory, req.params.name + ".txt")
  if (!fs.existsSync(NotePath)){
    return res.status (404).send('Нотатка не знайдена')
  }
    const noteText = fs.readFileSync(NotePath, 'UTF-8');
    res.send(noteText)
});

app.put('/notes/:name', (req, res) =>{
    const NotePath = path.join(NotesDirectory, req.params.name + ".txt")
if (!fs.existsSync(NotePath)){
  return res.status (404).send('Нотатка не знайдена')
}
fs.writeFileSync(NotePath, req.body.text)
res.send('Нотатка оновлена')
});

app.delete('/notes/:name', (req, res) =>{
    const NotePath = path.join(NotesDirectory, req.params.name + ".txt")
if (!fs.existsSync(NotePath)){
  return res.status (404).send('Нотатка не знайдена')
}
fs.unlinkSync(NotePath)
res.send("Нотатка видалена")
});

app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(NotesDirectory).map(file => {
        const name = path.basename(file, '.txt');
        const text = fs.readFileSync(path.join(NotesDirectory, file), 'utf8');
        return { name, text };
    });
    res.status(200).json(notes);
});

app.post('/write', upload.none(), (req, res) => {
    const { note_name, note } = req.body;
    const notePath = path.join(NotesDirectory, note_name + '.txt');
    if (fs.existsSync(notePath)) {
        return res.status(400).send('Нотатка з таким ім’ям вже існує');
    }
    fs.writeFileSync(notePath, note);
    res.status(201).send('Нотатка створена');
});

app.get('/UploadForm.html', (req, res) => {
    const formHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Upload Form</title>
        </head>
        <body>
            <form action="/write" method="post" enctype="multipart/form-data">
                <label for="note_name">Ім’я нотатки:</label>
                <input type="text" id="note_name" name="note_name"><br><br>
                <label for="note">Текст нотатки:</label>
                <textarea id="note" name="note"></textarea><br><br>
                <button type="submit">Зберегти нотатку</button>
            </form>
        </body>
        </html>
    `;
    res.status(200).send(formHTML);
});


app.listen(port, host, () => {
console.log (`Сервер запущено за адресою http://${host}:${port}`)
console.log (`Кеш зберішається у директорії ${cache}`)
});


