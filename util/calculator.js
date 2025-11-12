





















    
    const astronomy = require('astronomy-engine');


    const SIDEREAL_SIGNS = [
      { name: 'Aries',         start:   28.687, end:   53.417 },
      { name: 'Taurus',        start:   53.417, end:   90.140 },
      { name: 'Gemini',        start:   90.140, end:   117.988 },
      { name: 'Cancer',        start:  117.988, end:   138.038 },
      { name: 'Leo',           start:  138.038, end:   173.851 },
      { name: 'Virgo',         start:  173.851, end:   217.810 },
      { name: 'Libra',         start:  217.810, end:   241.057 },  
      { name: 'Scorpius',      start:  241.057, end:   247.920 },   
      { name: 'Ophiuchus',     start:  247.920, end:   266.560 },
      { name: 'Sagittarius',   start:  266.560, end:   299.710 },
      { name: 'Capricornus',   start:  299.710, end:   327.780 },
      { name: 'Aquarius',      start:  327.780, end:   351.520 },
      { name: 'Pisces',        start:  351.520, end:   360.0  },
      { name: 'Pisces',        start:    0.0  , end:    28.687 }
    ];

    const PRECESSION_RATE = 0.01397; 
const EPOCH_YEAR = 2000.0;
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const currentDay = new Date().getDate();
const yearsSince2000 = currentYear - EPOCH_YEAR + (currentMonth - 1) / 12 + (currentDay - 1) / 365.25;

const AYANAMSA_TYPES = {
  lahiri: 23.85 + (PRECESSION_RATE * yearsSince2000), 
  raman: 22.463 + (PRECESSION_RATE * yearsSince2000),
  krishnamurti: 23.900 + (PRECESSION_RATE * yearsSince2000),
  fagan_bradley: 24.836 + (PRECESSION_RATE * yearsSince2000),
  true_sidereal: 0  // ADD THIS - no ayanamsa for true sidereal
};
    class SiderealAstrologyCalculator {
      constructor(ayanamsaType = 'true_sidereal') { 
        if (ayanamsaType === 'true_sidereal') {
          this.ayanamsa = 0;  
          this.isTrueSidereal = true;
        } else {
          this.ayanamsa = AYANAMSA_TYPES[ayanamsaType] || AYANAMSA_TYPES.lahiri;
          this.isTrueSidereal = false;
        }
      }

      createAstroTime(year, month, day, hour, minute) {
        const date = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
        
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date provided');
        }
        
        return astronomy.MakeTime(date);
      }

      generateChartWheelData(planets, ascendant, houses) {
        const wheelData = {
          planets: {},
          ascendant: parseFloat(ascendant.longitude),
          houses: houses.map(h => parseFloat(h.longitude))
        };
      
        for (const [name, data] of Object.entries(planets)) {
          wheelData.planets[name] = {
            longitude: parseFloat(data.longitude),
            sign: data.sign,
            degree: parseFloat(data.degree)
          };
        }
      
        return wheelData;
      }
    
    



      getZodiacSign(siderealLongitude) {
        const CONSTELLATION_BOUNDARIES = [
          { name: 'Aries',         start:   28.687, end:   53.417 },
          { name: 'Taurus',        start:   53.417, end:   90.140 },
          { name: 'Gemini',        start:   90.140, end:   117.988 },
          { name: 'Cancer',        start:  117.988, end:   138.038 },
          { name: 'Leo',           start:  138.038, end:   173.851 },
          { name: 'Virgo',         start:  173.851, end:   217.810 },
          { name: 'Libra',         start:  217.810, end:   241.057 },  
          { name: 'Scorpius',      start:  241.057, end:   247.920 },   
          { name: 'Ophiuchus',     start:  247.920, end:   266.560 },
          { name: 'Sagittarius',   start:  266.560, end:   299.710 },
          { name: 'Capricornus',   start:  299.710, end:   327.780 },
          { name: 'Aquarius',      start:  327.780, end:   351.520 },
          { name: 'Pisces',        start:  351.520, end:   360.0  },
          { name: 'Pisces',        start:    0.0  , end:    28.687 }
        ];
        
        let lon = ((siderealLongitude % 360) + 360) % 360;
        
        for (let constellation of CONSTELLATION_BOUNDARIES) {
          if (lon >= constellation.start && lon < constellation.end) {
            let degreeInSign = lon - constellation.start;
            const signWidth = constellation.end - constellation.start;
            
            // ADD THIS CRITICAL FIX: Cap degree at sign width - 0.0001
            if (degreeInSign >= signWidth) {
              degreeInSign = signWidth - 0.0001;
            }
            // ADD THIS: Also prevent negative degrees
            if (degreeInSign < 0) {
              degreeInSign = 0;
            }
            
            return {
              sign: constellation.name,
              degree: degreeInSign,
              minutes: (degreeInSign % 1) * 60,
              // ADD THIS: Include absolute longitude for debugging
              absoluteLongitude: lon
            };
          }
        }
        
        return { 
          sign: 'Aries', 
          degree: 0, 
          minutes: 0,
          absoluteLongitude: lon
        };
      }
      formatDegree(degreeInfo) {
        let deg = Math.floor(degreeInfo.degree);
        const totalMinutes = (degreeInfo.degree - deg) * 60;
        let min = Math.floor(totalMinutes);
        let sec = Math.round((totalMinutes - min) * 60);
        
        // Handle second overflow
        if (sec >= 60) {
          sec = 0;
          min += 1;
        }
        
        // Handle negative seconds
        if (sec < 0) {
          sec = 0;
        }
        
        // Handle minute overflow
        if (min >= 60) {
          min = 59; // CAP instead of rolling over
          sec = 59;
        }
        
        // Handle negative minutes
        if (min < 0) {
          min = 0;
        }
        
        // ADD THIS: Ensure degree doesn't exceed 29
        if (deg >= 30) {
          deg = 29;
          min = 59;
          sec = 59;
        }
        if (deg < 0) {
          deg = 0;
        }
        
        return `${deg}°${min}'${sec}"`;
      }
      validatePosition(planetName, siderealLon, signInfo) {
        const signWidth = SIDEREAL_SIGNS.find(s => s.name === signInfo.sign);
        if (signWidth && signInfo.degree >= (signWidth.end - signWidth.start)) {
          console.warn(`⚠️ ${planetName} degree overflow:`, {
            absoluteLongitude: siderealLon,
            sign: signInfo.sign,
            degreeInSign: signInfo.degree,
            signWidth: signWidth.end - signWidth.start
          });
        }
        return signInfo;
      }

      
      calculateHouseCusps(astroTime, latitude, longitude, system = 'equal') {
        try {
          const ascendant = this.calculateAscendant(astroTime, latitude, longitude);
          
          if (!ascendant || typeof ascendant.longitude === 'undefined') {
            throw new Error('Invalid ascendant calculation');
          }
          
          const ascLon = parseFloat(ascendant.longitude);
          
          if (isNaN(ascLon) || ascLon < 0 || ascLon >= 360) {
            throw new Error(`Invalid ascendant longitude: ${ascLon}`);
          }
          
          const houses = [];
      
          if (system === 'equal') {
            for (let i = 0; i < 12; i++) {
              let cuspLon = (ascLon + (i * 30)) % 360;
              
              if (cuspLon < 0) cuspLon += 360;
              
              const signInfo = this.getZodiacSign(cuspLon);
              
              if (!signInfo || !signInfo.sign) {
                throw new Error(`Invalid sign calculation for longitude: ${cuspLon}`);
              }
              
              houses.push({
                house: i + 1,
                longitude: cuspLon.toFixed(4), // Absolute ecliptic longitude
                sign: signInfo.sign,
                position: this.formatDegree(signInfo), // This uses degree within sign
                degree: this.calculateDegreeDecimal(signInfo).toFixed(2), // REMOVE .toFixed here
                // ADD THESE for clarity:
                degreeInSign: Math.floor(signInfo.degree),
                minutes: Math.floor(signInfo.minutes),
                absoluteLongitude: cuspLon.toFixed(4)
              });
            }
          }
      
          return houses;
        } catch (error) {
          console.error('Error calculating house cusps:', error);
          return this.getFallbackHouses();
        }
      }
      calculateDegreeDecimal(degreeInfo) {
        let degree = parseFloat(degreeInfo.degree);
        
        // ADD THIS VALIDATION:
        // Ensure degree is within valid range for the sign
        if (degree < 0) degree = 0;
        if (degree >= 30) degree = 29.99; // Cap at sign boundary
        
        return degree;
      }
      calculatePlanetaryPositions(astroTime) {
        const planets = {};
      
        try {
          const calculatePlanet = (planetName, calcFunction) => {
            try {
              const vector = calcFunction(planetName, astroTime, false);
              const ecliptic = astronomy.Ecliptic(vector);
            
              const siderealLon = (ecliptic.elon - this.ayanamsa + 360) % 360;
              const signInfo = this.getZodiacSign(siderealLon);
              this.validatePosition(planetName, siderealLon, signInfo); // ADD THIS LINE
              return {
                longitude: siderealLon.toFixed(4), 
                sign: signInfo.sign,
                position: this.formatDegree(signInfo),
                degree: this.calculateDegreeDecimal(signInfo).toFixed(2)
              };
            } catch (error) {
              console.error(`Error calculating ${planetName}:`, error);
              return {
                longitude: '0.0000',
                sign: 'Aries',
                position: '0°0\'0"',
                degree: '0.00',
                error: error.message
              };
            }
          };
      
      
          try {
            const earthVector = astronomy.HelioVector('Earth', astroTime);
            const sunVector = {
              x: -earthVector.x,
              y: -earthVector.y,
              z: -earthVector.z,
              t: astroTime
            };
            
    
  const sunEcl = astronomy.Ecliptic(sunVector);
  let siderealLon;
  if (this.isTrueSidereal) {
    siderealLon = (sunEcl.elon + 360) % 360;
  } else {
    siderealLon = (sunEcl.elon - this.ayanamsa + 360) % 360;
  }
  
            
  const sunSign = this.getZodiacSign(siderealLon);
  planets.Sun = {
    longitude: siderealLon.toFixed(4),
    sign: sunSign.sign,
    position: this.formatDegree(sunSign),
    degree: this.calculateDegreeDecimal(sunSign).toFixed(2)
  };
          } catch (error) {
            console.error('Error calculating Sun:', error);
            planets.Sun = {
              longitude: '0.0000',
              sign: 'Aries',
              position: '0°0\'0"',
              degree: '0.00',
              error: error.message
            };
          }
      
        
          try {
            const moonVector = astronomy.GeoMoon(astroTime);
            const moonEcl = astronomy.Ecliptic(moonVector);
            let siderealLon;
            if (this.isTrueSidereal) {
              siderealLon = (moonEcl.elon + 360) % 360;
            } else {
              siderealLon = (moonEcl.elon - this.ayanamsa + 360) % 360;
            }
            const moonSign = this.getZodiacSign(siderealLon);
            planets.Moon = {
              longitude: siderealLon.toFixed(4),
              sign: moonSign.sign,
              position: this.formatDegree(moonSign),
              degree: this.calculateDegreeDecimal(moonSign).toFixed(2)
            };
          } catch (error) {
            console.error('Error calculating Moon:', error);
            planets.Moon = {
              longitude: '0.0000',
              sign: 'Aries',
              position: '0°0\'0"',
              degree: '0.00',
              error: error.message
            };
          }
      
          
          planets.Mercury = calculatePlanet('Mercury', astronomy.GeoVector);
          planets.Venus = calculatePlanet('Venus', astronomy.GeoVector);
          planets.Mars = calculatePlanet('Mars', astronomy.GeoVector);
          console.log('🔴 Mars Debug:', {
            longitude: planets.Mars.longitude,
            sign: planets.Mars.sign,
            degree: planets.Mars.degree,
            position: planets.Mars.position
          });
          planets.Jupiter = calculatePlanet('Jupiter', astronomy.GeoVector);
          planets.Saturn = calculatePlanet('Saturn', astronomy.GeoVector);
          planets.Uranus = calculatePlanet('Uranus', astronomy.GeoVector);
          planets.Neptune = calculatePlanet('Neptune', astronomy.GeoVector);
          planets.Pluto = calculatePlanet('Pluto', astronomy.GeoVector);
      
        } catch (error) {
          console.error('Error in calculatePlanetaryPositions:', error);
          throw new Error(`Failed to calculate planetary positions: ${error.message}`);
        }
      
        return planets;
      }
      calculateAscendant(astroTime, latitude, longitude) {
        try {
          const jd = 2451545.0 + astroTime.ut;
          const T = (jd - 2451545.0) / 36525;
          
        
          let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                    0.000387933 * T * T - T * T * T / 38710000;
          gmst = gmst % 360;
          if (gmst < 0) gmst += 360;
          
      
          let lst = gmst + longitude;
          lst = lst % 360;
          if (lst < 0) lst += 360;
      
          const epsilon = 23.439291 - 0.0130042 * T;
      
          const lstRad = lst * Math.PI / 180;
          const latRad = latitude * Math.PI / 180;
          const epsilonRad = epsilon * Math.PI / 180;
      
          const y = -Math.cos(lstRad);
          const x = Math.sin(lstRad) * Math.cos(epsilonRad) + 
                    Math.tan(latRad) * Math.sin(epsilonRad);
      
          let tropicalAsc = Math.atan2(y, x) * 180 / Math.PI;
          if (tropicalAsc < 0) tropicalAsc += 360;
          
          
          let siderealAsc;
          if (this.isTrueSidereal) {
           
            siderealAsc = (tropicalAsc + 360) % 360;
          } else {
            siderealAsc = (tropicalAsc - this.ayanamsa + 360) % 360;
          }
          const ascSign = this.getZodiacSign(siderealAsc);
          
          return {
            longitude: siderealAsc.toFixed(4), 
            sign: ascSign.sign,
            position: this.formatDegree(ascSign),
            degree: this.calculateDegreeDecimal(ascSign).toFixed(2)
          };
        } catch (error) {
          console.error('Error calculating ascendant:', error);
          throw error;
        }
      }
      
      



      calculateAspects(planets1, planets2 = null) {
        const aspects = [];
        const aspectTypes = [
          { name: 'Conjunction', angle: 0, orb: 8 },
          { name: 'Opposition', angle: 180, orb: 8 },
          { name: 'Trine', angle: 120, orb: 8 },
          { name: 'Square', angle: 90, orb: 8 },
          { name: 'Sextile', angle: 60, orb: 6 }
        ];
      
        const sourcePlanets = planets1;
        const targetPlanets = planets2 || planets1;
      
        for (const planet1Name of Object.keys(sourcePlanets)) {
          for (const planet2Name of Object.keys(targetPlanets)) {
            if (!planets2 && planet1Name === planet2Name) continue;
            const lon1 = parseFloat(sourcePlanets[planet1Name].longitude); 
            const lon2 = parseFloat(targetPlanets[planet2Name].longitude); 
            let diff = Math.abs(lon1 - lon2);
            if (diff > 180) diff = 360 - diff;
      
            for (const aspect of aspectTypes) {
              const deviation = Math.abs(diff - aspect.angle);
              if (deviation <= aspect.orb) {
                aspects.push({
                  planet1: planet1Name,
                  planet2: planet2Name,
                  aspect: aspect.name,
                  angle: aspect.angle,
                  orb: deviation.toFixed(2),
                  exact: deviation <= 1.0
                });
                break;
              }
            }
          }
        }
      
        return aspects;
      }
      
      
    
      // calculateSecondaryProgressions(birthData, targetDate) {
      //   try {
      //     const birthDateObj = new Date(Date.UTC(
      //       birthData.year, 
      //       birthData.month - 1, 
      //       birthData.day,
      //       birthData.hour,
      //       birthData.minute
      //     ));
          
      //     const targetDateObj = new Date(Date.UTC(
      //       targetDate.year, 
      //       targetDate.month - 1, 
      //       targetDate.day,
      //       targetDate.hour || 12,
      //       targetDate.minute || 0
      //     ));
          
      //     const daysElapsed = (targetDateObj - birthDateObj) / (1000 * 60 * 60 * 24);
      //     const yearsSinceBirth = daysElapsed / 365.25;
          
          
      //     const daysToProgress = yearsSinceBirth; 
          
        

        
      //     const progressedDateObj = new Date(birthDateObj.getTime() + (daysToProgress * 24 * 60 * 60 * 1000));
        
      //     const progressedTime = this.createAstroTime(
      //       progressedDateObj.getUTCFullYear(),
      //       progressedDateObj.getUTCMonth() + 1,
      //       progressedDateObj.getUTCDate(),
      //       progressedDateObj.getUTCHours(),
      //       progressedDateObj.getUTCMinutes()
      //     );

      //     const progressedPlanets = this.calculatePlanetaryPositions(progressedTime);
      //     const progressedAscendant = this.calculateAscendant(
      //       progressedTime, 
      //       birthData.latitude, 
      //       birthData.longitude
      //     );

      //     return {
      //       method: 'Secondary Progressions',
      //       planets: progressedPlanets,
      //       ascendant: progressedAscendant,
      //       progression_info: {
      //         birth_date: birthDateObj.toISOString().split('T')[0],
      //         birth_time: birthDateObj.toISOString().split('T')[1].substring(0, 5),
      //         target_date: targetDateObj.toISOString().split('T')[0],
      //         target_time: targetDateObj.toISOString().split('T')[1].substring(0, 5),
      //         progressed_ephemeris_date: progressedDateObj.toISOString().split('T')[0],
      //         progressed_ephemeris_time: progressedDateObj.toISOString().split('T')[1].substring(0, 5),
      //         age_in_years: parseFloat(yearsSinceBirth.toFixed(6)),
      //         age_in_days: parseFloat(daysElapsed.toFixed(2)),
      //         days_progressed: parseFloat(daysToProgress.toFixed(6))
      //       }
      //     };
      //   } catch (error) {
      //     console.error('Error calculating secondary progressions:', error);
      //     throw new Error(`Failed to calculate secondary progressions: ${error.message}`);
      //   }
      // }

      calculateSecondaryProgressions(birthData, targetDate) {
        try {
        
          if (!birthData || !targetDate) {
            throw new Error('Birth data and target date are required');
          }
      
          
          const birthDateObj = new Date(Date.UTC(
            birthData.year, 
            birthData.month - 1, 
            birthData.day,
            birthData.hour,
            birthData.minute
          ));
          
          const targetDateObj = new Date(Date.UTC(
            targetDate.year, 
            targetDate.month - 1, 
            targetDate.day,
            targetDate.hour || 12,
            targetDate.minute || 0
          ));
      
        
          if (isNaN(birthDateObj.getTime())) {
            throw new Error('Invalid birth date provided');
          }
          if (isNaN(targetDateObj.getTime())) {
            throw new Error('Invalid target date provided');
          }
      
        
          const timeDiffMs = targetDateObj - birthDateObj;
          
        
          if (timeDiffMs < 0) {
            throw new Error('Target date cannot be before birth date');
          }
      
          const daysElapsed = timeDiffMs / (1000 * 60 * 60 * 24);
          const yearsSinceBirth = daysElapsed / 365.25;
      
        
          const daysToProgress = yearsSinceBirth;
      
        
          const progressedDateObj = new Date(birthDateObj);
          
        
          const wholeDays = Math.floor(daysToProgress);
          progressedDateObj.setUTCDate(progressedDateObj.getUTCDate() + wholeDays);
      
          const fractionalDay = daysToProgress - wholeDays;
          const fractionalMs = fractionalDay * 24 * 60 * 60 * 1000;
          progressedDateObj.setTime(progressedDateObj.getTime() + fractionalMs);
      
      
          if (isNaN(progressedDateObj.getTime())) {
            throw new Error('Invalid progressed date calculated');
          }
      
          
          const progressedTime = this.createAstroTime(
            progressedDateObj.getUTCFullYear(),
            progressedDateObj.getUTCMonth() + 1,
            progressedDateObj.getUTCDate(),
            progressedDateObj.getUTCHours(),
            progressedDateObj.getUTCMinutes()
          );
      
        
          const progressedPlanets = this.calculatePlanetaryPositions(progressedTime);
          const progressedAscendant = this.calculateAscendant(
            progressedTime, 
            birthData.latitude, 
            birthData.longitude
          );
      
          const progressedHouses = this.calculateHouseCusps(
            progressedTime,
            birthData.latitude,
            birthData.longitude
          );
      
          return {
            method: 'Secondary Progressions',
            planets: progressedPlanets,
            ascendant: progressedAscendant,
            houses: progressedHouses,
            progression_info: {
              birth_date: birthDateObj.toISOString().split('T')[0],
              birth_time: this.formatTime(birthDateObj),
              target_date: targetDateObj.toISOString().split('T')[0],
              target_time: this.formatTime(targetDateObj),
              progressed_ephemeris_date: progressedDateObj.toISOString().split('T')[0],
              progressed_ephemeris_time: this.formatTime(progressedDateObj),
              age_in_years: parseFloat(yearsSinceBirth.toFixed(6)),
              age_in_days: parseFloat(daysElapsed.toFixed(2)),
              days_progressed: parseFloat(daysToProgress.toFixed(6)),
              progression_ratio: '1 day = 1 year'
            }
          };
        } catch (error) {
          console.error('Error calculating secondary progressions:', error);
          throw new Error(`Failed to calculate secondary progressions: ${error.message}`);
        }
      }
      
      
      formatTime(dateObj) {
        return `${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}`;
      }
      calculateSolarArcDirections(birthData, targetDate) {
        try {
          const birthDateObj = new Date(Date.UTC(
            birthData.year, 
            birthData.month - 1, 
            birthData.day,
            birthData.hour,
            birthData.minute
          ));
          
          const targetDateObj = new Date(Date.UTC(
            targetDate.year, 
            targetDate.month - 1, 
            targetDate.day,
            targetDate.hour || 12,
            targetDate.minute || 0
          ));
          
          const daysElapsed = (targetDateObj - birthDateObj) / (1000 * 60 * 60 * 24);
          const yearsSinceBirth = daysElapsed / 365.25;
          
        
          const solarArc = yearsSinceBirth * 0.9856; 
          
        
        
          const birthTime = this.createAstroTime(
            birthData.year, 
            birthData.month, 
            birthData.day, 
            birthData.hour, 
            birthData.minute
          );
          const natalPlanets = this.calculatePlanetaryPositions(birthTime);
          const natalAscendant = this.calculateAscendant(birthTime, birthData.latitude, birthData.longitude);

      
          const directedPlanets = {};
          for (const [planet, data] of Object.entries(natalPlanets)) {
            const natalLon = parseFloat(data.longitude);
      
            let directedLon = (natalLon + solarArc) % 360;
            if (directedLon < 0) directedLon += 360;
            
            const signInfo = this.getZodiacSign(directedLon);
            directedPlanets[planet] = {
              natal_longitude: natalLon.toFixed(4),
              directed_longitude: directedLon.toFixed(4),
              solar_arc_added: solarArc.toFixed(6),
              sign: signInfo.sign,
              position: this.formatDegree(signInfo),
              degree: this.calculateDegreeDecimal(signInfo).toFixed(2)
            };
          }

      
          const natalAscLon = parseFloat(natalAscendant.longitude);

          let directedAscLon = (natalAscLon + solarArc) % 360;
          if (directedAscLon < 0) directedAscLon += 360;
          
          const ascSignInfo = this.getZodiacSign(directedAscLon);
          const directedAscendant = {
            natal_longitude: natalAscLon.toFixed(4),
            directed_longitude: directedAscLon.toFixed(4),
            solar_arc_added: solarArc.toFixed(6),
            sign: ascSignInfo.sign,
            position: this.formatDegree(ascSignInfo),
            degree: this.calculateDegreeDecimal(ascSignInfo).toFixed(2)
          };

          return {
            method: 'Solar Arc Directions',
            planets: directedPlanets,
            ascendant: directedAscendant,
            progression_info: {
              birth_date: birthDateObj.toISOString().split('T')[0],
              birth_time: birthDateObj.toISOString().split('T')[1].substring(0, 5),
              target_date: targetDateObj.toISOString().split('T')[0],
              target_time: targetDateObj.toISOString().split('T')[1].substring(0, 5),
              age_in_years: parseFloat(yearsSinceBirth.toFixed(6)),
              age_in_days: parseFloat(daysElapsed.toFixed(2)),
              solar_arc_degrees: parseFloat(solarArc.toFixed(6))
            }
          };
        } catch (error) {
          console.error('Error calculating solar arc directions:', error);
          throw new Error(`Failed to calculate solar arc directions: ${error.message}`);
        }
      }

    
      calculateProgressions(birthData, targetDate, method = 'both') {
        try {
          if (method === 'secondary') {
            return this.calculateSecondaryProgressions(birthData, targetDate);
          } else if (method === 'solar_arc') {
            return this.calculateSolarArcDirections(birthData, targetDate);
          } else {
        
            const secondary = this.calculateSecondaryProgressions(birthData, targetDate);
            const solarArc = this.calculateSolarArcDirections(birthData, targetDate);
            
            return {
              secondary_progressions: secondary,
              solar_arc_directions: solarArc
            };
          }
        } catch (error) {
          console.error('Error calculating progressions:', error);
          throw new Error(`Failed to calculate progressions: ${error.message}`);
        }
      }

      calculateElementsAndModalities(planets, ascendant) {
        const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
        const modalities = { Cardinal: 0, Fixed: 0, Mutable: 0 };
        
        const signElements = {
          'Aries': 'Fire', 'Taurus': 'Earth', 'Gemini': 'Air', 'Cancer': 'Water',
          'Leo': 'Fire', 'Virgo': 'Earth', 'Libra': 'Air', 'Scorpius': 'Water',  
          'Ophiuchus': 'Fire', 'Sagittarius': 'Fire', 'Capricornus': 'Earth',   
          'Aquarius': 'Air', 'Pisces': 'Water'
        };
        
        const signModalities = {
          'Aries': 'Cardinal', 'Taurus': 'Fixed', 'Gemini': 'Mutable', 'Cancer': 'Cardinal',
          'Leo': 'Fixed', 'Virgo': 'Mutable', 'Libra': 'Cardinal', 'Scorpius': 'Fixed',  
          'Ophiuchus': 'Mutable', 'Sagittarius': 'Mutable', 'Capricornus': 'Cardinal',   
          'Aquarius': 'Fixed', 'Pisces': 'Mutable'
        };
      
        for (const [planet, data] of Object.entries(planets)) {
          const sign = data.sign;
          if (signElements[sign]) elements[signElements[sign]]++;
          if (signModalities[sign]) modalities[signModalities[sign]]++;
        }
        

        if (signElements[ascendant.sign]) elements[signElements[ascendant.sign]]++;
        if (signModalities[ascendant.sign]) modalities[signModalities[ascendant.sign]]++;
      
        return { elements, modalities };
      }
      getChartRuler(ascendantSign) {
        const rulers = {
          'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
          'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpius': 'Pluto',      
          'Ophiuchus': 'Chiron', 'Sagittarius': 'Jupiter', 'Capricornus': 'Saturn',    
          'Aquarius': 'Uranus', 'Pisces': 'Neptune'
        };
        
        return rulers[ascendantSign] || 'Unknown';
      }
      calculateMidheaven(astroTime, latitude, longitude) {
        try {
          const jd = 2451545.0 + astroTime.ut;
          const T = (jd - 2451545.0) / 36525;
          
        
          let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                    0.000387933 * T * T - T * T * T / 38710000;
          gmst = gmst % 360;
          if (gmst < 0) gmst += 360;
          
        
          let lst = gmst + longitude;
          lst = lst % 360;
          if (lst < 0) lst += 360;
      
        
          const epsilon = 23.439291 - 0.0130042 * T;
          const epsilonRad = epsilon * Math.PI / 180;
          const lstRad = lst * Math.PI / 180;
      
        
          let tropicalMC = Math.atan2(Math.sin(lstRad), 
                                      Math.cos(lstRad) * Math.cos(epsilonRad)) * 180 / Math.PI;
          if (tropicalMC < 0) tropicalMC += 360;
          
        
          let siderealMC;
          if (this.isTrueSidereal) {
            siderealMC = (tropicalMC + 360) % 360;
          } else {
            siderealMC = (tropicalMC - this.ayanamsa + 360) % 360;
          }
          
          const mcSign = this.getZodiacSign(siderealMC);
          
          return {
            longitude: siderealMC.toFixed(4),
            sign: mcSign.sign,
            position: this.formatDegree(mcSign),
            degree: this.calculateDegreeDecimal(mcSign).toFixed(2)
          };
        } catch (error) {
          console.error('Error calculating midheaven:', error);
          throw error;
        }
      }
      

      calculateLunarNodes(astroTime) {
        try {
        
          const jd = 2451545.0 + astroTime.ut;
          const T = (jd - 2451545.0) / 36525;
          
        
          let meanNode = 125.04452 - 1934.136261 * T + 
                        0.0020708 * T * T + T * T * T / 450000;
          meanNode = meanNode % 360;
          if (meanNode < 0) meanNode += 360;
          
        
          const northNode = (meanNode - this.ayanamsa + 360) % 360;
          const southNode = (northNode + 180) % 360;
          
          const nnSign = this.getZodiacSign(northNode);
          const snSign = this.getZodiacSign(southNode);
          
          return {
            north_node: {
              longitude: northNode.toFixed(4),
              sign: nnSign.sign,
              position: this.formatDegree(nnSign),
              degree: this.calculateDegreeDecimal(nnSign).toFixed(2)
            },
            south_node: {
              longitude: southNode.toFixed(4),
              sign: snSign.sign,
              position: this.formatDegree(snSign),
              degree: this.calculateDegreeDecimal(snSign).toFixed(2)
            }
          };
        } catch (error) {
          console.error('Error calculating lunar nodes:', error);
          throw error;
        }
      }
      

      calculateHouseCusps(astroTime, latitude, longitude, system = 'equal') {
        try {
          const ascendant = this.calculateAscendant(astroTime, latitude, longitude);
          
          if (!ascendant || typeof ascendant.longitude === 'undefined') {
            throw new Error('Invalid ascendant calculation');
          }
          
          const ascLon = parseFloat(ascendant.longitude);
          
          if (isNaN(ascLon) || ascLon < 0 || ascLon >= 360) {
            throw new Error(`Invalid ascendant longitude: ${ascLon}`);
          }
          
          const houses = [];
      
          if (system === 'equal') {
            for (let i = 0; i < 12; i++) {
              let cuspLon = (ascLon + (i * 30)) % 360;
              
              if (cuspLon < 0) cuspLon += 360;
              
              const signInfo = this.getZodiacSign(cuspLon);
              
              if (!signInfo || !signInfo.sign) {
                throw new Error(`Invalid sign calculation for longitude: ${cuspLon}`);
              }
              
              houses.push({
                house: i + 1,
                longitude: cuspLon.toFixed(4), // Absolute ecliptic longitude
                sign: signInfo.sign,
                position: this.formatDegree(signInfo), // This uses degree within sign
                degree: this.calculateDegreeDecimal(signInfo).toFixed(2), // REMOVE .toFixed here
                // ADD THESE for clarity:
                degreeInSign: Math.floor(signInfo.degree),
                minutes: Math.floor(signInfo.minutes),
                absoluteLongitude: cuspLon.toFixed(4)
              });
            }
          }
      
          return houses;
        } catch (error) {
          console.error('Error calculating house cusps:', error);
          return this.getFallbackHouses();
        }
      }
    
    // Fallback method in case of calculation errors
    getFallbackHouses() {
        const houses = [];
        for (let i = 0; i < 12; i++) {
            houses.push({
                house: i + 1,
                longitude: (i * 30).toFixed(6),
                sign: 'Aries', // Default sign
                position: '0°0\'0"',
                degree: '0.00',
                minutes: 0
            });
        }
        return houses;
    }
    
    // Improved degree formatting
   
    
      calculateMidpoint(lon1, lon2) {
  
        lon1 = ((lon1 % 360) + 360) % 360;
        lon2 = ((lon2 % 360) + 360) % 360;
        
      
        let diff = lon2 - lon1;
        
      
        if (diff > 180) {
        
          diff = diff - 360;
        } else if (diff < -180) {
        
          diff = diff + 360;
        }
        
      
        let midpoint = lon1 + (diff / 2);
        
      
        midpoint = ((midpoint % 360) + 360) % 360;
        
        return midpoint;
      }

      calculateCompositeChart(person1Data, person2Data) {
        try {
          
          const natal1 = this.calculateNatalChart(person1Data);
          const natal2 = this.calculateNatalChart(person2Data);

        
          const compositePlanets = {};
          const planetNames = Object.keys(natal1.planets);

          
          for (const planetName of planetNames) {
            const lon1 = parseFloat(natal1.planets[planetName].longitude); 
      const lon2 = parseFloat(natal2.planets[planetName].longitude); 
          
            const midpoint = this.calculateMidpoint(lon1, lon2);

            

            const signInfo = this.getZodiacSign(midpoint);
            compositePlanets[planetName] = {
              longitude: midpoint.toFixed(4),
              sign: signInfo.sign,
              position: this.formatDegree(signInfo),
              degree: this.calculateDegreeDecimal(signInfo).toFixed(2)
            };
          }

          
          const asc1 = parseFloat(natal1.ascendant.longitude);
          const asc2 = parseFloat(natal2.ascendant.longitude);
          
          const compositeAscLon = this.calculateMidpoint(asc1, asc2);
        
          const compositeAscSign = this.getZodiacSign(compositeAscLon);
          const compositeAscendant = {
            longitude: compositeAscLon.toFixed(4),
            sign: compositeAscSign.sign,
            position: this.formatDegree(compositeAscSign),
            degree: this.calculateDegreeDecimal(compositeAscSign).toFixed(2)
          };

    
          const compositeHouses = [];
          for (let i = 0; i < 12; i++) {
            let cuspLon = (compositeAscLon + (i * 30)) % 360;
            const signInfo = this.getZodiacSign(cuspLon);
            compositeHouses.push({
              house: i + 1,
              longitude: cuspLon.toFixed(4),
              sign: signInfo.sign,
              position: this.formatDegree(signInfo),
              degree: this.calculateDegreeDecimal(signInfo).toFixed(2)
            });
          }

        
          const compositeAspects = this.calculateAspects(compositePlanets);
          const synastryAspects = this.calculateAspects(natal1.planets, natal2.planets);

          return {
            chart_type: 'Composite',
            person1: {
              birth_info: natal1.birth_info,
              planets: natal1.planets,
              ascendant: natal1.ascendant
            },
            person2: {
              birth_info: natal2.birth_info,
              planets: natal2.planets,
              ascendant: natal2.ascendant
            },
            composite: {
              planets: compositePlanets,
              ascendant: compositeAscendant,
              houses: compositeHouses,
              aspects: compositeAspects
            },
            synastry_aspects: synastryAspects
          };
        } catch (error) {
          console.error('Error in calculateCompositeChart:', error);
          throw new Error(`Composite chart calculation failed: ${error.message}`);
        }
      }

    
      calculateSynastryChart(person1Data, person2Data) {
        try {
        
          const natal1 = this.calculateNatalChart(person1Data);
          const natal2 = this.calculateNatalChart(person2Data);

        
          const synastryAspects = this.calculateAspects(natal1.planets, natal2.planets);

          return {
            chart_type: 'Synastry',
            person1: {
              birth_info: natal1.birth_info,
              planets: natal1.planets,
              ascendant: natal1.ascendant,
              houses: natal1.houses
            },
            person2: {
              birth_info: natal2.birth_info,
              planets: natal2.planets,
              ascendant: natal2.ascendant,
              houses: natal2.houses
            },
            synastry_aspects: synastryAspects
          };
        } catch (error) {
          
          console.error('Error in calculateSynastryChart:', error);
          throw new Error(`Synastry chart calculation failed: ${error.message}`);
        }
      }

      calculateTransitChart(birthData, transitDate) {
        try {
          const natal = this.calculateNatalChart(birthData);
          const progressed = this.calculateProgressions(birthData, transitDate, 'secondary');

          const transitTime = this.createAstroTime(
            transitDate.year,
            transitDate.month,
            transitDate.day,
            transitDate.hour || 12,
            transitDate.minute || 0
          );

          const transitPlanets = this.calculatePlanetaryPositions(transitTime);
          const transitAscendant = this.calculateAscendant(
            transitTime,
            transitDate.latitude || birthData.latitude,
            transitDate.longitude || birthData.longitude
          );

          const natalToProgressed = this.calculateAspects(natal.planets, progressed.planets);
          const natalToTransit = this.calculateAspects(natal.planets, transitPlanets);
          const progressedToTransit = this.calculateAspects(progressed.planets, transitPlanets);

          return {
            chart_type: 'Transit (Triwheel)',
            natal: {
              planets: natal.planets,
              ascendant: natal.ascendant,
              houses: natal.houses
            },
            progressed: {
              planets: progressed.planets,
              ascendant: progressed.ascendant,
              progression_info: progressed.progression_info
            },
            transit: {
              planets: transitPlanets,
              ascendant: transitAscendant,
              date: `${transitDate.year}-${String(transitDate.month).padStart(2, '0')}-${String(transitDate.day).padStart(2, '0')}`,
              time: `${String(transitDate.hour || 12).padStart(2, '0')}:${String(transitDate.minute || 0).padStart(2, '0')}`
            },
            aspects: {
              natal_to_progressed: natalToProgressed,
              natal_to_transit: natalToTransit,
              progressed_to_transit: progressedToTransit
            }
          };
        } catch (error) {
          console.error('Error in calculateTransitChart:', error);
          throw error;
        }
      }

      calculateNatalChart(birthData) {
        try {
          const { year, month, day, hour, minute, latitude, longitude, timezone } = birthData;
      
          if (!year || !month || !day || hour === undefined || minute === undefined) {
            throw new Error('Missing required birth date/time parameters');
          }
      
          if (latitude === undefined || longitude === undefined) {
            throw new Error('Missing latitude or longitude');
          }
      
        
          const astroTime = this.createAstroTime(year, month, day, hour, minute);
          const planets = this.calculatePlanetaryPositions(astroTime);
          const ascendant = this.calculateAscendant(astroTime, latitude, longitude);
          const midheaven = this.calculateMidheaven(astroTime, latitude, longitude); 
          const lunarNodes = this.calculateLunarNodes(astroTime); 
          const houses = this.calculateHouseCusps(astroTime, latitude, longitude, 'equal');
          const aspects = this.calculateAspects(planets);
      

          const composition = this.calculateElementsAndModalities(planets, ascendant);
    const wheelData = this.generateChartWheelData(planets, ascendant, houses);

    return {
      chart_type: 'Natal',
      birth_info: {
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        location: { latitude, longitude },
        timezone: timezone || 'UTC',
        chart_ruler: this.getChartRuler(ascendant.sign)  
      },
      planets: planets,
      ascendant: ascendant,
      midheaven: midheaven,
      lunar_nodes: lunarNodes,
      houses: houses,
      aspects: aspects,
      composition: composition, 
      chart_wheel: wheelData     
    };

        } catch (error) {
          console.error('Error in calculateNatalChart:', error);
          throw new Error(`Natal chart calculation failed: ${error.message}`);
        }
      }
    }


    async function testCalculator() {
      const calculator = new SiderealAstrologyCalculator()
    
      const birthData = {
        year: 2025,
        month: 8,
        day: 5,
        hour: 9,     
        minute: 12,
        latitude: 33.591337,
        longitude: 73.051906,
        timezone: 'UTC'
      };
    
      const targetDate = {
        year: 2025,
        month: 10,
        day: 27,
        hour: 12,
        minute: 0
      };
      
      try {
        const progressions = calculator.calculateProgressions(birthData, targetDate);
        
    
        return progressions;
      } catch (error) {
        console.error('❌ Error:', error);
      }
    }

    
    if (require.main === module) {
      testCalculator();
    }

    module.exports = SiderealAstrologyCalculator;