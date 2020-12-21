const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const { execSync } = require("child_process");
const log = require('./log');

function isDirectory(source) {
  return lstatSync(source).isDirectory();
}

function getDirectories(source) {
  return readdirSync(source).map(name => join(source, name)).filter(isDirectory);
}

function installTesty(test) {
  return execSync('npm link testyts', { cwd: test });
}

function run(command, test) {
  return execSync(command, { cwd: join(test) });
}

function unlinkTesty() {
  log.debug('Unlinking TestyTs')
  execSync('npm unlink', { cwd: join(__dirname, '/../') });
}

function linkTesty() {
  unlinkTesty();

  log.debug('Linking TestyTs.')
  execSync('npm link', { cwd: join(__dirname, '/../') });
}

module.exports = { isDirectory, getDirectories, installTesty, run, unlinkTesty, linkTesty };