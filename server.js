import express from 'express';
import routes from './src/routes/routes.routes.js';
import { createServer } from 'node:http';
import { Server} from 'socket.io'

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: "*" }
});

io.on("connection", (socket)=>{
    console.log("a user connected id: ", socket.id);
    socket.on("disconnect", ()=>{
        console.log("user disconnected");
    })
})

app.use((req,res,next)=>{
    req.io = io;
    next();
});

app.use(express.json());
app.use(routes);

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});