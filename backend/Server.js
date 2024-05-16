
import express from 'express';
import http from 'http'
import { Server as SocketServer } from 'socket.io';
import pty from 'node-pty'
import fs from 'fs/promises';
import path from 'path'
import cors from 'cors'
import chokidar from 'chokidar'

const app = express();
app.use(cors())
const server = http.createServer(app)

const ptyProcess = pty.spawn('bash', [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env
})

const io = new SocketServer({
    cors: "*"
})
io.attach(server);
chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh', path)
})

ptyProcess.onData(data => {
    io.emit("terminal:data", data)
})

io.on("connection", (socker) => {
    console.log("socket commected  ", socker.id)
    socker.on("terminal:write", (data) => {
        console.log(data)
        ptyProcess.write(data);
    })
    socker.on("file:change", async ({ path, content }) => {
        await fs.writeFile(`./user/${path}`, content)
    })
})

app.get('/', (req, resp) => resp.send("backend server"))

app.get('/files', async (req, resp) => {
    const fileTree = await generateFileTree('./user');
    return resp.json({ tree: fileTree })
})

app.get('/files/content', async (req, res) => {
    const path = req.query.path;
    const content = await fs.readFile(`./user/${path}`, 'utf-8')
    return res.json({ content })
})


server.listen(9000, () => {
    console.log(`Backend server started on 9000`)
})


async function generateFileTree(directory) {
    const tree = {};
    async function buildTree(currentDir, currentTree) { // this function taking currentFile 
        const files = await fs.readdir(currentDir); //  /user/home/myproject reading this current directory 
        for (const file of files) { // here extraction all files and foleder from directory
            const filePath = path.join(currentDir, file) // and here current directory and its content can jpinting with vurrentdirectory and extracted files and folders from it  
            const stat = await fs.stat(filePath) // and then checking si file is directory or nor 
            if (stat.isDirectory()) { // if is directory 
                currentTree[file] = {}; // 
                await buildTree(filePath, currentTree[file])
            } else {
                currentTree[file] = null;
            }
        }

    }
    await buildTree(directory, tree);
    return tree;

}



/*
Step by step Breakdown
1. Intiailize the Tree Structure:
const tree = {}
. We start by intiailizing an empty object tree which will hold the directory and file structure.
Define the Synchromous buildtree Function:
Defined the Buildtree fucnction with currentDire and current truee
How they working together
The buildtree function takes currentDir and curretnt tree  to build the tree structure recursively. Let's look at the flow of how they intreeact
Reading Directorly:
1. Curretnt Drectory is used to fs.readdir to read the content (files and sub directories of curretn directory.)
2. Processing each File/directory:
for each item (file of directory in ) curreDir a new path filePath is creating joinnig currentDir with titem's nam.


*/