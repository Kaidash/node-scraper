import database from "../utils/dbInit.js";

export default {
  async insertMenuItems(data, refId) {
    try {
      if (refId) {
        const dataWithRef = data.map((item) => ({
          ...item,
          restaurant: {
            $ref: "restaurants",
            $id: refId,
          },
        }));
        await database.insertMany(dataWithRef, "menuItems");
      } else {
        await database.insertMany(data, "menuItems");
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async insertMenuItem(data, refId) {
    try {
      if (refId) {
        await database.insertOne(
          {
            ...data,
            restaurant: {
              $ref: "restaurants",
              $id: refId,
            },
          },
          "menuItems"
        );
      } else {
        await database.insertOne(data, "menuItems");
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async clearMenuItems() {
    try {
      await database.clearCollection("menuItems");
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};
