




  //let siderealLon;




  const { Origin, Horoscope } = require('circular-natal-horoscope-js');













  const { DateTime } = require('luxon');
  const geoTz = require('geo-tz');
  const astronomy = require('astronomy-engine');
  const TROPICAL_SIGNS = [
    { name: 'Aries',       start:   0, end:  30 },
    { name: 'Taurus',      start:  30, end:  60 },
    { name: 'Gemini',      start:  60, end:  90 },
    { name: 'Cancer',      start:  90, end: 120 },
    { name: 'Leo',         start: 120, end: 150 },
    { name: 'Virgo',       start: 150, end: 180 },
    { name: 'Libra',       start: 180, end: 210 },
    { name: 'Scorpio',     start: 210, end: 240 },
    { name: 'Sagittarius', start: 240, end: 270 },
    { name: 'Capricorn',   start: 270, end: 300 },
    { name: 'Aquarius',    start: 300, end: 330 },
    { name: 'Pisces',      start: 330, end: 360 }
  ];


      const PRECESSION_RATE = 0.01397; 
  const EPOCH_YEAR = 2000.0;

      class SiderealAstrologyCalculator {
        constructor(ayanamsaType = 'tropical', birthYear = null) {
          const refYear = birthYear || new Date().getFullYear();
          const yearsSince2000 = refYear - 2000.0;
          const PRECESSION_RATE = 0.01397;
        
          this.isTropical = ayanamsaType === 'tropical';
          this.isTrueSidereal = ayanamsaType === 'true_sidereal';
        
          if (ayanamsaType === 'tropical') {
            this.ayanamsa = 0;
          } else if (ayanamsaType === 'true_sidereal') {
        
          this.ayanamsa = 30.08 + (PRECESSION_RATE * yearsSince2000);    
          this.planetAyanamsa = 28.47 + (PRECESSION_RATE * yearsSince2000); 
          } else {
            const base = { lahiri: 23.85, raman: 22.463, krishnamurti: 23.900, fagan_bradley: 24.836 };
            this.ayanamsa = (base[ayanamsaType] || 23.85) + (PRECESSION_RATE * yearsSince2000);
          }

          console.log('=== CONSTRUCTOR ===');
          console.log('ayanamsaType:', ayanamsaType);
          console.log('birthYear passed:', birthYear, '| refYear used:', refYear);
          console.log('yearsSince2000:', yearsSince2000);
          console.log('ayanamsa result:', this.ayanamsa);
          console.log('ayanamsa for year', refYear, ':', this.ayanamsa.toFixed(4));
          console.log('===================');
        }

        createAstroTime(year, month, day, hour, minute, lat, lng, timezone) {
          let utcDate;
          let localYear = year, localMonth = month - 1, localDate = day,
              localHour = hour, localMinute = minute;
        
          if (timezone && timezone !== 'UTC' && timezone !== '+00:00') {
            const localDt = DateTime.fromObject(
              { year, month, day, hour, minute }, { zone: timezone }
            );
            const utc = localDt.toUTC();
            utcDate = new Date(Date.UTC(utc.year, utc.month-1, utc.day, utc.hour, utc.minute, 0));
          
          } else {
            utcDate = new Date(Date.UTC(year, month-1, day, hour, minute, 0));
           
          }
        
          const astroTimeObj = astronomy.MakeTime(utcDate);
          astroTimeObj._pkgYear   = year;
          astroTimeObj._pkgMonth  = month - 1;
          astroTimeObj._pkgDate   = day;
          astroTimeObj._pkgHour   = hour;
          astroTimeObj._pkgMinute = minute;
        

          if (timezone && timezone !== 'UTC' && timezone !== '+00:00') {
          
            astroTimeObj._pkgHour   = hour;  
            astroTimeObj._pkgMinute = minute;
          } else {
            astroTimeObj._pkgHour   = hour;
            astroTimeObj._pkgMinute = minute;
          }
          console.log('[createAstroTime] local pkg time:', { localYear, localMonth, localDate, localHour, localMinute });
          console.log('[createAstroTime] utcDate:', utcDate.toISOString());
        
          return astroTimeObj;
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
      
      


        getZodiacSign(longitude) {
          let lon = ((longitude % 360) + 360) % 360;
        
        
          const siderealBoundaries = [
            { name: 'Aries',       start: 0,   end: 25  },
            { name: 'Taurus',      start: 25,  end: 62  },
            { name: 'Gemini',      start: 62,  end: 90  },
            { name: 'Cancer',      start: 90,  end: 110 },
            { name: 'Leo',         start: 110, end: 146 },
            { name: 'Virgo',       start: 146, end: 190 },
            { name: 'Libra',       start: 190, end: 213 },
            { name: 'Scorpio',     start: 213, end: 220 },
            { name: 'Ophiuchus',   start: 220, end: 238 },
            { name: 'Sagittarius', start: 238, end: 271 },
            { name: 'Capricorn',   start: 271, end: 299 },
            { name: 'Aquarius',    start: 299, end: 323 },
            { name: 'Pisces',      start: 323, end: 360 },
          ];
        
          for (const sign of siderealBoundaries) {
            if (lon >= sign.start && lon < sign.end) {
              const degreeInSign = lon - sign.start;
             
              if (degreeInSign < 0 || degreeInSign >= (sign.end - sign.start)) {
                console.warn(`Degree overflow: ${lon} in ${sign.name}, raw offset=${degreeInSign}`);
              }
              return {
                sign: sign.name,
                degree: degreeInSign,
                minutes: (degreeInSign % 1) * 60,
                absoluteLongitude: lon
              };
            }
          }
        
      
          return {
            sign: 'Pisces',
            degree: lon - 323,
            minutes: ((lon - 323) % 1) * 60,
            absoluteLongitude: lon
          };
        }


        formatDegree(degreeInfo) {
          let deg = Math.floor(degreeInfo.degree);
          const totalMinutes = (degreeInfo.degree - deg) * 60;
          let min = Math.floor(totalMinutes);
          let sec = Math.round((totalMinutes - min) * 60);
          
        
          if (sec >= 60) {
            sec = 0;
            min += 1;
          }
          
         
          if (sec < 0) {
            sec = 0;
          }
          
        

          if (min >= 60) {
            min = 0;
            deg += 1;
        }
          
       
          if (min < 0) {
            min = 0;
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

        computeLST(astroTime, longitude) {
         
          const gst = astronomy.SiderealTime(astroTime); 
          let lst = ((gst * 15 + longitude) % 360 + 360) % 360; 
          return lst;
        }
        
        calculateHouseCusps(astroTime, latitude, longitude, system = 'placidus') {
          try {
            const origin = new Origin({
              year:    astroTime._pkgYear,
              month:   astroTime._pkgMonth,
              date:    astroTime._pkgDate,
              hour:    astroTime._pkgHour,
              minute:  astroTime._pkgMinute,
              latitude,
              longitude
            });


            const horoscope = new Horoscope({
              origin,
              houseSystem: 'placidus',
              zodiac: 'tropical',
              aspectPoints: [],
              aspectWithPoints: [],
              aspectTypes: [],
              customOrbs: {},
              language: 'en'
            });
        
            
            console.log('=== HOUSE STRUCTURE DEBUG ===');
            console.log('Houses length:', horoscope.Houses.length);
            console.log('House[0] full:', JSON.stringify(horoscope.Houses[0], null, 2));
            console.log('=============================');
        
           
            const getCusp = (house) => {
              if (house?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees !== undefined)
                return house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
              if (house?.ChartPosition?.Ecliptic?.DecimalDegrees !== undefined)
                return house.ChartPosition.Ecliptic.DecimalDegrees;
              if (house?.StartPosition?.Ecliptic?.DecimalDegrees !== undefined)
                return house.StartPosition.Ecliptic.DecimalDegrees;
              if (house?.Ecliptic?.DecimalDegrees !== undefined)
                return house.Ecliptic.DecimalDegrees;
              if (house?.degree !== undefined)
                return house.degree;
            
              console.error('Unknown house structure:', JSON.stringify(Object.keys(house)));
              return 0;
            };
        
            const tropicalCusps = horoscope.Houses.map(getCusp);
        
            console.log('=== CIRCULAR PACKAGE TROPICAL CUSPS ===');
            tropicalCusps.forEach((c, i) => console.log(`H${i+1}: ${c.toFixed(4)}°`));
            console.log('========================================');
        
            const houses = [];
            for (let i = 0; i < 12; i++) {
              const siderealCusp = this.isTropical
                ? ((tropicalCusps[i] % 360) + 360) % 360
                : ((tropicalCusps[i] - this.ayanamsa) % 360 + 360) % 360;
        
                const signInfo = this.getTropicalSign(siderealCusp);
                houses.push({
                  house: i + 1,
                  longitude:          siderealCusp.toFixed(4),
                  tropicalLongitude:  tropicalCusps[i].toFixed(4),  
                  sign:               signInfo.sign,
                  position:           this.formatDegree(signInfo),
                  degree:             this.calculateDegreeDecimal(signInfo).toFixed(2),
                  degreeInSign:       Math.floor(signInfo.degree),
                  minutes:            Math.floor(signInfo.minutes),
                  absoluteLongitude:  siderealCusp.toFixed(4)
                });
            }
        
            return houses;
        
          } catch (error) {
            console.error('Error calculating house cusps:', error);
            console.error('Error calculating house cusps:', error); 
            console.error('FALLING BACK TO DEFAULT HOUSES'); 
            return this.getFallbackHouses();
          }
        }


        calculateDegreeDecimal(degreeInfo) {
          let degree = parseFloat(degreeInfo.degree);
         
          if (degree < 0) degree = 0;
          
          return degree;
        }
        calculatePlanetaryPositions(astroTime) {
          const planets = {};
        
          try {
            const calculatePlanet = (planetName) => {
              try {
                const helio = astronomy.HelioVector(planetName, astroTime);
                const earthHelio = astronomy.HelioVector('Earth', astroTime);
                const geoVector = {
                  x: helio.x - earthHelio.x,
                  y: helio.y - earthHelio.y,
                  z: helio.z - earthHelio.z,
                  t: astroTime
                };
                const ecliptic = astronomy.Ecliptic(geoVector);
                const rawTropicalLon = ((ecliptic.elon % 360) + 360) % 360;
               
                
                const finalLon = this.isTropical
                ? rawTropicalLon
                : (rawTropicalLon - this.planetAyanamsa + 360) % 360;
              
              
                const signInfo = this.getZodiacSign(finalLon);
                console.log(`[SATURN DEBUG] rawTropicalLon=${rawTropicalLon}, finalLon=${finalLon}, sign=${signInfo.sign}`);

                return {
                  longitude: finalLon.toFixed(4),
                  tropicalLongitude: rawTropicalLon.toFixed(4),
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
              let tropicalLon;
              const rawLon = ((sunEcl.elon % 360) + 360) % 360;
              const siderealLon = this.isTropical ? rawLon : (rawLon - this.planetAyanamsa + 360) % 360;

  const sunSign = this.getZodiacSign(siderealLon);

  planets.Sun = {
    longitude: siderealLon.toFixed(4),
    tropicalLongitude: rawLon.toFixed(4),
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
              let tropicalLon = ((moonEcl.elon % 360) + 360) % 360;
              
              if (!this.isTropical) {
                tropicalLon = (tropicalLon - this.ayanamsa + 360) % 360;
              }

       
  const moonTropicalRaw = ((moonEcl.elon % 360) + 360) % 360;
  let moonSiderealLon = moonTropicalRaw;
  if (!this.isTropical) {
    moonSiderealLon = (moonTropicalRaw - this.planetAyanamsa + 360) % 360;
  }
  const moonSign = this.getZodiacSign(moonSiderealLon);
  planets.Moon = {
    longitude: moonSiderealLon.toFixed(4),
    tropicalLongitude: moonTropicalRaw.toFixed(4),
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
        
            
            planets.Mercury = calculatePlanet('Mercury');
  planets.Venus = calculatePlanet('Venus');
  planets.Mars = calculatePlanet('Mars');
  planets.Jupiter = calculatePlanet('Jupiter');
  try {

const saturnEquatorial = astronomy.Equator('Saturn', astroTime, true, true);
const saturnEcliptic = astronomy.EclipticGeoMoon(astroTime); 

const saturnHorizon = astronomy.GeoVector('Saturn', astroTime, false);
const saturnEcl = astronomy.Ecliptic(saturnHorizon);
const saturnTropical = ((saturnEcl.elon % 360) + 360) % 360;
console.log('[SATURN v2] tropical:', saturnTropical);
  
   
    const saturnSidereal = this.isTropical 
      ? saturnTropical 
      : (saturnTropical - this.planetAyanamsa + 360) % 360;
    console.log('[SATURN DEDICATED] tropical:', saturnTropical, 'sidereal:', saturnSidereal);
    const saturnSign = this.getZodiacSign(saturnSidereal);
    planets.Saturn = {
      longitude: saturnSidereal.toFixed(4),
      tropicalLongitude: saturnTropical.toFixed(4),
      sign: saturnSign.sign,
      position: this.formatDegree(saturnSign),
      degree: this.calculateDegreeDecimal(saturnSign).toFixed(2)
    };
  } catch(e) {
    planets.Saturn = calculatePlanet('Saturn');
  }
  planets.Uranus = calculatePlanet('Uranus');
  planets.Neptune = calculatePlanet('Neptune');
  planets.Pluto = calculatePlanet('Pluto');
        
          } catch (error) {
            console.error('Error in calculatePlanetaryPositions:', error);
            throw new Error(`Failed to calculate planetary positions: ${error.message}`);
          }
        
          return planets;
        }

        getTropicalSign(longitude) {
          let lon = ((longitude % 360) + 360) % 360;
          const signIndex = Math.floor(lon / 30);
          const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                          'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
          const degree = lon - (signIndex * 30);
          return {
            sign: signs[signIndex],
            degree: degree,
            minutes: (degree % 1) * 60,
            absoluteLongitude: lon
          };
        }
      calculateAscendant(astroTime, latitude, longitude) {
    try {
      console.log('[ORIGIN INPUT]', {
        year: astroTime._pkgYear,
        month: astroTime._pkgMonth,
        date: astroTime._pkgDate,
        hour: astroTime._pkgHour,
        minute: astroTime._pkgMinute
      });
  
  const origin = new Origin({
    year:    astroTime._pkgYear,
    month:   astroTime._pkgMonth,
    date:    astroTime._pkgDate,
    hour:    astroTime._pkgHour,
    minute:  astroTime._pkgMinute,
    latitude,
    longitude
  });

      const horoscope = new Horoscope({
        origin,
        houseSystem: 'placidus',
        zodiac: 'tropical',
        aspectPoints: [],
        aspectWithPoints: [],
        aspectTypes: [],
        customOrbs: {},
        language: 'en'
      });

      const tropicalAsc = horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees;

      const finalAsc = this.isTropical
        ? ((tropicalAsc % 360) + 360) % 360
        : (tropicalAsc - this.ayanamsa + 360) % 360;

const ascSign = this.getTropicalSign(finalAsc); 
      console.log('[ASC COMPARISON]');
  console.log('tropicalAsc from circular package:', tropicalAsc.toFixed(4));
  console.log('ayanamsa being subtracted:', this.ayanamsa.toFixed(4));
  console.log('finalAsc (sidereal):', finalAsc.toFixed(4));
  console.log('Competitor expects finalAsc ~177° (Virgo 27° in their system)');
  console.log('So tropical ASC should be ~177 + ayanamsa =', (177 + this.ayanamsa).toFixed(2));
      return {
        longitude: finalAsc.toFixed(4),
        sign:      ascSign.sign,
        position:  this.formatDegree(ascSign),
        degree:    this.calculateDegreeDecimal(ascSign).toFixed(2)
      };
    } catch (error) {
      console.error('Error calculating ascendant:', error);
      throw error;
    }
  }

  calculateMidheaven(astroTime, latitude, longitude) {
    try {
      const origin = new Origin({
        year:    astroTime._pkgYear,
        month:   astroTime._pkgMonth,
        date:    astroTime._pkgDate,
        hour:    astroTime._pkgHour,
        minute:  astroTime._pkgMinute,
        latitude,
        longitude
      });


      const horoscope = new Horoscope({
        origin,
        houseSystem: 'placidus',
        zodiac: 'tropical',
        aspectPoints: [],
        aspectWithPoints: [],
        aspectTypes: [],
        customOrbs: {},
        language: 'en'
      });

      const tropicalMC = horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees;

      const finalMC = this.isTropical
        ? ((tropicalMC % 360) + 360) % 360
        : (tropicalMC - this.ayanamsa + 360) % 360;

        const mcSign = this.getTropicalSign(finalMC);
      return {
        longitude: finalMC.toFixed(4),
        sign:      mcSign.sign,
        position:  this.formatDegree(mcSign),
        degree:    this.calculateDegreeDecimal(mcSign).toFixed(2)
      };
    } catch (error) {
      console.error('Error calculating midheaven:', error);
      throw error;
    }
  }

        



        calculateAspects(planets1, planets2 = null) {
          const aspects = [];
          const aspectTypes = [
            { name: 'Conjunction',  angle: 0,   orb: 8 },
            { name: 'Opposition',   angle: 180, orb: 8 },
            { name: 'Trine',        angle: 120, orb: 8 },
            { name: 'Square',       angle: 90,  orb: 8 },
            { name: 'Sextile',      angle: 60,  orb: 6 },
            { name: 'Semisextile',  angle: 30,  orb: 2 },
            { name: 'Quincunx',     angle: 150, orb: 3 }
          ];
          
        
          const sourcePlanets = planets1;
          const targetPlanets = planets2 || planets1;
          console.log('=== ASPECT DEBUG ===');
    for (const [name, data] of Object.entries(planets1)) {
      console.log(`${name}: sidereal=${data.longitude} tropical=${data.tropicalLongitude}`);
    }
    console.log('===================');
        
    const seenPairs = new Set();
    for (const planet1Name of Object.keys(sourcePlanets)) {
      for (const planet2Name of Object.keys(targetPlanets)) {
        if (!planets2 && planet1Name === planet2Name) continue;
        const pairKey = [planet1Name, planet2Name].sort().join('-');
        if (!planets2 && seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);
              const lon1 = parseFloat(sourcePlanets[planet1Name].tropicalLongitude || sourcePlanets[planet1Name].longitude); 
              const lon2 = parseFloat(targetPlanets[planet2Name].tropicalLongitude || targetPlanets[planet2Name].longitude);
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
        
      

        calculateSecondaryProgressions(birthData, targetDate) {
          try {
          
            if (!birthData || !targetDate) {
              throw new Error('Birth data and target date are required');
            }
        
            
            let birthDateObj;
            if (birthData.timezone && birthData.timezone !== 'UTC') {
              const localDt = DateTime.fromObject(
                { year: birthData.year, month: birthData.month, day: birthData.day, 
                  hour: birthData.hour, minute: birthData.minute },
                { zone: birthData.timezone }
              );
              const utc = localDt.toUTC();
              birthDateObj = new Date(Date.UTC(utc.year, utc.month - 1, utc.day, utc.hour, utc.minute, 0));
            } else {
              birthDateObj = new Date(Date.UTC(
                birthData.year, birthData.month - 1, birthData.day,
                birthData.hour, birthData.minute
              ));
            }
            
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
            let birthDateObj;
            if (birthData.timezone && birthData.timezone !== 'UTC') {
              const localDt = DateTime.fromObject(
                { year: birthData.year, month: birthData.month, day: birthData.day, 
                  hour: birthData.hour, minute: birthData.minute },
                { zone: birthData.timezone }
              );
              const utc = localDt.toUTC();
              birthDateObj = new Date(Date.UTC(utc.year, utc.month - 1, utc.day, utc.hour, utc.minute, 0));
            } else {
              birthDateObj = new Date(Date.UTC(
                birthData.year, birthData.month - 1, birthData.day,
                birthData.hour, birthData.minute
              ));
            }
            
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
    

    
        

        calculateLunarNodes(astroTime) {
          try {
          
            const jd = astroTime.ut + 2451545.0;
            console.log('astroTime.ut raw:', astroTime.ut);
 
            const T = (jd - 2451545.0) / 36525;
            
          
            let meanNode = 125.04452 - 1934.136261 * T + 
                          0.0020708 * T * T + T * T * T / 450000;
            meanNode = meanNode % 360;
            if (meanNode < 0) meanNode += 360;
            
          
            const northNode = this.isTropical ? ((meanNode % 360) + 360) % 360 : (meanNode - this.planetAyanamsa + 360) % 360;
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
        

      
      
      getFallbackHouses() {
          const houses = [];
          for (let i = 0; i < 12; i++) {
              houses.push({
                  house: i + 1,
                  longitude: (i * 30).toFixed(6),
                  sign: 'Aries', 
                  position: '0°0\'0"',
                  degree: '0.00',
                  minutes: 0
              });
          }
          return houses;
      }
      
   
    
      
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
            
            const mc1 = parseFloat(natal1.midheaven.longitude);
            const mc2 = parseFloat(natal2.midheaven.longitude);
            const compositeMCLon = this.calculateMidpoint(mc1, mc2);
            const compositeMCSign = this.getZodiacSign(compositeMCLon);
            const compositeMidheaven = {
              longitude: compositeMCLon.toFixed(4),
              sign: compositeMCSign.sign,
              position: this.formatDegree(compositeMCSign),
              degree: this.calculateDegreeDecimal(compositeMCSign).toFixed(2)
            };
            
            const compositeWithHouses = this.assignPlanetsToHouses(compositePlanets, compositeHouses);

  return {
    chart_type: 'Composite',
    person1: {
      birth_info: natal1.birth_info,
      planets: natal1.planets,
      ascendant: natal1.ascendant,
      midheaven: natal1.midheaven,
      houses: natal1.houses,
      aspects: natal1.aspects,
    },
    person2: {
      birth_info: natal2.birth_info,
      planets: natal2.planets,
      ascendant: natal2.ascendant,
      midheaven: natal2.midheaven,
      houses: natal2.houses,
      aspects: natal2.aspects,
    },
    composite: {
      planets: compositeWithHouses, 
      ascendant: compositeAscendant,
      midheaven: compositeMidheaven,
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
                houses: natal1.houses,
                midheaven: natal1.midheaven,
                aspects: natal1.aspects,
              },
              person2: {
                birth_info: natal2.birth_info,
                planets: natal2.planets,
                ascendant: natal2.ascendant,
                houses: natal2.houses,
                midheaven: natal2.midheaven,
                aspects: natal2.aspects,
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
                houses: natal.houses,
                midheaven: natal.midheaven,
                aspects: natal.aspects,
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


    
      


        assignPlanetsToHouses(planets, houses) {
       
          const tropicalCusps = houses.map(h => 
            parseFloat(h.tropicalLongitude || h.longitude)
          );
          console.log('[HOUSE ASSIGN] tropicalCusps:', tropicalCusps.map((c,i) => `H${i+1}:${c.toFixed(2)}`));
console.log('[HOUSE ASSIGN] Moon tropical:', parseFloat(planets.Moon?.tropicalLongitude));

          const asc = tropicalCusps[0];
          const cuspsFromAsc = tropicalCusps.map(c => ((c - asc + 360) % 360));
        
        
          const sortedCusps = cuspsFromAsc
            .map((dist, i) => ({ dist, houseNum: i + 1 }))
            .sort((a, b) => a.dist - b.dist);
        
          const getHouseNumber = (tropicalLon) => {
            const lon = ((tropicalLon % 360) + 360) % 360;
            const distFromAsc = ((lon - asc + 360) % 360);
        
            for (let i = 0; i < 12; i++) {
              const current = sortedCusps[i].dist;
              const next = i < 11 ? sortedCusps[i + 1].dist : 360;
              if (distFromAsc >= current && distFromAsc < next) {
                return sortedCusps[i].houseNum;
              }
            }
            return sortedCusps[0].houseNum;
          };
        
          const result = {};
          for (const [name, data] of Object.entries(planets)) {
            const tropicalLon = parseFloat(data.tropicalLongitude || data.longitude);
            const house = getHouseNumber(tropicalLon);
            console.log(`  ${name}: tropical=${tropicalLon.toFixed(2)}° → House ${house}`);
            result[name] = { ...data, house };
          }
          return result;
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
        
          
            const astroTime = this.createAstroTime(year, month, day, hour, minute, latitude, longitude, timezone);
            const planets = this.calculatePlanetaryPositions(astroTime);
            const ascendant = this.calculateAscendant(astroTime, latitude, longitude);
            const midheaven = this.calculateMidheaven(astroTime, latitude, longitude); 
            const lunarNodes = this.calculateLunarNodes(astroTime); 
            const houses = this.calculateHouseCusps(astroTime, latitude, longitude, 'placidus');
            const aspects = this.calculateAspects(planets);
            console.log('=== HOUSE CUSPS DEBUG ===');
            houses.forEach(h => console.log(`House ${h.house}: ${h.longitude}° (${h.sign})`));
            console.log('Sun longitude:', planets.Sun.longitude);
            console.log('=========================');
            const planetsWithHouses = this.assignPlanetsToHouses(planets, houses);

            console.log('=== PLANET HOUSE SUMMARY ===');
            console.log(`ASC: ${ascendant.longitude}° (${ascendant.sign})`);
            Object.entries(planetsWithHouses).forEach(([name, data]) => {
              console.log(`  ${name}: ${data.longitude}° ${data.sign} → House ${data.house}`);
            });
            console.log('============================');

            const composition = this.calculateElementsAndModalities(planetsWithHouses, ascendant);
      const wheelData = this.generateChartWheelData(planetsWithHouses, ascendant, houses);

      console.log('birthData received:', JSON.stringify({
        year: birthData.year,
        month: birthData.month, 
        day: birthData.day,
        hour: birthData.hour,
        minute: birthData.minute,
        timezone: birthData.timezone
      }));

      return {
        chart_type: 'Natal',
        birth_info: {
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          location: { latitude, longitude },
          timezone: timezone || 'UTC',
          chart_ruler: this.getChartRuler(ascendant.sign)  
        },
        planets: planetsWithHouses,
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
        const birthData = {
          year: 1996,
          month: 5,
          day: 19,
          hour: 17,
          minute: 47,
          latitude: 43.8563707,
          longitude: -79.3376825,
          timezone: 'America/Toronto'
        };
        const year = birthData.year; 

      const SiderealAstrologyCalculator = require('../util/calculator');
      const calculator = new SiderealAstrologyCalculator('true_sidereal', birthData.year);

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