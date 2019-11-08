'use strict';

const Server = require('socket.io');

class Queue{
  constructor(name){
    this.events = new Set();
    this.name = name;
    this.q = Queue.io.of(`/${name}`);
    this.q.on('connect', this.connect.bind(this));
  }

  connection(socket){
    socket.on('subscribe', (event, callback) => {
      if(this.events.has(event)){
        socket.join(event);
        const message = `Subscribed to ${event} in ${this.name}`;
        console.log(message);
        if(callback) callback(undefined, message);
        console.log('All subscribe...', event, this.connections(event));
      } else {
        const message = `Invalid ${event}`
        console.log(message)
        if(callback) callback(message);
      }
    });
  }

  monitorEvent(event){
    this.events.add(event);
  }

  connections(event){
    return Object.keys(this.q.adapter.rooms[event].sockets);
  }

  static publish(message, callback){
    let {queue, event, payload} = message;
    Queue.io.of(queue).to(event).emit('trigger', payload);
    if(callback) callback();
  }

  static start(){
    let PORT = process.env.PORT || 3333;
    
    Queue.io = new Server(PORT);
    Queue.io.on('connection', socket => {
      console.log('connected');
      socket.on('publish', Queue.publish);
    });
    console.log(`Queue server up on ${PORT}`);
  }
}

module.exports = Queue;