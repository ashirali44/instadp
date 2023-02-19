const { readFile, writeFile, access } = require('fs/promises')
const fs = require('fs');

const saveFile = function save(state) {
    writeFile('temp.txt', state).catch(console.error);
}

const loadFile = async function load() {
    const rawState = await readFile('temp.txt');
    return JSON.parse(rawState);
}

const existFile = function exists() {
    return access('temp.txt').then(() => true).catch(() => false);
}

const deleteFile = function deleteCookies() {
    var error = true;
    const deleteFile = './temp.txt'
    if (fs.existsSync(deleteFile)) {
        error = false;
        fs.unlink(deleteFile, (err) => {
            if (err) {
                console.log(err);
            }
            error = false;
            console.log('deleted');
        })
    }else{
        error = false;
    }
    return error;
}

module.exports = {
    existFile, loadFile, saveFile, deleteFile
}