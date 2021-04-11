import {app, BrowserWindow} from 'electron'
import path from 'path'
import url from 'url'

export default async function (): any {
  await app.whenReady()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
}

function createWindow() {
  const startUrl =
    process.env.ELECTRON_START_URL ??
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    })

  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // and load the index.html of the app.
  mainWindow.loadURL(startUrl)

  //mainWindow.loadFile('index.html')

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}
