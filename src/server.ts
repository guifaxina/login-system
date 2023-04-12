import express from "express";
import router from "./routes/routes";

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use("/api/v1", router)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));