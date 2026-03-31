
const mongoose = require('mongoose');

const triwheelChartSchema = new mongoose.Schema({
  chart_type: {
    type: String,
    required: true,
    default: "Transit (Triwheel)"
  },
  userId:{
type:mongoose.Schema.ObjectId,
ref:'user'
  },
  chartName:{
    type:String,
required:true

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
      longitude: String,
      sign: String,
      position: String,
      degree: { type: String, required: false } 
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
      longitude: String,
      sign: String,
      position: String,
      degree: { type: String, required: false } 
    },
   
    houses: {
      type: [{
        house: Number,
        longitude: String,
        sign: String,
        position: String,
        degree: String
      }],
      required: false
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
      longitude: String,
      sign: String,
      position: String,
      degree: { type: String, required: false } 
    },
   
    houses: {
      type: [{
        house: Number,
        longitude: String,
        sign: String,
        position: String,
        degree: String
      }],
      required: false
    },
    date: String,
    time: String
  },
  birthInfo: {
    birthDate: String,
    birthTime: String,
    birthLocation: String
  },
  transitInfo: {
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
  progression_info: {
    type: mongoose.Schema.Types.Mixed,
    required: false
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

module.exports = mongoose.model('TransitChart', triwheelChartSchema);