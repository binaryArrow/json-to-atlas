const {app, BrowserWindow, dialog} = require('electron')


const ipcMain = require('electron').ipcMain
const fs = require('fs')

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
        const nameForAtlas = name.replace(".json", ".png")
        const nameWithAse = name.replace(".json", ".ase")
        const file = JSON.parse(data.toString())
        console.log(file)
        const atlas = {
            name: nameForAtlas,
            size: `${file.frames[nameWithAse].frame.w}, ${file.frames[nameWithAse].frame.h}`,
            format: file.meta.format,
            tiles: []
        }
        file.meta.slices.forEach(entry => {
            atlas.tiles.push({
                name: entry.name,
                rotate: 'false',
                xy: `${entry.keys[0].bounds.x}, ${entry.keys[0].bounds.y}`,
                size: `${entry.keys[0].bounds.w}, ${entry.keys[0].bounds.h}`,
                orig: `${entry.keys[0].bounds.w}, ${entry.keys[0].bounds.h}`,
                offset: '0, 0',
                index: '-1'
            })
        })
        let outputPath = filePath.split('\\')
        const outPutFileName = outputPath.pop()
        stringBuilder(atlas, outputPath.join('\\'), outPutFileName)
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

function stringBuilder(atlas, filePath, outputFileName) {
    let atlasFormat = `${atlas.name}\nsize:${atlas.size}\nformat: ${atlas.format}`
    let tiles = ''
    atlas.tiles.forEach(tile =>{
        tiles += `\n${tile.name.replace(/\s/g, "")}\n  rotate: ${tile.rotate}\n  xy: ${tile.xy}\n  size: ${tile.size}\n  orig: ${tile.orig}\n  offset: ${tile.offset}\n  index: ${tile.index}`
    })

    fs.writeFileSync(`${filePath}/${outputFileName}.txt`, atlasFormat.concat(tiles))
}