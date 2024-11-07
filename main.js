const { Command } = require('commander');
const express = require('express');
const app = express();

const program = new Command();
program
  .requiredOption('-h, --host <type>', 'server host')
  .requiredOption('-p, --port <number>', 'server port')
  .requiredOption('-c, --cache <path>', 'directory to path');

program.parse(process.argv);

const { host, port, cache } = program.opts();

if (!host || !port || !cache) {
  console.error('Помилка: Всі параметри (--host, --port, --cache) є обов’язковими');
  process.exit(1);
}

app.get("/", (req, res) => {
    res.send('Server started')    
});

app.listen(port, host, () => {
console.log (`Сервер запущено за адресою http://${host}:${port}`)
console.log (`Кеш зберішається у директорії ${cache}`)
});
