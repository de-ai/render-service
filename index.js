const express = require('express'),
          app = express(),
           fs = require('fs'),
//      nodemon = require('nodemon'),
     template = require('./views/template'),
         path = require('path');


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
  res.send('google-site-verification: googlefdcf5eff7ee69de9.html');
});

app.get('/googlefdcf5eff7ee69de9.html', (req, res) => {
  fs.createReadStream("my-self-esteem.txt");
});

// tiny trick to stop server during local development
app.get('/exit', (req, res)=> {
  if (process.env.PORT) {
    res.send('Sorry, the server denies your request');

  } else {
    res.send('Shutting down…');
    process.exit(0);
  }
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


