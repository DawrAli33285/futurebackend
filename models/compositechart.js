const mongoose=require('mongoose')


const personDataSchema = {
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
      longitude: Number
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
  }
};

const natalChartSchema = new mongoose.Schema({
  chart_type: {
    type: String,
    required: true,
    default: "Composite (Two Person)"
  },
  chartName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'user'
  },
  
 
  person1: personDataSchema,
  
  
  person2: personDataSchema,

  composite: {
    ascendant: {
      degree: String,
      longitude: String,
      position: String,
      sign: String
    },
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
    houses: [{
      house: Number,
      longitude: String,
      sign: String,
      position: String,
      degree: String
    }]
  },
  
 
  aspects: {
    Conjunction: [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }],
    Opposition: [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }],
    Square: [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }],
    Trine: [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }],
    Sextile: [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }],
    Quincunx: [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }],
    'Semi-sextile': [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }],
    'Semi-square': [{
      planet1: String,
      planet2: String,
      angle: Number,
      orb: String
    }]
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

const compositeModel=mongoose.model('compositecharts',natalChartSchema)

module.exports=compositeModel