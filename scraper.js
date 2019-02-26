require('dotenv').config()

let request = require('request');
let parseString = require('xml2js').parseString;

let urls = require('./scraper_data.json');

let mysql      = require('mysql');
let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : 'pubprop'
});

urls.forEach(getPage);

function getPage(data) {
  request(data.url, function (error, response, body) {
    parseString(body, function (err, result) {
      let items = result.rss.channel[0].item;
      items.forEach(function(item){
        checkExists(data, item);
      });
    });
  });
}

function checkExists(data, item) {
  let date = new Date(item.pubDate);
  let sql = "SELECT * FROM articles WHERE title = ? and link = ?"
  let inserts = [item.title[0], item.link];
  sql = mysql.format(sql, inserts);
  pool.query(sql, function (error, results, fields) {
    if(results[0]) { console.log( "ALREADY EXISTS: " + results[0].title ); }
    else { addArticle(data, date, item); }
  })
}

function addArticle(data, date, item) {
  console.log("ADDED: " + item.title[0] + " - " + date + " - " + item.pubDate)
  let sql = "INSERT INTO articles(source, title, link, category, date) VALUES(?,?,?,?,?)";
  let inserts = [data.source, item.title[0], item.link, data.category, date];
  sql = mysql.format(sql, inserts);
  pool.query(sql, function (error) {if (error) throw error;});
}

//Convert a date string to timestamp
function convert_date(date_string) {
  ts = new Date(Date.parse( date_string.replace( /(\w{3}), (\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2})/, "$1 $3 $2 $4 $5:$6:$7") ));
  //return ts.getTime() / 1000
  return ts;
}
