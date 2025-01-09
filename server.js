import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ytdl from '@distube/ytdl-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/video-info', async (req, res) => {
    try {
        const videoURL = req.query.url;
        console.log("Received video URL:", videoURL);

        if (!videoURL || !ytdl.validateURL(videoURL)) {
            return res.status(400).json({ error: "Invalid YouTube URL provided." });
        }

        const info = await ytdl.getInfo(videoURL);
        const formats = info.formats.filter(format => format.hasVideo && format.hasAudio);

        res.json({
            title: info.videoDetails.title,
            formats: formats.map(format => ({
                quality: format.qualityLabel,
                itag: format.itag,
                mimeType: format.mimeType,
            })),
        });
    } catch (error) {
        console.error("Error fetching video info:", error.message);
        res.status(500).json({ error: "Failed to fetch video information. Please try again later." });
    }
});

// app.get('/video-info', async (req, res) => {
//     try {
//         const videoURL = req.query.url;
//         console.log("Received video URL:", videoURL);

//         if (!videoURL || !ytdl.validateURL(videoURL)) {
//             return res.status(400).json({ error: "Invalid YouTube URL provided." });
//         }

//         const info = await ytdl.getInfo(videoURL);

//         // Group formats by quality label
//         const groupedFormats = info.formats.reduce((acc, format) => {
//             if (format.qualityLabel) {
//                 if (!acc[format.qualityLabel]) {
//                     acc[format.qualityLabel] = [];
//                 }
//                 acc[format.qualityLabel].push({
//                     itag: format.itag,
//                     mimeType: format.mimeType,
//                     hasVideo: format.hasVideo || false,
//                     hasAudio: format.hasAudio || false,
//                 });
//             }
//             return acc;
//         }, {});

//         res.json({
//             title: info.videoDetails.title,
//             qualities: groupedFormats, // Grouped formats by quality
//         });
//     } catch (error) {
//         console.error("Error fetching video info:", error.message);
//         res.status(500).json({ error: "Failed to fetch video information. Please try again later." });
//     }
// });

app.get('/download', async (req, res) => {
    try {
        const { url, itag } = req.query;

        if (!url || !itag) {
            return res.status(400).json({ error: "URL and itag are required for downloading." });
        }

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid YouTube URL provided." });
        }

        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });

        if (!format) {
            return res.status(400).json({ error: "Invalid itag or format not available." });
        }

        res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
        ytdl(url, { format, highWaterMark: 1024 * 1024 * 64 }).pipe(res);
    } catch (error) {
        console.error("Error during download:", error.message);
        res.status(500).json({ error: "Failed to download video. Please try again later." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
