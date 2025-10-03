const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const projectsRouter = require("./routes/projects");
const cracksRouter = require("./routes/cracks");
const readingsRouter = require("./routes/readings");
const app = express();
app.use(cors());
app.use(bodyParser.json());
// para subir fotos (instalacion_foto)
const upload = multer({ dest: path.join(__dirname, "uploads/") });
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ path: `/uploads/${req.file.filename}` });
});
app.use("/projects", projectsRouter);
app.use("/cracks", cracksRouter);
app.use("/readings", readingsRouter);
// Servir uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
