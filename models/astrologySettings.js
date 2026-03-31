const mongoose = require('mongoose');

const astrologySettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  settingsName: {
    type: String,
    required: true,
    default: 'True Sidereal Settings'
  },
  
 
  zodiacSystem: {
    type: String,
    required: true,
    enum: ['True Sidereal', 'Tropical', 'Sidereal (Lahiri)', 'Sidereal (Raman)'],
    default: 'True Sidereal'
  },
  houseSystem: {
    type: String,
    required: true,
    enum: ['Placidus', 'Whole Sign', 'Koch', 'Equal', 'Campanus', 'Regiomontanus'],
    default: 'Placidus'
  },
  coordinateSystem: {
    type: String,
    required: true,
    enum: ['Geocentric', 'Heliocentric', 'Topocentric'],
    default: 'Geocentric'
  },
  
 
  trueSiderealSettings: {
    ayanamsa: {
      type: String,
      enum: ['Fagan-Bradley', 'Lahiri', 'Raman', 'Krishnamurti', 'Yukteshwar', 'Custom'],
      default: 'Fagan-Bradley'
    },
    includeOphiuchus: {
      type: Boolean,
      default: true
    },
    constellationBoundaries: {
      type: String,
      enum: ['IAU 1930', 'IAU 1976', 'Ptolemaic', 'Modern Astronomical'],
      default: 'IAU 1976'
    },
    precessionCorrection: {
      type: Boolean,
      default: true
    },
    nutationCorrection: {
      type: Boolean,
      default: true
    }
  },
  
 
  wheelSettings: {
    displayPlanets: {
      type: [String],
      default: [
        'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
        'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
        'Ophiuchus', 'Chiron', 'Ceres', 'Pallas', 'Juno', 'Vesta',
        'North Node', 'South Node', 'Lilith', 'Fortune'
      ]
    },
    planetDegrees: {
      type: String,
      enum: ['Whole', 'Degrees Minutes', 'Degrees Minutes Seconds'],
      default: 'Whole'
    },
    ascendantDisplay: {
      type: String,
      enum: ['AS', 'Asc', 'Ascendant'],
      default: 'AS'
    }
  },
  
  
  aspects: {
    enabledAspects: {
      type: [String],
      default: ['Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile', 'Quincunx', 'Semi-sextile', 'Semi-square']
    },
    orbs: {
      conjunction: { type: Number, default: 10 },
      opposition: { type: Number, default: 10 },
      square: { type: Number, default: 8 },
      trine: { type: Number, default: 8 },
      sextile: { type: Number, default: 6 },
      quincunx: { type: Number, default: 3 },
      semiSextile: { type: Number, default: 3 },
      semiSquare: { type: Number, default: 3 }
    },
    applyToOphiuchus: {
      type: Boolean,
      default: true
    }
  },
  
  
  graphSettings: {
    chartTypes: {
      type: [String],
      default: ['Natal', 'Progressed', 'Transit']
    },
    displayPoints: {
      type: [String],
      default: ['AS', 'MC', 'DS', 'IC']
    },
    stationsDisplay: {
      type: Boolean,
      default: true
    },
    houseIngresses: {
      type: Boolean,
      default: true
    }
  },
  
 
  graphAspects: {
    enabled: {
      type: [String],
      default: ['Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile', 'Quincunx', 'Semi-sextile', 'Semi-square']
    },
    types: {
      progressedToNatal: { type: Boolean, default: true },
      transitingToNatal: { type: Boolean, default: true },
      progressedToProgressed: { type: Boolean, default: false },
      transitingToTransiting: { type: Boolean, default: false }
    }
  },
  
  
  ophiuchusSettings: {
    position: {
      startDegree: { type: Number, default: 237 }, 
      endDegree: { type: Number, default: 265 },  
      durationDays: { type: Number, default: 18 } 
    },
    interpretationStyle: {
      type: String,
      enum: ['Healing', 'Transformation', 'Esoteric', 'Modern', 'Traditional Blend'],
      default: 'Healing'
    },
    element: {
      type: String,
      enum: ['Fire', 'Water', 'Air', 'Earth', 'Ethereal'],
      default: 'Ethereal'
    },
    modality: {
      type: String,
      enum: ['Cardinal', 'Fixed', 'Mutable', 'Transcendent'],
      default: 'Transcendent'
    }
  },
  

  reportSettings: {
    includeOphiuchusAnalysis: {
      type: Boolean,
      default: true
    },
    trueSiderealExplanations: {
      type: Boolean,
      default: true
    },
    astronomicalReferences: {
      type: Boolean,
      default: true
    },
    reportLength: {
      type: String,
      enum: ['Brief', 'Standard', 'Comprehensive'],
      default: 'Standard'
    }
  },
  
 
  subscriptionSettings: {
    weeklyHoroscope: {
      type: Boolean,
      default: false
    },
    transitAlerts: {
      type: Boolean,
      default: false
    },
    ophiuchusTransits: {
      type: Boolean,
      default: true
    },
    astronomicalEvents: {
      type: Boolean,
      default: true
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


astrologySettingsSchema.virtual('isTrueSidereal').get(function() {
  return this.zodiacSystem === 'True Sidereal' && this.trueSiderealSettings.includeOphiuchus;
});


astrologySettingsSchema.index({ userId: 1, settingsName: 1 });
astrologySettingsSchema.index({ 'trueSiderealSettings.includeOphiuchus': 1 });


astrologySettingsSchema.pre('save', function(next) {
  if (this.zodiacSystem === 'True Sidereal') {
    this.trueSiderealSettings.includeOphiuchus = true;
    this.ophiuchusSettings.includeOphiuchusAnalysis = true;
  }
  this.updatedAt = Date.now();
  next();
});


astrologySettingsSchema.statics.getDefaultTrueSidereal = function() {
  return {
    zodiacSystem: 'True Sidereal',
    houseSystem: 'Placidus',
    coordinateSystem: 'Geocentric',
    trueSiderealSettings: {
      ayanamsa: 'Fagan-Bradley',
      includeOphiuchus: true,
      constellationBoundaries: 'IAU 1976',
      precessionCorrection: true,
      nutationCorrection: true
    },
    wheelSettings: {
      displayPlanets: [
        'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
        'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
        'Ophiuchus', 'Chiron', 'North Node', 'South Node'
      ],
      planetDegrees: 'Whole',
      ascendantDisplay: 'AS'
    },
    aspects: {
      enabledAspects: ['Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile'],
      orbs: {
        conjunction: 10,
        opposition: 10,
        square: 8,
        trine: 8,
        sextile: 6
      },
      applyToOphiuchus: true
    }
  };
};

const AstrologySettings = mongoose.model('AstrologySettings', astrologySettingsSchema);

module.exports = AstrologySettings;