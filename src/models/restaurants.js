import database from "../utils/dbInit.js";

export default {
  async insertRestaurant(data) {
    try {
      return await database.insertOne(data, "restaurants");
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async clearRestaurants() {
    try {
      await database.clearCollection("restaurants");
      console.log('Clear menu items from restaurants db');
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};
