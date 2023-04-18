import express from "express";
import router from "./routes/routes";
import cors from "cors";

const PORT = 3000;

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN_URL
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/v1", router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
