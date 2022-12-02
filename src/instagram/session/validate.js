const { readFile, writeFile, access } = require('fs/promises')

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

module.exports = {
    existFile, loadFile, saveFile
}