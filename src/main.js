const {app, BrowserWindow, dialog} = require('electron')


const ipcMain = require('electron').ipcMain
const fs = require('fs')
const {AtlasModel} = require("./models/AtlasModel");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    })
    win.loadFile('src/index.html')
    win.webContents.openDevTools()
}

function openDialog() {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{extensions:['json']}]
    }).then(input => {
        createAtlasFromJson(input.filePaths[0])
    })
}

function createAtlasFromJson(filePath){
    fs.readFile(filePath,(err, data)=>{
        if(err) throw err
        const path = require('path')
        const name = path.basename(filePath)
        const file = JSON.parse(data.toString())
    })
}
app.whenReady().then(()=>{
    createWindow()
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
})
app.on("open-file", file=>{
    console.log(file)
})

ipcMain.on('fileInput', ()=>{
    openDialog()
})