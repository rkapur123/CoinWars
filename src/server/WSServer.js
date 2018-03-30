const WebSocket = require('ws')
const http = require('http')

const server = http.createServer()
const wss = new WebSocket.Server({ server })
const startApp = require('./start_app')

wss.on('connection', function connection(ws, req) {
  console.log(`Connected to coinWar private server at ${req.connection.remoteAddress}`)

  ws.on('message', function incoming(data) {
    console.log(data);
  })

  ws.send(`Connected to CoinWar server`)

  startApp.start(function(number) {
    console.log(number)
  })

})

server.listen(8080, function listening() {
  console.log('CoinWar private server listening on %d', server.address().port)

})
