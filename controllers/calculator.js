const SiderealAstrologyCalculator = require('../util/calculator');

const calculator = new SiderealAstrologyCalculator();
const moment = require('moment-timezone');


exports.healthCheck = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Sidereal Astrology API',
    version: '2.0.0',
    features: ['natal', 'transit', 'synastry', 'composite', 'progressions'],
    timestamp: new Date().toISOString()
  });
};


function parseBirthData(body) {
  const [year, month, day] = body.birth_date.split('-').map(Number);
  const [hour, minute] = body.birth_time.split(':').map(Number);

  return {
    year,
    month,
    day,
    hour,
    minute,
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    timezone: body.timezone,
    original_hour: hour, 
    original_minute: minute
  };
}

function convertToUTC(data) {
  if (!data.timezone || data.timezone === 'UTC') {
    return data;
  }

  try {
    
    const localMoment = moment.tz({
      year: data.year,
      month: data.month - 1, 
      day: data.day,
      hour: data.hour,
      minute: data.minute
    }, data.timezone);

    
    const utcMoment = localMoment.utc();

    return {
      ...data,
      year: utcMoment.year(),
      month: utcMoment.month() + 1,
      day: utcMoment.date(),
      hour: utcMoment.hour(),
      minute: utcMoment.minute(),
      timezone: 'UTC'
    };
    
  } catch (error) {
    console.warn(`Invalid timezone: ${data.timezone}, using UTC`);
    return { ...data, timezone: 'UTC' };
  }
}


exports.calculateNatalChart = async (req, res) => {
  try {
    let birthData = parseBirthData(req.body);
    birthData = convertToUTC(birthData);

    const chart = calculator.calculateNatalChart(birthData);

    res.status(200).json({
      success: true,
      data: chart,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating natal chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate natal chart',
      message: error.message
    });
  }
};


exports.calculateTransitChart = async (req, res) => {
  try {
   
    let birthData = parseBirthData(req.body);
    birthData = convertToUTC(birthData);

    const transitDateStr = req.body.transit_date || new Date().toISOString().split('T')[0];
    const transitTimeStr = req.body.transit_time || '12:00';
    const [tYear, tMonth, tDay] = transitDateStr.split('-').map(Number);
    const [tHour, tMinute] = transitTimeStr.split(':').map(Number);

    let transitDate = {
      year: tYear,
      month: tMonth,
      day: tDay,
      hour: tHour,
      minute: tMinute,
      latitude: parseFloat(req.body.transit_latitude) || birthData.latitude,
      longitude: parseFloat(req.body.transit_longitude) || birthData.longitude,
      timezone: req.body.transit_timezone
    };

    transitDate = convertToUTC(transitDate);

    const chart = calculator.calculateTransitChart(birthData, transitDate);

    res.status(200).json({
      success: true,
      data: chart,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating transit chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate transit chart',
      message: error.message
    });
  }
};



exports.calculateSynastryChart = async (req, res) => {
  try {
    const { person1, person2 } = req.body;

    if (!person1) {
      return res.status(400).json({
        success: false,
        error: 'Missing person1 data (required)'
      });
    }

    const person1Data = {
      year: parseInt(person1.year),
      month: parseInt(person1.month),
      day: parseInt(person1.day),
      hour: parseInt(person1.hour),
      minute: parseInt(person1.minute),
      latitude: parseFloat(person1.latitude),
      longitude: parseFloat(person1.longitude),
      timezone: person1.timezone || 'UTC'
    };

   
    if (!person1Data.year || !person1Data.month || !person1Data.day) {
      return res.status(400).json({
        success: false,
        error: 'Missing required date fields for person1'
      });
    }

    if (isNaN(person1Data.latitude) || isNaN(person1Data.longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude values for person1'
      });
    }

  
    let person1Converted = person1Data;
    if (person1Data.timezone && person1Data.timezone !== 'UTC') {
      person1Converted = convertToUTC(person1Data);
    }

   
    if (!person2) {
      const natalChart = calculator.calculateNatalChart(person1Converted);
      
      return res.status(200).json({
        success: true,
        data: {
          chart_type: 'Natal (Single Person)',
          person1: {
            birth_info: natalChart.birth_info,
            planets: natalChart.planets,
            ascendant: natalChart.ascendant,
            houses: natalChart.houses,
            aspects: natalChart.aspects
          }
        },
        input: {
          person1: {
            birth_date_local: `${person1.year}-${String(person1.month).padStart(2, '0')}-${String(person1.day).padStart(2, '0')}`,
            birth_time_local: `${String(person1.hour).padStart(2, '0')}:${String(person1.minute).padStart(2, '0')}`,
            timezone: person1.timezone || 'UTC',
            birth_date_utc: `${person1Converted.year}-${String(person1Converted.month).padStart(2, '0')}-${String(person1Converted.day).padStart(2, '0')}`,
            birth_time_utc: `${String(person1Converted.hour).padStart(2, '0')}:${String(person1Converted.minute).padStart(2, '0')}`
          }
        },
        note: 'Person2 not provided. Returning natal chart for person1 only.',
        timestamp: new Date().toISOString()
      });
    }

    
    const person2Data = {
      year: parseInt(person2.year),
      month: parseInt(person2.month),
      day: parseInt(person2.day),
      hour: parseInt(person2.hour),
      minute: parseInt(person2.minute),
      latitude: parseFloat(person2.latitude),
      longitude: parseFloat(person2.longitude),
      timezone: person2.timezone || 'UTC'
    };

   
    if (!person2Data.year || !person2Data.month || !person2Data.day) {
      return res.status(400).json({
        success: false,
        error: 'Missing required date fields for person2'
      });
    }

    if (isNaN(person2Data.latitude) || isNaN(person2Data.longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude values for person2'
      });
    }

   
    let person2Converted = person2Data;
    if (person2Data.timezone && person2Data.timezone !== 'UTC') {
      person2Converted = convertToUTC(person2Data);
    }

  
    const synastryChart = calculator.calculateSynastryChart(person1Converted, person2Converted);

    res.status(200).json({
      success: true,
      data: synastryChart,
      input: {
        person1: {
          birth_date_local: `${person1.year}-${String(person1.month).padStart(2, '0')}-${String(person1.day).padStart(2, '0')}`,
          birth_time_local: `${String(person1.hour).padStart(2, '0')}:${String(person1.minute).padStart(2, '0')}`,
          timezone: person1.timezone || 'UTC',
          birth_date_utc: `${person1Converted.year}-${String(person1Converted.month).padStart(2, '0')}-${String(person1Converted.day).padStart(2, '0')}`,
          birth_time_utc: `${String(person1Converted.hour).padStart(2, '0')}:${String(person1Converted.minute).padStart(2, '0')}`
        },
        person2: {
          birth_date_local: `${person2.year}-${String(person2.month).padStart(2, '0')}-${String(person2.day).padStart(2, '0')}`,
          birth_time_local: `${String(person2.hour).padStart(2, '0')}:${String(person2.minute).padStart(2, '0')}`,
          timezone: person2.timezone || 'UTC',
          birth_date_utc: `${person2Converted.year}-${String(person2Converted.month).padStart(2, '0')}-${String(person2Converted.day).padStart(2, '0')}`,
          birth_time_utc: `${String(person2Converted.hour).padStart(2, '0')}:${String(person2Converted.minute).padStart(2, '0')}`
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating synastry chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate synastry chart',
      message: error.message
    });
  }
};




exports.calculateCompositeChart = async (req, res) => {
  try {

    const parseBirthData = (body, prefix) => {
      return {
        year: parseInt(body[`${prefix}_year`]),
        month: parseInt(body[`${prefix}_month`]),
        day: parseInt(body[`${prefix}_day`]),
        hour: parseInt(body[`${prefix}_hour`]),
        minute: parseInt(body[`${prefix}_minute`]),
        latitude: parseFloat(body[`${prefix}_latitude`]),
        longitude: parseFloat(body[`${prefix}_longitude`]),
        timezone: body[`${prefix}_timezone`] || 'UTC'
      };
    };

    const person1Data = parseBirthData(req.body, 'person1');

   
  
    if (!person1Data.year || !person1Data.month || !person1Data.day) {
      return res.status(400).json({
        success: false,
        error: 'Missing required date fields for person1'
      });
    }

  
    const hasPerson2 = req.body.person2_year && req.body.person2_month && req.body.person2_day;

    if (!hasPerson2) {
   
      const natalChart = calculator.calculateNatalChart(person1Data);
      
      return res.status(200).json({
        success: true,
        data: {
          chart_type: 'Natal (Single Person - No Composite)',
          person1: {
            birth_info: natalChart.birth_info,
            planets: natalChart.planets,
            ascendant: natalChart.ascendant,
            houses: natalChart.houses,
            aspects: natalChart.aspects
          }
        },
        note: 'Person2 not provided. Composite chart requires two people. Returning natal chart for person1 only.',
        timestamp: new Date().toISOString()
      });
    }

    const person2Data = parseBirthData(req.body, 'person2');
   
    
    if (!person2Data.year || !person2Data.month || !person2Data.day) {
      return res.status(400).json({
        success: false,
        error: 'Missing required date fields for person2'
      });
    }

   
    const chart = calculator.calculateCompositeChart(person1Data, person2Data);

    res.status(200).json({
      success: true,
      data: chart,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating composite chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate composite chart',
      message: error.message
    });
  }
};


exports.calculateProgressions = async (req, res) => {
  try {

    let birthData = parseBirthData(req.body);
    
    
   
    birthData = convertToUTC(birthData);

   
    const now = new Date();
    const targetDateStr = req.body.target_date || now.toISOString().split('T')[0];
    const targetTimeStr = req.body.target_time || now.toISOString().split('T')[1].substring(0, 5);
    
    const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);
    const [tHour, tMinute] = targetTimeStr.split(':').map(Number);

    const targetDate = {
      year: tYear,
      month: tMonth,
      day: tDay,
      hour: tHour,
      minute: tMinute
    };

 
    const method = req.query.method || 'both';

    const progressions = calculator.calculateProgressions(birthData, targetDate, method);

    res.status(200).json({
      success: true,
      data: progressions,
      input: {
        birth_date_local: req.body.birth_date,
        birth_time_local: req.body.birth_time,
        timezone: req.body.timezone,
        birth_date_utc: `${birthData.year}-${birthData.month}-${birthData.day}`,
        birth_time_utc: `${birthData.hour}:${birthData.minute}`,
        target_date: targetDateStr,
        target_time: targetTimeStr
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating progressions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate progressions',
      message: error.message
    });
  }
};


exports.calculateSimpleChart = async (req, res) => {
  try {
    const { birth_date, birth_time, latitude, longitude } = req.body;

    if (!birth_date || !birth_time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: birth_date and birth_time are required'
      });
    }

    const [year, month, day] = birth_date.split('-').map(Number);
    const [hour, minute] = birth_time.split(':').map(Number);

    const lat = latitude || 40.7128;
    const lon = longitude || -74.0060;

    const birthData = { year, month, day, hour, minute, latitude: lat, longitude: lon };
    const fullChart = calculator.calculateNatalChart(birthData);

    const simpleChart = {
      success: true,
      data: {
        birth_date,
        birth_time,
        sun_sign: `${fullChart.planets.Sun.sign} ${fullChart.planets.Sun.position}`,
        moon_sign: `${fullChart.planets.Moon.sign} ${fullChart.planets.Moon.position}`,
        rising_sign: fullChart.ascendant 
          ? `${fullChart.ascendant.sign} ${fullChart.ascendant.position}` 
          : 'Not available',
        chart_type: 'Sidereal (True Constellation)',
        ayanamsa: fullChart.ayanamsa.value
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(simpleChart);

  } catch (error) {
    console.error('Error calculating simple chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate chart',
      message: error.message
    });
  }
};

exports.calculateDetailedChart = async (req, res) => {
  try {
    let birthData = parseBirthData(req.body);
    birthData = convertToUTC(birthData);

    const chart = calculator.calculateNatalChart(birthData);

    const detailedChart = {
      success: true,
      data: {
        birth_info: chart.birth_info,
        chart: {
          ascendant: chart.ascendant,
          sun: chart.planets.Sun,
          moon: chart.planets.Moon,
          mercury: chart.planets.Mercury,
          venus: chart.planets.Venus,
          mars: chart.planets.Mars,
          jupiter: chart.planets.Jupiter,
          saturn: chart.planets.Saturn,
          uranus: chart.planets.Uranus,
          neptune: chart.planets.Neptune,
          pluto: chart.planets.Pluto
        },
        houses: chart.houses,
        aspects: chart.aspects,
        ayanamsa: chart.ayanamsa,
        calculation_info: {
          chart_type: chart.chart_type
        }
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(detailedChart);

  } catch (error) {
    console.error('Error calculating detailed chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate chart',
      message: error.message
    });
  }
};

exports.calculateChartWithInterpretation = async (req, res) => {
  try {
    let birthData = parseBirthData(req.body);
    birthData = convertToUTC(birthData);

    const chart = calculator.calculateNatalChart(birthData);

    const interpretations = {
      sun_interpretation: `Your Sun in ${chart.planets.Sun.sign} at ${chart.planets.Sun.position} represents your core identity and life purpose. This placement shows how you express your individuality and creative energy.`,
      moon_interpretation: `Your Moon in ${chart.planets.Moon.sign} at ${chart.planets.Moon.position} reveals your emotional nature and inner needs. This position indicates how you process feelings and seek emotional security.`,
      rising_interpretation: chart.ascendant 
        ? `Your Rising sign (Ascendant) in ${chart.ascendant.sign} at ${chart.ascendant.position} represents your outer personality and how others perceive you. This is the mask you wear and your approach to new situations.`
        : 'Rising sign not available',
      mercury_interpretation: `Mercury in ${chart.planets.Mercury.sign} shows your communication style and thought patterns.`,
      venus_interpretation: `Venus in ${chart.planets.Venus.sign} reveals how you express love and what you value in relationships.`,
      mars_interpretation: `Mars in ${chart.planets.Mars.sign} indicates your drive, passion, and how you take action.`
    };

    res.status(200).json({
      success: true,
      data: {
        chart: chart,
        interpretations: interpretations
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating chart with interpretation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate chart with interpretation',
      message: error.message
    });
  }
};

module.exports = exports;