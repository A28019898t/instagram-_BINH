const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage')
const multer = require('multer');
const firebaseConfig = require('../config/firebaseConfig');
const { format } = require('date-fns')

// Initialize a firebase application
initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

// Setting up multer as a middleware to grab photo up loads
const upload = multer({ storage: multer.memoryStorage() });

// Set date
const currentDateTime = () => format(new Date(), 'yyyy-MM-dd hh:MM:ss');

module.exports = { storage, upload, currentDateTime }