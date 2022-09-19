const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export default class Database {
  // Class constructor
  constructor(mongoclient, database, url) {
    this.mongoclient = mongoclient;
    this.url = url;
    this.database = database;
  }

  async insertOne(data, collection) {
    const client = await this.mongoclient.connect(this.url, options);
    const db = client.db(this.database).collection(collection);
    const res = await db.insertOne(data);
    client.close();
    return res;
  }

  async insertMany(data, collection) {
    const client = await this.mongoclient.connect(this.url, options);
    const db = client.db(this.database).collection(collection);
    const res = await db.insertMany(data);
    client.close();
    return res;
  }

  async clearCollection(collection) {
    const client = await this.mongoclient.connect(this.url, options);
    const db = client.db(this.database).collection(collection);
    const res = await db.deleteMany({});
    client.close();
    return res;
  }
}
