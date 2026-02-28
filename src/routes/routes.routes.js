import { run } from '../../ai.js';
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
    return res.send('Hello World!');
});

router.post('/run', async (req, res) => {
    const { query, socketId } = req.body;

    if (!socketId) {
        return res.status(400).send({ error: "socketId is required for updates" });
    }

    // socket test
    // req.io.to(socketId).emit('agent_step', { type: 'agent_response', data: 'test' });
    // return res.send({ message: 'test' });

    const result = await run(query, (step)=>{
        req.io.to(socketId).emit('agent_step', step);
    });
    return res.send(result);
});

export default router;