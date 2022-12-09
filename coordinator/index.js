const axios = require('axios').default;
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const PORT = 4000;

const nodes = [
  process.env.NODE_1,
  process.env.NODE_3,
  process.env.NODE_4,
  process.env.NODE_5,
  process.env.NODE_2,
];

const app = express();
app.use(express.json());

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Coordinator is up at port ${PORT}`);

  setTimeout(() => prepareNodes(uuidv4()), 10000);
});

async function prepareNodes(uuid) {
  console.log({ time: new Date().toUTCString(), body: `prepare ${uuid}` });
  const responseMap = {};
  await Promise.allSettled(nodes.map(async (n) => {
    const response = await axios.post(`http://${n}/prepare`, { message: `prepare ${uuid}` });
    responseMap[n] = response.data;
  }));

  if (nodes.every((n) => responseMap[n])) {
    if (Object.values(responseMap).every((r) => r.message === `ready ${uuid}`)) {
      commitT(uuid);
      return;
    }
  }
  abortT(uuid);
}

function commitT(uuid) {
  console.log({ time: new Date().toUTCString(), body: `commit ${uuid}` });
  nodes.forEach((n) => axios.post(`http://${n}/commit`, { message: `commit ${uuid}`, value: process.env.T }));
}

async function abortT(uuid) {
  console.log({ time: new Date().toUTCString(), body: `abort ${uuid}` });

  nodes.forEach((n) => axios.post(`http://${n}/abort`, { message: `abort ${uuid}`, value: process.env.T }));
}
