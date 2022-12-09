const fs = require('fs/promises');

const express = require('express');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());

app.post('/prepare', (req, res) => {
  const uuid = req.body.message.slice('prepare '.length);

  if (process.env.READY) {
    console.log({ time: new Date().toUTCString(), body: `ready ${uuid}` });
    res.json({ message: `ready ${uuid}` });
    return;
  }
  console.log({ time: new Date().toUTCString(), body: `no ${uuid}`, recipients: [req.socket.remoteAddress] });
  res.json({ message: `abort ${uuid}` });
});

app.post('/commit', async (req, res) => {
  const { value } = req.body;
  const uuid = req.body.message.slice('commit '.length);
  await fs.writeFile('db.json', JSON.stringify({ value }));

  console.log({ time: new Date().toUTCString(), body: `commit ${uuid}` });
  res.sendStatus(200);
});

app.post('/abort', (req, res) => {
  const uuid = req.body.message.slice('abort '.length);

  console.log({ time: new Date().toUTCString(), body: `abort ${uuid}` });
  res.sendStatus(200);
});

app.listen(PORT, () => `Node is running at port ${PORT}`);
