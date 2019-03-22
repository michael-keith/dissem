require('dotenv').config();

let request = require('request');

let mysql = require('mysql');
let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : 'mkeit001_dissem'
});

function getLinks() {

  let sql = "SELECT id,link FROM articles WHERE timestamp > ?";
  let inserts = [0];
  sql = mysql.format(sql, inserts);

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;

    results.forEach( function(url) {
      getPage(url.id, url.link);
    });

  });

}

function getPage(article_id, url) {
  let query = "https://www.reddit.com/search.json?q=url:" + url;
  request(query, function (error, response, body) {
    body = JSON.parse(body);
    console.log("-----------------------------------------");
    console.log(url);
    body.data.children.forEach( function(d) {
      console.log(d.data.subreddit_id + "/" + d.data.id + " [" + d.data.subreddit + "] " + d.data.title + "(+" + d.data.ups + "|-" +  d.data.downs + ")");
      checkExists(article_id, d.data);
    });
  });
}

function checkExists(article_id, data) {
  let reddit_id = data.subreddit_id + "" + data.id;

  let sql = "SELECT * FROM reddit WHERE reddit_id = ?"
  let inserts = [reddit_id];
  sql = mysql.format(sql, inserts);
  pool.query(sql, function (error, results, fields) {
    if(results[0]) { console.log( "ALREADY EXISTS: " + results[0].title ); }
    else { addArticle(article_id, data); }
  })
}

function addArticle(article_id, data) {
  console.log("ADDED: " + data.title);
  let sql = "INSERT INTO reddit(article_id, reddit_id, title, subreddit, ups, downs, comments) VALUES(?,?,?,?,?,?,?)";
  let inserts = [article_id, data.subreddit_id + "" + data.id, data.title, data.subreddit, data.ups, data.downs, data.num_comments];
  sql = mysql.format(sql, inserts);
  pool.query(sql, function (error) {if (error) throw error;});
}

getLinks();
