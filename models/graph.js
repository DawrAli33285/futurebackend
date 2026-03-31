const mongoose = require('mongoose');

const transitGraphSchema = new mongoose.Schema({
  chart_type: {
    type: String,
    required: true,
    default: "Transit Graph"
  },
 
  form_data: {
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    location: {
      name: String,
      latitude: Number,
      longitude: Number
    },
    timezone: String,
    chartName: String
  },
  
  chart_data: [{
    day: String, 
    Sun: Number, 
    Moon: Number,
    Mercury: Number,
    Venus: Number,
    Mars: Number,
    Jupiter: Number,
    Saturn: Number,
    Uranus: Number,
    Neptune: Number,
    Pluto: Number
  }],
  
  chartName: {
    type: String
  },
  
  calculation_info: {
    data_points: Number,
    time_range_days: Number,
    time_range: {
      start: String, 
      end: String,    
      timezone: String
    },
    location: {
      name: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      fullAddress: String 
    },
    generated_at: {
      type: Date,
      default: Date.now
    },
    planets_tracked: [String] 
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model('TransitGraph', transitGraphSchema);