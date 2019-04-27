
const express = require('express');
const app = express();
const formidable = require('formidable');
const fs = require('fs');
// const nodemon = require('nodemon');
const morgan = require('morgan');
const template = require('./views/template');
const zlib = require('zlib');
const path = require('path');



//var fsAccessLog = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
var fsAccessLog = fs.createWriteStream(path.join('/var/log/node-express', 'access.log'), { flags : 'a' });

// app config
//app.use(morgan('combined'));
app.use(morgan('combined',
  { stream : fsAccessLog }
));

// Serving static files
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use('/media', express.static(path.resolve(__dirname, 'media')));

// hide powered by express
app.disable('x-powered-by');

// start the server
app.listen(process.env.PORT || 1066);

// our apps data model
const data = require('./assets/data.json');

let initialState = {
  isFetching : false,
  apps       : data
};

//SSR function import
const ssr = require('./views/server');

// server rendered home page
app.get('/', (req, res)=> {
  const { preloadedState, content } = ssr(initialState);
  const response = template('Server Rendered Page', preloadedState, content);
  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(response);
});

// Pure client side rendered page
app.get('/client', (req, res)=> {
  let response = template('Client Side Rendered page');
  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(response);
});

// contents of file
app.get('/googlefdcf5eff7ee69de9.html', (req, res) => {
  console.log('||', 'api.get()', __dirname, req.url);
  fs.createReadStream(__dirname+'/media/googlefdcf5eff7ee69de9.html');
});

//app.get('/googlefdcf5eff7ee69de9.html', (req, res) => {
//  fs.createReadStream("my-self-esteem.txt");
//});

// tiny trick to stop server during local development
app.get('/exit', (req, res)=> {
  if (process.env.PORT) {
    res.send('Sorry, the server denies your request');

  } else {
    res.send('Shutting down…');
    process.exit(0);
  }
});


app.post('/anima-zip', (req, res, next)=> {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files)=> {
    if (err) {
      return (res.status(500).json({ error : err }));
    }

    res.status(200).json({ uploaded : true });

  });


  form.on('fileBegin', (name, file)=> {
    const [fileName, fileExt] = file.name.split('.');
    file.path = path.join(uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
  })





    var old_path = files.file.path,
      file_size = files.file.size,
      file_ext = files.file.name.split('.').pop(),
      index = old_path.lastIndexOf('/') + 1,
      file_name = old_path.substr(index),
      new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);

    fs.readFile(old_path, function(err, data) {
      fs.writeFile(new_path, data, function(err) {
        fs.unlink(old_path, function(err) {
          if (err) {
            res.status(500);
            res.json({'success': false});

          } else {
            res.status(200);
            res.json({'success': true});
          }
        });
      });
    });
  });


  let body = '';
  const zipPath = `${__dirname}/public/src_zip/${req.body.filename}`;
  req.on('data', (data)=> {
    body += data;
  });

  req.on('end', ()=> {
    fs.appendFile(zipPath, body, ()=> {

      const rs = fs.createReadStream(zipPath);
      const unzip = zlib.createGunzip();



      res.end();

    });

    next();
  });


  //req.on('end', next);

  const fileContents = fs.createReadStream(`./data/${filename}`);
  const writeStream = fs.createWriteStream(`./data/${filename.slice(0, -3)}`);
  const unzip = zlib.createGunzip();
  fileContents.pipe(unzip).pipe(writeStream).on('finish', (err) => {
    if (err) return reject(err);
    else resolve();
  })


});

/*
// restart if change --#
nodemon({
  script : 'index.js',
  ext    : 'js json'
});

nodemon.on('start', ()=> {
  console.log('It has started!');

}).on('quit', ()=> {
  console.log('App has quit :(');
  process.exit();

}).on('restart', (files)=> {
  console.log('App restarted due to: ', files);
});

*/

//-- new Promise((_)=> null);
