const express = require('express');
const app = express();
const projectsRouter = require('./routes/projects');
const cracksRouter = require('./routes/cracks');
const readingsRouter = require('./routes/readings');

app.use(express.json());
app.use('/projects', projectsRouter);
app.use('/cracks', cracksRouter);
app.use('/readings', readingsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
