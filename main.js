'use strict';

const electron = require('electron');
const Tray = electron.Tray;
const fs = require('fs');
const path = require('path');
const ipcMain = electron.ipcMain;
const storage = require('node-persist');
const crypto = require('crypto');
const tty = require('tty.js');
const tmp = require('tmp');
const xml2js = require('xml2js');
const Gherkin = require('gherkin');

const testPersist = storage.create({dir: __dirname + '/persist/tests', ttl: false});
const projectPersist = storage.create({dir: __dirname + '/persist/projects', ttl: false});

const dialog = require('electron').dialog;

// Enable persistence
testPersist.init();
projectPersist.init();

ipcMain.on('asynchronous-message', function (event, type, data) {
        if (type == 'node-exec') {
            if (data) {
                var execFile = require('child_process').execFile;

                tmp.dir(function _tempDirCreated(err, tmpFolder, cleanupCallback) {
                    if (err) throw err;

                    // If we don't need the file anymore we could manually call the cleanupCallback
                    // But that is not necessary if we didn't pass the keep option because the library
                    // will clean after itself.
                    //cleanupCallback();


                    var configOpt = data.profileLocation ? '-c ' + data.profileLocation : '',
                        behatProfile = data.profile ? '-p ' + data.profile : '',
                        junit = '-f junit',
                        junitFolder = '--out=' + tmpFolder,
                        options = {
                            cwd: data.projectLocation
                        };


                    execFile('bin/behat', [behatProfile, configOpt, junit, junitFolder, data.features], options, function (error, stdout, stderr) {
                        var finder = require('findit')(tmpFolder);

                        //This listens for files found
                        finder.on('file', function (file) {
                            fs.readFile(file, 'utf8', function (err, fileData) {
                                if (err) {
                                    throw err;
                                }
                                var parse = path.parse(file);
                                var original_filename = parse.name.match('[^-]*$');
                                var parser = new xml2js.Parser();

                                parser.parseString(fileData, function (err, parsedResult) {

                                    var result = parsedResult ? parsedResult : fileData;
                                    if (error) {
                                        if (stderr) {
                                            if ((stderr.match(/\n/g) || []).length > 0) {
                                                stderr = stderr.split("\n")
                                            }
                                        }
                                        var payload = {
                                            key: Date.now(),
                                            outcome: 'error',
                                            profile: data.profile,
                                            error: error,
                                            stderr: stderr,
                                            xml: result,
                                            originalFile: original_filename[0] + '.feature'
                                        };
                                        cleanTestSave(data.id, payload);
                                        event.sender.send('asynchronous-reply', 'node-exec-reply');
                                    }
                                    else {
                                        if (stdout && (stdout.match(/\n/g) || []).length > 0) {
                                            stdout = stdout.split("\n")
                                        }
                                        var payload = {
                                            key: Date.now(),
                                            outcome: 'success',
                                            profile: data.profile,
                                            stdout: stdout,
                                            xml: result,
                                            originalFile: original_filename
                                        };
                                        cleanTestSave(data.id, payload);
                                        event.sender.send('asynchronous-reply', 'node-exec-reply');

                                    }
                                });
                            });
                        });
                    });
                });
            }

        } else if (type == 'behat-search') {
            //This sets up the file finder
            var finder = require('findit')(data);
            //This listens for files found
            finder.on('file', function (file) {
                var parse = path.parse(file);
                if (parse.base == 'composer.lock') {
                    fs.readFile(file, 'utf8', function (err, data) {
                        if (err) {
                            throw err;
                        }
                        if (data) {
                            var json = JSON.parse(data);
                            json.packages.filter(function (item) {
                                if (item.name == 'behat/behat') {
                                    event.sender.send('asynchronous-reply', 'composer.lock', item.version, file, path.basename(parse.dir), parse);
                                }
                            });
                        }
                    });
                }
            });
            finder.on('end', function () {
                event.sender.send('asynchronous-reply', 'stopped_scanning');
            });
        }  else if (type == 'fileEdit') {
            if (data) {
            fs.readFile(data, 'utf8', function (err, data) {
                    if (err) {
                        event.sender.send('asynchronous-reply', 'fileEdit', null);
                    }
                    if (data) {
                        var parser = new Gherkin.Parser();
                        try {
                        var gherkinDocument = parser.parse(data);
                        } catch (e) {
                          event.sender.send('asynchronous-reply', 'fileEdit', {success: false, data: e});
                        }
                        event.sender.send('asynchronous-reply', 'fileEdit', {success: true, dataRaw: data, dataComposed: gherkinDocument});
                    }
                });            
            }
        } else if (type == 'profileLookup') {
            if (data) {
                fs.readFile(data, 'utf8', function (err, data) {
                    if (err) {
                        event.sender.send('asynchronous-reply', 'profileLookup', null);
                    }
                    if (data) {
                        var yaml = require('js-yaml');
                        try {
                          var yamlData = yaml.safeLoad(data);
                        } catch (e) {
                          event.sender.send('asynchronous-reply', 'profileLookup', {success: false, data: e});
                        }
                        event.sender.send('asynchronous-reply', 'profileLookup', {success: true, data: yamlData});
                    }
                });
            }
        } else if (type == 'featureListing') {
            if (data) {
                fs.access(data, fs.F_OK, function (err) {
                    if (!err) {
                        var dirTree = require('directory-tree');
                        var filteredTree = dirTree.directoryTree(data);
                        event.sender.send('asynchronous-reply', 'featureListing', {fileTree: filteredTree});
                    } else {
                        event.sender.send('asynchronous-reply', 'featureListing', null);
                    }
                });
            }

        } else if (type == 'node-persist-project-save') {
            if (data) {
                var key = crypto.createHash('md5').update(data.projectLocation).digest("hex");
                var existing_item = projectPersist.getItem(key);
                if (existing_item) {
                    //Project is already saved
                    event.sender.send('asynchronous-reply', 'project_already_exists', 'node-persist');
                } else {
                    //Save Project
                    projectPersist.setItem(key, {
                        key: key,
                        projectName: data.projectName,
                        version: data.version,
                        featuresLocation: data.featuresLocation,
                        profileLocation: data.profileLocation,
                        projectLocation: data.projectLocation
                    });
                }
            }
        } else if (type == 'node-persist-project-listing-lookup') {
            var projects = projectPersist.values();
            event.sender.send('asynchronous-reply', 'node-persist-project-listing-lookup', projects);
        } else if (type == 'node-persist-project-delete') {
            if (data) {
                projectPersist.removeItem(data.project.key, /* optional callback */ function (err) {
                    if (err) {
                        throw err;
                    } else {
                        event.sender.send('asynchronous-reply', 'node-persist-project-delete', data.project.key);
                    }
                });
            }
        } else if (type == 'node-persist-project-detail-lookup') {
            if (data) {
                projectPersist.getItem(data.id, function (err, value) {
                    if (err) {
                        throw err;
                    }
                    if (value) {
                        event.sender.send('asynchronous-reply', 'node-persist-project-detail-lookup', value);
                    }
                });
            }
        } else if (type == 'node-persist-project-test-lookup') {
            if (data) {
                testPersist.getItem(data.id + '-tests', function (err, value) {
                    if (err) {
                        console.log(err);
                    }
                    if (value) {
                        event.sender.send('asynchronous-reply', 'node-persist-project-test-lookup', value);
                    }
                });
            }
        } else if (type == 'node-persist-project-test-remove') {
            if (data) {
                testPersist.removeItem(data.id + '-tests', function (err, value) {

                    if (err) {
                        throw err;
                    }
                    if (value) {
                        event.sender.send('asynchronous-reply', 'node-persist-project-test-remove', value);
                    }
                });
            }
        } else if (type == 'saveFile') {
            if (data && data.file && data.fileData) {
                fs.writeFile(data.file, data.fileData, 'utf8', function (err) {
                    if (err) {
                        event.sender.send('asynchronous-reply', 'saveFile', null);
                    }
                    else {
                        event.sender.send('asynchronous-reply', 'saveFile', true);
                    }
                })
            }
        }
    }
);


function cleanTestSave(projectID, payload) {
    testPersist.getItem(projectID + '-tests', function (err, existing_data) {
        if (err) {
            throw err;
        }
        // If there are existing feature tests
        if (existing_data) {
            var keys = existing_data ? Object.keys(existing_data).length : {};
            existing_data[keys] = payload;
            saveTest(projectID, existing_data);
            // New feature tests
        } else {
            var initialData = [];
            initialData[0] = payload;
            saveTest(projectID, initialData);
        }
    });
}


function saveTest(projectID, payload) {
    testPersist.setItem(projectID + '-tests', payload, function (err, value) {
        if (err) {
            throw err;
        }
    })
}

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var appIcon = null;
var trayBounds = null;

function createWindow() {

    appIcon = new Tray(__dirname + '/mad-hatter-hat-hi.png');

    //   appIcon = new Tray('./icon_48x48.png');
    appIcon.setToolTip('Netflix Remote');

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        icon: __dirname + '/mad-hatter-hat-hi.png'
    });

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/dist/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // console.log(dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]}));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }

});


