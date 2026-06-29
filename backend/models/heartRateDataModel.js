const mongoose = require('mongoose');

const heartRateDataSchema = new mongoose.Schema({
    time: { 
        type: String, 
        required: [true, "Time"] 
    },
    
    date: { 
        type: String, 
        required: [true, "Date"] 
    },

    heartRate: { 
        type: Number, 
        required: [ true, "HeartRate" ]
    },

    recommendation: { 
        type: String,
        required: [ true, "Recommendation" ]
    }
});

module.exports = mongoose.model('HeartRateData', heartRateDataSchema);
