const express = require("express");
const mongoose = require("mongoose");
const body_parser = require("body-parser");

const app = express();

// create a middleware
app.use(body_parser.json());

// create db body
let dbBody = {
    _id: mongoose.Schema.Types.ObjectId,
    payload: {
        date: String,
        author: String,
        log: String
    }
}

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/daily_logs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Connected to mongo db");
    })
    .catch((err) => { console.error('Error connecting to MongoDB: ' + err) });

//Log schema
const logSchema = new mongoose.Schema(dbBody);

//Log model
const log = mongoose.model('Log', logSchema);

// add daily log
app.post('/addLog', async (req, res) => {
    const { date, author, logContent } = req.body;
    if (!date || !author || !logContent) {
        return res.status(400).json({ message: 'Date, author, and log content are required' });
    }

    const logEntry = {
        date: date,
        author: author,
        log: logContent
    };

    try {
        // Find the existing document
        let logDoc = new log({
            _id: new mongoose.Types.ObjectId(),
            payload: logEntry // Initialize dateLog as a Map with one entry
        });

        // Save the document
        const savedLog = await logDoc.save();
        res.status(201).json(savedLog);
    } catch (err) {
        res.status(500).json({ message: 'Failed to save log', error: err.message });
    }
});



// get all daily logs
app.get('/getLogs', async (req, res) => {
    try {
        const logs = await log.find();
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve logs', error: err.message });
    }
});

// get single log
app.get('/getLogs/:date', async (req, res) => {
    const { date } = req.params;
    try {
        // Find the document containing the specified date
        const logDoc = await log.findOne({ 'payload.date': date });

        if (!logDoc) {
            return res.status(404).json({ message: 'No logs found' });
        }
        res.status(200).json(logDoc.payload);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve log', error: err.message });
    }
});

// delete endpoint
app.delete('/logs/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const deleteLog = await log.deleteOne({ 'payload.date': date });

        if (deleteLog.deletedCount === 0) {
            return res.status(404).json({ message: 'No log found for this date' });
        }

        res.status(200).json({ message: 'Log deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete log', error: err.message });
    }
});


// start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('server started at port: ' + PORT.toString());
});