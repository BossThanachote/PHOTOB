import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json({ limit: "10mb" }));

interface ImageRequest extends Request {
    body: {
        image: string;
    };
}

app.post("/api/saveImage", (req: ImageRequest, res: Response) => {
    const { image } = req.body;
    const base64Data = image.replace(/^data:image\/png;base64,/, "");

    const filePath = path.join(__dirname, "images", `image_${Date.now()}.png`);
    fs.writeFile(filePath, base64Data, "base64", (err) => {
        if (err) {
            console.error("Failed to save image:", err);
            return res.status(500).send("Failed to save image");
        }
        
        const imageUrl = `/images/${path.basename(filePath)}`;
        res.json({ url: imageUrl });
    });
});

app.listen(3030, () => {
    console.log("Server is running on port 3030");
});
