const fs = require('fs');
fs.readFile('example.txt', (err, data) => {
  if (err) {
    return console.log('err---> ', err);
  }
});
