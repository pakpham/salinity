console.log("Temp - cloudMQTT - Mongodb");
console.log('======== P A K ===========');
// var date = new Date();
// var current_hour = new Date();
// current_hour = current_hour.toDateString()
// console.log (current_hour);

var express = require ('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var previousS1 = 0;
var previousS2 = 0;
//var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://pakpham:anhkhuong95@pak-shard-00-00-rtdiq.mongodb.net:27017,pak-shard-00-01-rtdiq.mongodb.net:27017,pak-shard-00-02-rtdiq.mongodb.net:27017/pak?ssl=true&replicaSet=pak-shard-0&authSource=admin";

// var date = new  moment().format();
//var hour = moment().hour();
// console.log (date);

// CONNECT TO CLOUD MQTT 
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://ESP8266_MCU:123456@m12.cloudmqtt.com:12038');
var humidity = 0;
var previousS1 = 0;
var previousS2 = 0;
var previousState = 0;


// CONNECT DATABASE
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log ("Connected to DATABASE");
//   db.createCollection("temp-database", function(err, res) {
//     if (err) throw err;
//     console.log("Collection created!");
//     db.close();
//   });
// });


var state = 0;
var counter = 3;
var temp; 
var loopIntervalState;


app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendfile( __dirname + "/" +"public" + "/" + "index.html" );
});
app.get('/', function(req, res){
  res.sendfile( __dirname + "/home" +"public" + "/" + "index.html" );
});
// app.get('/secret', function (req, res) {
//   res.sendfile (__dirname+ '/' + 'public' + '/' + 'secret.html');
// })
app.get('/chart', function (req, res) {
  res.sendfile (__dirname+ '/' + 'public' + '/' + 'chart.html');
})
app.use(function (req, res, next) {
  res.status(404).sendfile( __dirname + "/" +"public" + "/" + "404.html" );
});

io.on ('connection', function (socket) {
  console.log('ID: ' + socket.id);
  var send_browser_loop;
  socket.on ('connect_server', function () {
    send_browser_loop = setInterval(function () {
      socket.emit ('mcu_state', {'data' : state});
      if (state == 1 ) {
        if ((s1 != previousS1) || (s2 != previousS2)){
          socket.emit ('mcu_data', {'s1' : s1, 's2': s2});
          console.log (socket.id+' Send data to Browser!');
          previousS1 = s1;
          previousS2 = s2;
        }
      }
      else {
              console.log ("MCU Disconnect");
               // clearInterval (send_browser_loop);
            }
    },1000);
  });  


  // socket.on('downloadData', function () {
  //   MongoClient.connect(url, function(err, db) {
  //     if (err) throw err;
  //     var query = { hour: 19 };
  //     db.collection("temp-database").find(query).toArray(function(err, result) {
  //       if (err) throw err;
  //       socket.emit ('data', result);
  //       console.log(result.length);
  //       db.close();
  //     });
  //   });
  // })

  socket.on ('disconnect', function () {
    console.log('Browser Disconnect!');
    clearInterval (send_browser_loop);
  });  
})


client.on('connect', function() {
  console.log('CONNECTED cloudMQTT');
  client.subscribe('Indicator1/message');
  //client.subscribe('temp1');
  client.on ('message', function(topic, message, packet) {
    console.log ('==========================================================================');
    console.log("           Received '" + message + "' on '" + topic + "'");
    console.log ('==========================================================================');
    if (topic == 'Indicator1/message') {
      console.log ("Received JSON on cloudMQTT: " + message);
      var obj  = JSON.parse (message);
      s1 = obj.S1;
      s2 = obj.S2;
  
      console.log ("JSON Parse....");
      console.log ('S1 : '+ s1);
      console.log ('S2 : ' + s2);

      state = 1;
      clearTimeout(loopIntervalState);
      loopIntervalState =  setTimeout (function () {
        state = 0;
      }, 3000);
    }
        // else if (topic == 'temp1') {

        // }
      });

  // publish a message to a topic
  // client.publish('demo', '1', function() {
  //   console.log("Message is published");
  //   // client.end(); // Close the connection when published
  // });
});

var server   =  http.listen(process.env.PORT || 3000, function() {
  var host = server.address ().address;
  var port = server.address().port;
  console.log(host);
  console.log ("The server is listen on: http://%s:%s", host, port);
})