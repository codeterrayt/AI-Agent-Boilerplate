import express from 'express';
import { run } from './index.js';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    res.send('Hello World!');
});

app.get('/run', async (req, res) => {
    const result = await run(req.query.query);
    return res.send(result);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});