import { MongoClient } from "mongodb";
import Database from "./database.js";

const { DB_USER, DB_PASSWORD, DB_NAME, MONGO_PORT } = process.env;

const url = `mongodb://${DB_USER}:${DB_PASSWORD}@localhost:${MONGO_PORT}`;
const database = new Database(MongoClient, DB_NAME, url);

export default database;
