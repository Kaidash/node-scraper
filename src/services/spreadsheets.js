import { GoogleSpreadsheet } from "google-spreadsheet";

const {
  GOOGLE_SPREADSHEET_URL,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
} = process.env;

export default {
  async addDataToSpreadsheetByIndex(rows, index) {
    try {
      const doc = new GoogleSpreadsheet(GOOGLE_SPREADSHEET_URL);
      await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[index]; // the first sheet
      await sheet.setHeaderRow(Object.keys(rows[0]));
      await sheet.addRows(rows);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  async clearSheet() {
    try {
      const doc = new GoogleSpreadsheet(GOOGLE_SPREADSHEET_URL);
      await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
      await doc.loadInfo();
      const restaurantTable = doc.sheetsByIndex[0];
      const menuItemsTable = doc.sheetsByIndex[1];

      const clearRestaurantTable = async () => {
        await restaurantTable.clear();
      };
      const clearMenuItemsTable = async () => {
        await menuItemsTable.clear();
      };

      await Promise.all(clearRestaurantTable(), clearMenuItemsTable());
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};
