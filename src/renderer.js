const ipcRenderer = require('electron').ipcRenderer

function openDialog(){
    ipcRenderer.send('fileInput')
}

document.querySelector('#fileInput').addEventListener('click', ()=>{
    openDialog()
})