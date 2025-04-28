import { google } from "googleapis";
import fs from "fs";

// Load folder ID from environment variable
const folderId = "1hL93E4VJavRfLxOwLEcw5nVglIeuSHTD";

const authClient = new google.auth.GoogleAuth({
    keyFile: "./models/drivedive-452616-eca22f9c1a56.json", // Replace with your actual JSON filename
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth: authClient });

// Function to upload a file to Google Drive
export const uploadToGoogleDrive = async (filePath, fileName) => {
    try {
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        const media = {
            mimeType: "image/jpeg", // Adjust based on the file type
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id, webViewLink",
        });
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        return response.data.webViewLink;
    } catch (error) {
        console.error("Error uploading to Google Drive:", error);
        throw error;
    }
};