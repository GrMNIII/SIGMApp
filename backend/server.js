const express = require('express');
const app = express();
const projectsRouter = require('./routes/projects');
const cracksRouter = require('./routes/cracks');
const readingsRouter = require('./routes/readings');
const exportRoutes = require('./routes/export');

app.use(express.json());
app.use('/api/projects', projectsRouter);
app.use('/api/cracks', cracksRouter);
app.use('/api/readings', readingsRouter);
app.use('/api', exportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
