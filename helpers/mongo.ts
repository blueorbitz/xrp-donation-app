import { connect } from 'http2';
import * as mongoDB from 'mongodb'

declare global {
  var _mongoConnection: any;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let { client, connection } : {
  client?: mongoDB.MongoClient,
  connection?: any,
} = {};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoConnection) {
    client = new mongoDB.MongoClient(process.env.MONGODB_URI, {});
    global._mongoConnection = client.connect();
  }
  connection = global._mongoConnection;
}
else {
  // In production mode, it's best to not use a global variable.
  client = new mongoDB.MongoClient(process.env.MONGODB_URI, {});
  connection = client.connect();
}

export default connection;