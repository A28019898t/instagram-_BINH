require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const { logger } = require('./middleware/logger');
const handleError = require('./middleware/handleError')

const PORT = process.env.PORT || 3500;

app.use(cors());

app.use(logger);

app.use(cookieParser());

app.use('/', express.urlencoded({ extended: false }));

app.use('/', express.json());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));

app.use(handleError);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
