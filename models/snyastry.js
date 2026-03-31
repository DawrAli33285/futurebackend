
const mongoose = require('mongoose');

const natalChartSchema = new mongoose.Schema({
  chart_type: {
    type: String,
    required: true,
    default:'synastry'
  },
  chartName:{
    type:String,
required:true

  },
  userId:{
type:mongoose.Schema.ObjectId,
ref:'user'
  },
  person1: {
    ascendant: {
      degree: String,
      longitude: String,
      position: String,
      sign: String
    }
  },
  aspects: [{
    planet1: String,
    planet2: String,
    aspect: String,
    angle: Number,
    orb: String
  }],
  ascendant: {  
    degree: String,
    longitude: String,
    position: String,
    sign: String
  },
  birth_info: {
    chart_ruler: String,
    date: String,
    location: {
      latitude: Number,
      longitude: Number,
      name: String
    },
    time: String,
    timezone: String
  },
  houses: [{
    house: Number,
    longitude: String,
    sign: String,
    position: String,
    degree: String
  }],
  planets: {
    Sun: { longitude: String, sign: String, position: String, degree: String },
    Moon: { longitude: String, sign: String, position: String, degree: String },
    Mercury: { longitude: String, sign: String, position: String, degree: String },
    Venus: { longitude: String, sign: String, position: String, degree: String },
    Mars: { longitude: String, sign: String, position: String, degree: String },
    Jupiter: { longitude: String, sign: String, position: String, degree: String },
    Saturn: { longitude: String, sign: String, position: String, degree: String },
    Uranus: { longitude: String, sign: String, position: String, degree: String },
    Neptune: { longitude: String, sign: String, position: String, degree: String },
    Pluto: { longitude: String, sign: String, position: String, degree: String }
  },
  birthInfo: {
    name: String,
    day: String,
    month: String,
    year: String,
    hour: String,
    minute: String,
    location: String
  },

  input: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: false
  },
  note: String,
  success: Boolean,
  timestamp: Date,

  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SynastryChart', natalChartSchema);