'use strict';

const config = {
  main: 'https://volbysr.sk/json/tab01.json',
  party: 'https://volbysr.sk/json/tab03.json'
};

const express = require('express'),
  sse = require('express-sse'),
  fetch = require('node-fetch'),
  dhondt = require('dhondt'),
  _ = require('lodash');


let data = {
};

const stream = new sse([data]);

setInterval(() => {
  load('main');
  load('party', transformParty);
}, 1000);

let app = express();

app.use(express.static('public'));
app.get('/stream', stream.init);

app.listen(3000);

function transformParty(parties) {
  var x = _(parties)
    .map(a => {
      return {
        name: a.C02,
        percentage: parseFloat(a.C04.replace(',', '.')),
        votes: parseInt(a.C03.replace(' ', ''))
      };
    })
    .filter(a => a.percentage >= 5)
    .value();

  dhondt.compute(x, 150, {
    voteAccessor: a => a.votes,
    resultProperty: 'mandates',
  });

  return x;
}

function load(name, transformation) {
  fetch(config[name])
    .then(res => res.json())
    .then(json => {
      let transformed = transformation ? transformation(json) : json;
      update(name, transformed);
    })

}

function update(name, newData) {
  if (_.isEqual(data[name], newData)) {
    return;
  }

  data[name] = newData;

  console.log(data);

  stream.send([data]);
  stream.updateInit([data]);
}

