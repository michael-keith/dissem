require('dotenv').config();

let request = require('request');

function getPage(data) {
  let query = "https://www.theguardian.com/world/gallery/2019/feb/26/vietnam-summit-kim-jong-un-donald-trump-in-pictures";
  request("https://www.reddit.com/search.json?q=url:" + query, function (error, response, body) {
    body = JSON.parse(body);
    body.data.children.forEach( function(d) {
      console.log("- " + d.data.title + "( " + d.data.url + " )");
    });

  });
}

getPage();
