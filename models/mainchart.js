
const mongoose = require('mongoose');

const triwheelChartSchema = new mongoose.Schema({
  chart_type: {
    type: String,
    required: true,
    default: "Transit (Triwheel)"
  },
  chartName:{
    type:String,
required:true

  },

  userId:{
    type:mongoose.Schema.ObjectId,
    ref:'user'
  },
  aspects: {
    natal_to_progressed: [{
      planet1: String,
      planet2: String,
      aspect: String,
      angle: Number,
      orb: String
    }],
    natal_to_transit: [{
      planet1: String,
      planet2: String,
      aspect: String,
      angle: Number,
      orb: String
    }],
    progressed_to_transit: [{
      planet1: String,
      planet2: String,
      aspect: String,
      angle: Number,
      orb: String
    }]
  },
  natal: {
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
    ascendant: {
      degree: String,
      longitude: String,
      position: String,
      sign: String
    },
    houses: [{
      house: Number,
      longitude: String,
      sign: String,
      position: String,
      degree: String
    }]
  },
  progressed: {
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
    ascendant: {
      degree: String,
      longitude: String,
      position: String,
      sign: String
    },
    houses: [{
      house: Number,
      longitude: String,
      sign: String,
      position: String,
      degree: String
    }],
    progression_info: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  transit: {
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
    ascendant: {
      degree: String,
      longitude: String,
      position: String,
      sign: String
    },
    houses: [{
      house: Number,
      longitude: String,
      sign: String,
      position: String,
      degree: String
    }],
    date: String,
    time: String
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
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});


triwheelChartSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('MainChart', triwheelChartSchema);