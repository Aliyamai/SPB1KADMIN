const express = require("express");
const { google } = require("googleapis");
const app = express();
const PORT = 3000;

// Load Google API credentials
const credentials = require("./credentials.json");

async function getSheetData() {
    const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const SPREADSHEET_ID = "1IiF20cCiOsIDszL1tNl5W772fip1M2-kaqgAVGYOu9o";
    const RANGE = "Sheet1!A1:Z1000";

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
        return [];
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i] || "";
        });
        return obj;
    });

    return data;
}

app.get("/api/data", async (req, res) => {
    try {
        const data = await getSheetData();
        res.json({ status: "success", data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});
