const express = require('express')
const cors = require('cors')
const app = express();

var exec = require('child_process').exec;

var result = function(command, cb){
  var child = exec(command, function(err, stdout, stderr){
    if(err != null){
      return cb(new Error(err), null);
    }else if(typeof(stderr) != "string"){
      return cb(new Error(stderr), null);
    }else{
      return cb(null, stdout);
    }
  });
};
app.use(cors());

app.get('/', function (req, res) {
  result("cd ../../fake-git && git2json", (err, r) => {
    res.send(r)
  });
});

app.get('/reset', function (req, res) {
  if (req.query.secret === 'THISISNOTREALLYASECRET') {
    result("cd ../../fake-git && rm -rf .git && rm -rf ./* && git init && touch a.txt && git checkout -b master && git add . && git commit -m \"init commit\"", (err, r) => {
      console.log(r);
      res.send('Done')
    });
  } else {
  console.log('hmmm hmmm');
    res.send('Oh hell NO!')
  }


});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});


