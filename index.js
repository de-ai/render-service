'use strict';


// npm incl's
const express = require('express');
const app = express();

const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
//const unzip = require('unzip');
const extract = require('extract-zip');

// local incl's
const data = require('./assets/data.json');
const ssr = require('./views/server');
const template = require('./views/template');


// -=- CONFIG -=- //

// logger setup
const logger = winston.createLogger({
  level      : 'info',
  transports : [
//     new winston.transports.Console(),
    new winston.transports.File({ filename : '/var/log/render-service/info.log' })
  ]
});


// starting state of store
const initialState = {
  isFetching : false,
  apps       : data
};


// remove header
app.disable('x-powered-by');

// static paths
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use('/media', express.static(path.resolve(__dirname, 'media')));




// -=#-#-- start the server --#-#=- //
app.listen(process.env.NODE_PORT || 1066);




// --=/#/=-- GET handlers --=/#/=-- //
// -------------------------------- //

//-- root -/> /
app.get('/', (req, res)=> {
  logger.info('app.get(/)', { req:req.url, res:res.url });

  const { preloadedState, content } = ssr(initialState);
  const response = template('Server Rendered Page', preloadedState, content);
  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(response);
});

//-- client rendered -/> /client
app.get('/client', (req, res)=> {
  logger.info('app.get(/client)', { req:req.url, res:res.url });

  let response = template('Client Side Rendered page');
  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(response);
});

//-- file contents -/> /googlefdcf5eff7ee69de9,html
app.get('/googlefdcf5eff7ee69de9.html', (req, res)=> {
  logger.info('api.get(/googlefdcf5eff7ee69de9.html)', { req:req.url, res:res.url, dirname:__dirname });
  fs.createReadStream(`${__dirname}/media/googlefdcf5eff7ee69de9.html`);
});

//-- attempt to exit -/> /raze
app.get('/raze', (req, res)=> {
  logger.info('app.get(/raze)', { req:req.url, res:res.url, next });

  if (process.env.NODE_PORT) {
    res.send('Sorry, the server denies your request');

  } else {
    res.send('Shutting down…');
    process.exit(0);
  }
});


// --=/#/=-- POST handlers --=/#/=-- //
// --------------------------------- //
app.post('/anima-src', (req, res, next)=> {
  const { url, body, query, files } = req;
  logger.info('app.post(/anima-src)', { req :{ url, body, query, form:req.form, files }, res:res.url, next });

  const srcDir = `/var/opt/designengine/anima/src`;
  const extDir = `/var/opt/designengine/anima/ext`;

  new formidable.IncomingForm().parse(req, (err, fields, files)=> {
    logger.info('form.parse()', { err, fields, files });

    if (err) {
      return (res.status(500).json({ error : err }));
    }

    const { title } = fields;
    const { file } = files;

    fs.readFile(file.path, (err, data)=> {
      logger.info(`fs.readFile(${file.path})`, { err, data : data.length });
      if (err) {
        return (res.status(500).json({ error : err }));
      }

      fs.createReadStream(file.path).pipe(unzip.Extract({ path : extDir })).on('end', ()=> {
        logger.info(`fs.on('end') unzip "${filepath}" ->> "${extDir}"`);
//           this.unlink(file.path, (err)=> {});

        const srcPaths = {
          html : `${extDir}/${title}.html`,
          css  : `${extDir}/${title}.css`
        };

        fs.readFile(srcPaths.html, (err, data)=> {
          logger.info(`htmlStream.readFile(${srcPaths.html})`, { srcPaths, err, data });
        });
      });
    });

  }).on('field', (name, field)=> {
//     logger.info('form.on(field)', { name, field });

  }).on('fileBegin', (name, file)=> {
    logger.info('form.on(fileBegin)', { name, file });
    file.path = `${srcDir}/${file.name}`;

/*
    const rStream = fs.readFile(`${srcDir}/${file.name}`, (err, data)=> {
      logger.info('fs.readFile()', { err, data });

      if (err) {
        return (res.status(500).json({ error : err }));
      }

      const jszip = new JSZip();
      JSZip.loadAsync(data).then((contents)=> {
        const files = Object.keys(contents.files);
        logger.info('jszip.loadAsync()', { files });

        files.forEach((filename)=> {
          jszip.file(filename).async('nodebuffer').then((content)=> {
            logger.info('jszip.file(nodebuffer)', { filename, content });

            const filepath = `${extDir}/${filename}`;
            fs.writeFileSync(filepath, content);
          });
        });
      });
    });
*/
  }).on('file', (name, file)=> {
    logger.info('form.on(file)', { name, file });
//     res.status(200).json({ uploaded : true });

  }).on('end', ()=> {
    logger.info('form.on(end)');

//    req.on('end', next);
    res.end();
  });
});


/*

// add header
res.writeHead(200, {'Content-Type': 'text/html'});


// response content
res.write('YEEEEEE');

 */
