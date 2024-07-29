const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { initializeWebSocket } = require('./utils/webSocket');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const translationRoutes = require('./routes/translationRoutes');
app.use('/api/translations', translationRoutes);

initializeWebSocket(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
