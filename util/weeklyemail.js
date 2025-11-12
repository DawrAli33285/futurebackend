// const svg2img = require('svg2img');
// const util = require('util');
// const svg2imgPromise = util.promisify(svg2img);
// const fs = require('fs').promises;
// const path = require('path'); 
// const nodemailer = require('nodemailer');
// const {cloudinaryUploadImage}=require('../util/cloudinary')
// const cron = require('node-cron');
// const axios = require('axios');
// const subscription = require('../models/subscription');

// const APP_ID = '37dc92a5-a64e-45fa-8566-1fc9d1d648f1'.trim();
// const APP_SECRET = 'cd40ba3f33a87de9eee56063e276f77d2a8080fd1a5a8674f466f0c01dbbba425d89fab89e894f0849c9831b0306a6e22b5bf0bd198f36b1cd01e9a8b8c6621cc9591f6cdf9e7f1fb7193262083a47ca9ae90ec1bc935f7b53cd6d9eed9a7e29930012498f0e71ea38fe48cf10fc2c1d'.trim();




// const OBSERVER_LATITUDE = 33.775867;
// const OBSERVER_LONGITUDE = -84.39733;
// const OBSERVER_ELEVATION = 10;



// async function convertSVGtoPNG(svgContent, outputPath) {
//   try {
//     console.log(`🔄 Converting SVG to PNG...`);
//     console.log(`📝 SVG length: ${svgContent.length} characters`);
    
//     const pngBuffer = await svg2imgPromise(svgContent, {
//       width: 800,
//       height: 800,
//       format: 'png'
//     });
    
//     await fs.writeFile(outputPath, pngBuffer);
    
//     console.log(`✅ Natal chart image saved: ${outputPath}`);
//     return outputPath;
//   } catch (error) {
//     console.error('❌ Error converting SVG to PNG:', error);
//     throw error;
//   }
// }

// function getWeekDates(startDate = new Date()) {
//   const dates = [];
//   const current = new Date(startDate);
//   const dayOfWeek = current.getDay();
  
//   let daysUntilNextSunday;
//   if (dayOfWeek === 0) {
//     daysUntilNextSunday = 0;
//   } else {
//     daysUntilNextSunday = 7 - dayOfWeek;
//   }
  
//   const sunday = new Date(current);
//   sunday.setDate(sunday.getDate() + daysUntilNextSunday);
//   sunday.setHours(12, 0, 0, 0);

//   for (let i = 0; i < 7; i++) {
//     const day = new Date(sunday);
//     day.setDate(day.getDate() + i);
//     dates.push(day);
//   }

//   return dates;
// }

// function formatDate(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

// function formatTime(date) {
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');
//   return `${hours}:${minutes}:${seconds}`;
// }

// function parseRAToDecimal(raValue) {
//   try {
//     if (typeof raValue === 'number') {
//       console.log(`   ✅ RA already decimal: ${raValue} hours`);
//       return raValue;
//     }

//     if (typeof raValue === 'object' && raValue !== null && raValue.hours !== undefined) {
//       const hoursValue = parseFloat(raValue.hours);
//       console.log(`   ✅ RA from object.hours: ${hoursValue} hours`);
//       return hoursValue;
//     }

//     if (typeof raValue === 'string') {
//       const match = raValue.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
//       if (match) {
//         const hours = parseInt(match[1]);
//         const minutes = parseInt(match[2]);
//         const seconds = parseFloat(match[3]);
//         const result = hours + (minutes / 60) + (seconds / 3600);
//         console.log(`   ✅ RA parsed from string: ${result} hours`);
//         return result;
//       }
//     }

//     console.warn(`   ❌ Could not parse RA:`, raValue);
//     return 0;
//   } catch (error) {
//     console.error('❌ Error parsing RA:', error, raValue);
//     return 0;
//   }
// }

// function parseDecToDecimal(decValue) {
//   try {
//     if (typeof decValue === 'number') {
//       console.log(`   ✅ Dec already decimal: ${decValue} degrees`);
//       return decValue;
//     }

//     if (typeof decValue === 'object' && decValue !== null && decValue.degrees !== undefined) {
//       const degreesValue = parseFloat(decValue.degrees);
//       console.log(`   ✅ Dec from object.degrees: ${degreesValue} degrees`);
//       return degreesValue;
//     }

//     if (typeof decValue === 'string') {
//       const match = decValue.match(/([-+]?)(\d+)°\s*(\d+)'\s*([\d.]+)"/);
//       if (match) {
//         const sign = match[1] === '-' ? -1 : 1;
//         const degrees = parseInt(match[2]);
//         const minutes = parseInt(match[3]);
//         const seconds = parseFloat(match[4]);
//         const result = sign * (degrees + (minutes / 60) + (seconds / 3600));
//         console.log(`   ✅ Dec parsed from string: ${result} degrees`);
//         return result;
//       }
//     }

//     console.warn(`   ❌ Could not parse Dec:`, decValue);
//     return 0;
//   } catch (error) {
//     console.error('❌ Error parsing Dec:', error, decValue);
//     return 0;
//   }
// }

// async function getWeeklyPlanetaryPositions(fromDate, toDate) {
//   try {
//     const formattedFromDate = formatDate(fromDate);
//     const formattedToDate = formatDate(toDate);
//     const time = formatTime(new Date());
    
//     const authString = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');

//     console.log(`📡 Fetching planetary data from ${formattedFromDate} to ${formattedToDate}`);
//     console.log(`📍 Observer Location: Lat ${OBSERVER_LATITUDE}, Lon ${OBSERVER_LONGITUDE}, Elev ${OBSERVER_ELEVATION}m`);
//     console.log(`⏰ Time: ${time}`);

//     const requestParams = {
//       latitude: OBSERVER_LATITUDE,
//       longitude: OBSERVER_LONGITUDE,
//       elevation: OBSERVER_ELEVATION,
//       from_date: formattedFromDate,
//       to_date: formattedToDate,
//       time: time,
//       bodies: 'sun,moon,mercury,venus,mars,jupiter,saturn',
//     };

//     console.log(`🔍 Request Params:`, JSON.stringify(requestParams, null, 2));

//     const response = await axios.get(
//       'https://api.astronomyapi.com/api/v2/bodies/positions',
//       {
//         headers: {
//           'Authorization': `Basic ${authString}`,
//         },
//         params: requestParams,
//       }
//     );

//     console.log(`✅ API Response received. Status: ${response.status}`);
//     return processAPIResponse(response.data);
//   } catch (error) {
//     console.error('❌ API request failed:', error.message);
    
//     if (error.response) {
//       console.error('📊 Response Status:', error.response.status);
//       console.error('📊 Response Data:', JSON.stringify(error.response.data, null, 2));
//       console.error('📊 Response Headers:', JSON.stringify(error.response.headers, null, 2));
//     } else if (error.request) {
//       console.error('📊 No response received. Request:', error.request);
//     } else {
//       console.error('📊 Error setting up request:', error.message);
//     }
    
//     throw error;
//   }
// }

// function processAPIResponse(apiResponse) {
//   const positionsByDate = {};

//   console.log(`🔍 Processing API Response...`);
//   console.log(`📋 Response keys:`, Object.keys(apiResponse));

//   if (apiResponse.data && apiResponse.data.table && apiResponse.data.table.rows) {
//     const rows = apiResponse.data.table.rows;
//     console.log(`📊 Total rows received: ${rows.length}`);

//     rows.forEach((row, rowIndex) => {
//       const planetId = row.entry.id;
//       const planetName = row.entry.name;

//       console.log(`  🪐 Planet ${rowIndex + 1}: ${planetName} (${planetId}) - ${row.cells ? row.cells.length : 0} cells`);

//       if (row.cells && row.cells.length > 0) {
//         row.cells.forEach((cell, cellIndex) => {
//           const cellDate = cell.date;

//           if (!positionsByDate[cellDate]) {
//             positionsByDate[cellDate] = {};
//           }

//           const raValue = cell.position.equatorial.rightAscension;
//           const decValue = cell.position.equatorial.declination;
          
//           const raDecimal = parseRAToDecimal(raValue);
//           const decDecimal = parseDecToDecimal(decValue);

//           console.log(`      📊 Parsed ${cell.name}: RA=${raDecimal}, Dec=${decDecimal}`);

//           positionsByDate[cellDate][planetId] = {
//             id: cell.id,
//             name: cell.name,
//             date: cell.date,
//             distance: {
//               au: parseFloat(cell.distance.fromEarth.au),
//               km: parseFloat(cell.distance.fromEarth.km)
//             },
//             position: {
//               horizontal: {
//                 altitude: parseFloat(cell.position.horizontal.altitude.degrees),
//                 azimuth: parseFloat(cell.position.horizontal.azimuth.degrees)
//               },
//               equatorial: {
//                 rightAscension: raDecimal,
//                 declination: decDecimal
//               },
//               constellation: cell.position.constellation.name
//             },
//             magnitude: cell.extraInfo.magnitude !== null ? parseFloat(cell.extraInfo.magnitude) : null,
//             elongation: cell.extraInfo.elongation !== null ? parseFloat(cell.extraInfo.elongation) : null
//           };
//         });
//       }
//     });

//     console.log(`✅ Processed ${Object.keys(positionsByDate).length} unique dates`);
//     console.log(`📅 Dates available:`, Object.keys(positionsByDate).sort());
//   } else {
//     console.warn(`⚠️  Unexpected API response structure`);
//     console.log(`Full response:`, JSON.stringify(apiResponse, null, 2));
//   }

//   return positionsByDate;
// }

// async function getAPIPlanetaryPositions(date = new Date()) {
//   try {
//     const formattedDate = formatDate(date);
//     const time = formatTime(new Date());
//     const authString = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');

//     console.log(`🔍 [Single Date] Fetching for: ${formattedDate}`);
//     console.log(`⏰ [Single Date] Time: ${time}`);

//     const requestParams = {
//       latitude: OBSERVER_LATITUDE,
//       longitude: OBSERVER_LONGITUDE,
//       elevation: OBSERVER_ELEVATION,
//       from_date: formattedDate,
//       to_date: formattedDate,
//       time: time,
//       bodies: 'sun,moon,mercury,venus,mars,jupiter,saturn',
//     };

//     console.log(`🔍 [Single Date] Request Params:`, JSON.stringify(requestParams, null, 2));

//     const response = await axios.get(
//       'https://api.astronomyapi.com/api/v2/bodies/positions',
//       {
//         headers: {
//           'Authorization': `Basic ${authString}`,
//         },
//         params: requestParams,
//       }
//     );

//     console.log(`✅ [Single Date] API Response received. Status: ${response.status}`);
//     return processSingleDateResponse(response.data);
//   } catch (error) {
//     console.error('❌ [Single Date] API request failed:', error.message);
    
//     if (error.response) {
//       console.error('📊 Response Status:', error.response.status);
//       console.error('📊 Response Data:', JSON.stringify(error.response.data, null, 2));
//     } else if (error.request) {
//       console.error('📊 No response received. Request:', error.request);
//     }
    
//     throw error;
//   }
// }

// function processSingleDateResponse(apiResponse) {
//   const positions = {};

//   console.log(`🔍 Processing Single Date Response...`);
//   console.log(`📋 Response keys:`, Object.keys(apiResponse));

//   if (apiResponse.data && apiResponse.data.table && apiResponse.data.table.rows) {
//     const rows = apiResponse.data.table.rows;
//     console.log(`📊 Total rows received: ${rows.length}`);

//     rows.forEach((row, rowIndex) => {
//       const planetId = row.entry.id;
//       const planetName = row.entry.name;

//       console.log(`  🪐 Planet ${rowIndex + 1}: ${planetName} (${planetId}) - ${row.cells ? row.cells.length : 0} cells`);

//       if (row.cells && row.cells.length > 0) {
//         const cell = row.cells[0];

//         const raValue = cell.position.equatorial.rightAscension;
//         const decValue = cell.position.equatorial.declination;
        
//         const raDecimal = parseRAToDecimal(raValue);
//         const decDecimal = parseDecToDecimal(decValue);

//         console.log(`      📊 Parsed ${cell.name}: RA=${raDecimal}, Dec=${decDecimal}`);

//         positions[planetId] = {
//           id: cell.id,
//           name: cell.name,
//           date: cell.date,
//           distance: {
//             au: parseFloat(cell.distance.fromEarth.au),
//             km: parseFloat(cell.distance.fromEarth.km)
//           },
//           position: {
//             horizontal: {
//               altitude: parseFloat(cell.position.horizontal.altitude.degrees),
//               azimuth: parseFloat(cell.position.horizontal.azimuth.degrees)
//             },
//             equatorial: {
//               rightAscension: raDecimal,
//               declination: decDecimal
//             },
//             constellation: cell.position.constellation.name
//           },
//           magnitude: cell.extraInfo.magnitude !== null ? parseFloat(cell.extraInfo.magnitude) : null,
//           elongation: cell.extraInfo.elongation !== null ? parseFloat(cell.extraInfo.elongation) : null
//         };
//       }
//     });

//     console.log(`✅ Processed ${Object.keys(positions).length} planets`);
//   } else {
//     console.warn(`⚠️  Unexpected API response structure`);
//     console.log(`Full response:`, JSON.stringify(apiResponse, null, 2));
//   }

//   return positions;
// }

// async function getPlanetaryPositions(date = new Date()) {
//   try {
//     const positions = await getAPIPlanetaryPositions(date);

//     if (!positions || Object.keys(positions).length === 0) {
//       throw new Error('No positions received from API');
//     }

//     return positions;
//   } catch (error) {
//     console.error('Error getting planetary positions:', error.message);
//     throw error;
//   }
// }

// async function getAspectInterpretation(transitPlanet, natalPlanet, aspect) {
//   try {
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${OPENAI_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o-mini', // Cost-effective model
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an expert astrologer providing insightful, personalized transit interpretations. Keep responses concise (2-3 sentences), practical, and empowering.'
//           },
//           {
//             role: 'user',
//             content: `Provide an interpretation for: Transit ${transitPlanet} ${aspect} natal ${natalPlanet}. Focus on practical guidance and what this means for daily life.`
//           }
//         ],
//         max_tokens: 150,
//         temperature: 0.7
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`OpenAI API error: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.choices[0].message.content.trim();
    
//   } catch (error) {
//     console.error('Error fetching interpretation:', error);
    
//     // Fallback to static interpretations
//     return getFallbackInterpretation(transitPlanet, natalPlanet, aspect);
//   }
// }

// function getFallbackInterpretation(transitPlanet, natalPlanet, aspect) {
//   const interpretations = {
//     // ☀️ SUN
//     'Sun Conjunction': 'Vitality and self-expression are amplified. A powerful time for new beginnings.',
//     'Sun Trine': 'Harmonious energy flow. Things come easily and naturally today.',
//     'Sun Sextile': 'Opportunities for growth and positive connections arise. Take initiative.',
//     'Sun Square': 'Challenges test your willpower. Push through resistance with confidence.',
//     'Sun Opposition': 'Awareness through contrast. Balance opposing forces in your life.',
  
//     // 🌙 MOON
//     'Moon Conjunction': 'Emotional intensity and heightened intuition. Trust your feelings.',
//     'Moon Trine': 'Emotional harmony and comfort. A nurturing day for relationships.',
//     'Moon Sextile': 'Emotional clarity and social ease. Express your feelings openly.',
//     'Moon Square': 'Emotional tension or restlessness. Take time to process inner needs.',
//     'Moon Opposition': 'Emotional awareness through others. Seek emotional balance.',
  
//     // ☿ MERCURY
//     'Mercury Conjunction': 'Mental clarity and communication focus. Share your ideas confidently.',
//     'Mercury Trine': 'Easy communication and clear thinking. Great for meaningful conversations.',
//     'Mercury Sextile': 'Positive exchanges and good news. Network and connect.',
//     'Mercury Square': 'Mental stress or miscommunication possible. Double-check details.',
//     'Mercury Opposition': 'Conflicting viewpoints arise. Listen as much as you speak.',
  
//     // ♀ VENUS
//     'Venus Conjunction': 'Love, beauty, and pleasure are emphasized. Enjoy life’s sweetness.',
//     'Venus Trine': 'Romantic harmony and social grace. A fortunate day for relationships.',
//     'Venus Sextile': 'Pleasant surprises and social opportunities. Say yes to invitations.',
//     'Venus Square': 'Relationship tension or financial strain. Avoid impulsive decisions.',
//     'Venus Opposition': 'Relationship awareness grows through contrast. Find compromise and balance.',
  
//     // ♂ MARS
//     'Mars Conjunction': 'High energy and assertiveness. Take bold action but avoid aggression.',
//     'Mars Trine': 'Courageous action flows naturally. You have the strength to succeed.',
//     'Mars Sextile': 'Motivated and productive energy. A great time to start new projects.',
//     'Mars Square': 'Frustration or conflict may arise. Channel energy constructively.',
//     'Mars Opposition': 'Power struggles possible. Choose your battles wisely.',
  
//     // ♃ JUPITER
//     'Jupiter Conjunction': 'Expansion and opportunity. Think big but act with wisdom.',
//     'Jupiter Trine': 'Luck and growth come easily. Your optimism attracts good fortune.',
//     'Jupiter Sextile': 'Positive developments and learning opportunities. Stay open to growth.',
//     'Jupiter Square': 'Overconfidence or excess possible. Keep expectations realistic.',
//     'Jupiter Opposition': 'Balance optimism with realism. Avoid overextending yourself.',
  
//     // ♄ SATURN
//     'Saturn Conjunction': 'Reality checks and responsibility. Build strong foundations.',
//     'Saturn Trine': 'Discipline pays off. Hard work brings lasting results.',
//     'Saturn Sextile': 'Structured progress and steady growth. Stay consistent.',
//     'Saturn Square': 'Obstacles test patience and endurance. Persevere with discipline.',
//     'Saturn Opposition': 'External pressure increases. Reorganize priorities and boundaries.',
  
//     // ♅ URANUS
//     'Uranus Conjunction': 'Revolutionary change and awakening. Embrace the unexpected.',
//     'Uranus Trine': 'Innovation flows smoothly. Break free from routine.',
//     'Uranus Sextile': 'Creative breakthroughs and liberating opportunities. Try something new.',
//     'Uranus Square': 'Sudden disruptions or surprises. Stay flexible and adaptable.',
//     'Uranus Opposition': 'Freedom versus responsibility. Balance independence with commitment.',
  
//     // ♆ NEPTUNE
//     'Neptune Conjunction': 'Spiritual awakening and dissolving boundaries. Trust your intuition.',
//     'Neptune Trine': 'Creative inspiration and heightened intuition. Dream big with purpose.',
//     'Neptune Sextile': 'Compassion and artistic flow. Express imagination freely.',
//     'Neptune Square': 'Confusion or illusion possible. Seek clarity and avoid escapism.',
//     'Neptune Opposition': 'Fantasy versus reality. Ground dreams in practical action.',
  
//     // ♇ PLUTO
//     'Pluto Conjunction': 'Deep transformation and rebirth. Let go of what no longer serves you.',
//     'Pluto Trine': 'Powerful regeneration and empowerment. Positive change unfolds smoothly.',
//     'Pluto Sextile': 'Opportunities for deep healing and transformation arise. Embrace growth.',
//     'Pluto Square': 'Intense pressure sparks evolution. Face your shadows courageously.',
//     'Pluto Opposition': 'Power dynamics surface. Transformation comes through confrontation.',
  
//     // ⚷ CHIRON
//     'Chiron Conjunction': 'Healing comes through awareness. Pain becomes wisdom.',
//     'Chiron Trine': 'Gentle healing and empathy. Share your journey to inspire others.',
//     'Chiron Sextile': 'Healing opportunities appear. Be open to emotional growth.',
//     'Chiron Square': 'Old wounds resurface for healing. Face pain with compassion.',
//     'Chiron Opposition': 'Healing through relationship mirrors. Recognize yourself in others.',
  
//     // ☊ NORTH NODE
//     'North Node Conjunction': 'Destiny calls. Move toward your soul’s purpose.',
//     'North Node Trine': 'You’re aligned with your life path. Doors open naturally.',
//     'North Node Sextile': 'Opportunities for growth align with your purpose. Take steady steps.',
//     'North Node Square': 'Growing pains on your evolutionary path. Choose growth over comfort.',
//     'North Node Opposition': 'Release the past to embrace your future. Let go gracefully.'
//   };
  
  
//   const specificInterpretations = {
//     // ☀️ SUN
//     'Jupiter Conjunction Sun': 'A period of confidence and success begins. Your optimism shines brightly.',
//     'Saturn Conjunction Sun': 'A time of responsibility and maturity. Define your goals clearly.',
//     'Uranus Conjunction Sun': 'Radical self-reinvention. Break free from limiting patterns.',
//     'Neptune Conjunction Sun': 'Spiritual identity shift. Your ego dissolves into higher purpose.',
//     'Pluto Conjunction Sun': 'Profound transformation of identity. You emerge renewed and empowered.',
  
//     // 🌙 MOON
//     'Jupiter Conjunction Moon': 'Emotional expansion and family blessings. Joy grows within your home life.',
//     'Saturn Conjunction Moon': 'Emotional maturity develops. Time to set healthy boundaries.',
//     'Uranus Conjunction Moon': 'Emotional liberation and breakthrough. Expect surprising shifts.',
//     'Neptune Conjunction Moon': 'Heightened sensitivity and empathy. Protect emotional boundaries.',
//     'Pluto Conjunction Moon': 'Emotional catharsis and deep healing. Inner transformation unfolds.',
  
//     // ☿ MERCURY
//     'Jupiter Conjunction Mercury': 'Expanded thinking and communication success. Speak with confidence.',
//     'Saturn Conjunction Mercury': 'Serious study and disciplined thought. Master complex subjects.',
//     'Uranus Conjunction Mercury': 'Sudden insights and innovative ideas. Your mind awakens to new truths.',
//     'Neptune Conjunction Mercury': 'Inspired yet dreamy thinking. Clarify facts before acting.',
//     'Pluto Conjunction Mercury': 'Intense focus and transformative communication. Uncover hidden knowledge.',
  
//     // ♀ VENUS
//     'Jupiter Conjunction Venus': 'Love and abundance expand. Relationships and finances thrive.',
//     'Saturn Conjunction Venus': 'Relationship reality check. Define values and commitment.',
//     'Uranus Conjunction Venus': 'Unexpected love or social changes. Embrace freedom in connections.',
//     'Neptune Conjunction Venus': 'Idealized or spiritual love. Stay grounded in reality.',
//     'Pluto Conjunction Venus': 'Intense, transformative love. Deep emotional and financial shifts.',
  
//     // ♂ MARS
//     'Jupiter Conjunction Mars': 'Tremendous drive and courage. Take bold steps toward your ambitions.',
//     'Saturn Conjunction Mars': 'Disciplined energy and endurance. Patience brings mastery.',
//     'Uranus Conjunction Mars': 'Explosive energy and sudden impulses. Direct power wisely.',
//     'Neptune Conjunction Mars': 'Scattered motivation or confusion. Focus your intentions clearly.',
//     'Pluto Conjunction Mars': 'Immense power and will. Channel determination ethically.',
  
//     // ♃ JUPITER
//     'Saturn Conjunction Jupiter': 'Practical optimism. Balance vision with discipline.',
//     'Uranus Conjunction Jupiter': 'Sudden breakthroughs and liberation. Lucky opportunities arise.',
//     'Neptune Conjunction Jupiter': 'Spiritual expansion and idealism. Keep faith grounded.',
//     'Pluto Conjunction Jupiter': 'Transformative success and deep empowerment. Prosper through change.',
  
//     // ♄ SATURN
//     'Uranus Conjunction Saturn': 'Breaking free from limitations. Restructure for greater freedom.',
//     'Neptune Conjunction Saturn': 'Boundaries dissolve. Learn to balance form with flow.',
//     'Pluto Conjunction Saturn': 'Profound rebuilding of structures. Renew foundations with strength.',
  
//     // ♅ URANUS
//     'Neptune Conjunction Uranus': 'Spiritual and technological awakening. Revolutionary creativity.',
//     'Pluto Conjunction Uranus': 'Generational upheaval and innovation. Deep social transformation.',
  
//     // ♆ NEPTUNE
//     'Pluto Conjunction Neptune': 'Spiritual and collective transformation. The unseen becomes visible.'
//   };
  
 
//   const specificKey = `${transitPlanet} ${aspect} ${natalPlanet}`;
//   if (specificInterpretations[specificKey]) {
//     return specificInterpretations[specificKey];
//   }

 
//   const key = `${transitPlanet} ${aspect}`;
//   const interpretation = interpretations[key];

//   if (interpretation) {
//     return `${interpretation} (affecting your natal ${natalPlanet})`;
//   }

//   return `${transitPlanet} ${aspect} your natal ${natalPlanet} - ${getAspectNature(aspect)} energy.`;
// }


// function getAspect(transitDegree, natalDegree) {
//   let diff = Math.abs(transitDegree - natalDegree);
//   if (diff > 180) diff = 360 - diff;

//   console.log(`      📐 Aspect calc: |${transitDegree.toFixed(2)}° - ${natalDegree.toFixed(2)}°| = ${diff.toFixed(2)}°`);

//   const aspects = [
//     { name: 'Conjunction', angle: 0, orb: 8 },
//     { name: 'Sextile', angle: 60, orb: 6 },
//     { name: 'Square', angle: 90, orb: 7 },
//     { name: 'Trine', angle: 120, orb: 8 },
//     { name: 'Opposition', angle: 180, orb: 8 },
//   ];

//   for (const aspect of aspects) {
//     const orb = Math.abs(diff - aspect.angle);
//     if (orb <= aspect.orb) {
//       console.log(`      ✨ Match: ${aspect.name} (orb: ${orb.toFixed(2)}°, threshold: ${aspect.orb}°)`);
//       return { name: aspect.name, orb, exact: orb < 1 };
//     }
//   }

//   console.log(`      ✗ No aspect match`);
//   return null;
// }

// async function getBirthChartPositions(birthDate, birthTime = null, birthTimezone = null) {
//   try {
//     let birthDateTime = new Date(birthDate);
    
//     if (birthTime) {
//       const [hours, minutes, seconds] = birthTime.split(':').map(Number);
//       birthDateTime.setHours(hours, minutes, seconds || 0, 0);
//       console.log(`🎂 Using provided birth time: ${birthTime}`);
//     } else {
//       console.log(`🎂 Using birth date object time`);
//     }
    
//     console.log(`🎂 Birth DateTime:`, birthDateTime);
//     console.log(`🕐 Formatted for API: ${formatDate(birthDateTime)} ${formatTime(birthDateTime)}`);

//     const positions = await getAPIPlanetaryPositions(birthDateTime);
//     return positions;
//   } catch (error) {
//     console.error('Error getting birth chart positions:', error.message);
//     throw error;
//   }
// }

// function compareTransitsWithNatal(dailyTransits, natalChart) {
//   const transits = [];
//   const validPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
//   console.log(`\n🔍 Comparing transits with natal chart...`);
//   console.log(`   Transit planets: ${Object.keys(dailyTransits).join(', ')}`);
//   console.log(`   Natal planets: ${Object.keys(natalChart).join(', ')}`);

//   for (const [transitKey, transitPlanet] of Object.entries(dailyTransits)) {
//     for (const [natalKey, natalPlanet] of Object.entries(natalChart)) {
//       if (!validPlanets.includes(transitKey.toLowerCase()) || 
//           !validPlanets.includes(natalKey.toLowerCase())) {
//         continue;
//       }
      
//       if (transitKey === natalKey) continue;
      
//       const transitLongitude = raDecToEclipticLongitude(
//         transitPlanet.position.equatorial.rightAscension,
//         transitPlanet.position.equatorial.declination
//       );
      
//       const natalLongitude = raDecToEclipticLongitude(
//         natalPlanet.position.equatorial.rightAscension,
//         natalPlanet.position.equatorial.declination
//       );

//       console.log(`   Comparing ${transitKey} (${transitLongitude.toFixed(2)}°) vs ${natalKey} (${natalLongitude.toFixed(2)}°)`);

//       const aspect = getAspect(transitLongitude, natalLongitude);

//       if (aspect && isValidAspect(aspect, transitKey, natalKey)) {
//         console.log(`      ✨ Found: ${aspect.name} (orb: ${aspect.orb.toFixed(2)}°)`);
//         transits.push({
//           transitPlanet: transitPlanet.name,
//           natalPlanet: natalPlanet.name,
//           aspect: aspect.name,
//           orb: aspect.orb.toFixed(2),
//           exact: aspect.exact,
//           intensity: getIntensityLevel(aspect.orb)
//         });
//       }
//     }
//   }
  
//   console.log(`   📊 Total aspects found: ${transits.length}`);
//   return transits;
// }

// function isValidAspect(aspect, transitPlanet, natalPlanet) {
//   if (aspect.orb > 10) return false;
//   return true;
// }

// function getIntensityLevel(orb) {
//   if (orb < 0.3) return 'Exact';
//   if (orb < 2.0) return 'Very Strong';
//   if (orb < 4.0) return 'Strong';
//   if (orb < 6.0) return 'Moderate';
//   return 'Weak';
// }

// function getAspectNature(aspectName) {
//   const harmonious = ['Trine', 'Sextile', 'Conjunction'];
//   const challenging = ['Square', 'Opposition'];
  
//   if (harmonious.includes(aspectName)) return 'Harmonious';
//   if (challenging.includes(aspectName)) return 'Challenging';
//   return 'Neutral';
// }

// function raDecToEclipticLongitude(raHours, declination, planetName = '') {
//   try {
//     console.log(`   🌍 Converting ${planetName}: RA=${raHours.toFixed(4)} hours, Dec=${declination.toFixed(4)}°`);
    
//     const raDegrees = raHours * 15;
//     const epsilon = 23.43928;
    
//     console.log(`      RA in degrees: ${raDegrees.toFixed(2)}°`);
    
//     const raRad = raDegrees * Math.PI / 180;
//     const decRad = declination * Math.PI / 180;
//     const epsRad = epsilon * Math.PI / 180;
    
//     const sinDec = Math.sin(decRad);
//     const cosDec = Math.cos(decRad);
//     const sinRa = Math.sin(raRad);
//     const cosRa = Math.cos(raRad);
//     const sinEps = Math.sin(epsRad);
//     const cosEps = Math.cos(epsRad);
    
//     const numerator = sinRa * cosEps + Math.tan(decRad) * sinEps;
//     const denominator = cosRa;
    
//     let lambdaRad = Math.atan2(numerator, denominator);
//     let eclipticLong = lambdaRad * 180 / Math.PI;
    
//     if (eclipticLong < 0) eclipticLong += 360;
    
//     console.log(`      🌟 Ecliptic Longitude: ${eclipticLong.toFixed(2)}°`);
//     return eclipticLong;
//   } catch (error) {
//     console.error('Error in ecliptic conversion:', error);
//     return 0;
//   }
// }

// function generateDayByDayGuidance(weekData) {
//   const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   let guidance = '';

//   weekData.forEach((day, index) => {
//     guidance += `**${dayNames[index]} - ${day.date.toLocaleDateString()}**\n\n`;

//     if (day.transits.length === 0) {
//       guidance += `No significant transits today. A day for integration and reflection.\n\n`;
//     } else {
//       const criticalTransits = day.transits.filter(t => t.exact || t.intensity === 'Exact');
//       const strongTransits = day.transits.filter(t => t.intensity === 'Very Strong');
//       const moderateTransits = day.transits.filter(t => t.intensity === 'Strong');

//       if (criticalTransits.length > 0) {
//         guidance += `🔥 **EXACT ASPECTS - Major Energy:**\n`;
//         criticalTransits.forEach(t => {
//           guidance += `• ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°)\n`;
//           guidance += `  Energy: High impact. This is a powerful day for action related to ${t.natalPlanet} themes.\n`;
//         });
//         guidance += `\n`;
//       }

//       if (strongTransits.length > 0) {
//         guidance += `⚡ **STRONG INFLUENCES:**\n`;
//         strongTransits.forEach(t => {
//           guidance += `• ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°)\n`;
//         });
//         guidance += `\n`;
//       }

//       if (moderateTransits.length > 0) {
//         guidance += `💫 **SUPPORTING ENERGIES:**\n`;
//         moderateTransits.forEach(t => {
//           guidance += `• ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°)\n`;
//         });
//         guidance += `\n`;
//       }
//     }

//     guidance += `---\n\n`;
//   });

//   return guidance;
// }

// const getMembers = async () => {
//   try {
//     const subscribers = await subscription
//       .find({
//         status: { $in: ['active', 'trialing'] }
//       })
//       .populate('userId');

//     if (!subscribers || subscribers.length === 0) {
//       console.log('No active subscribers found');
//       return [];
//     }

//     const members = subscribers
//       .filter(sub => sub.userId && sub.userId.email && sub.userId.birth_date)
//       .map(sub => {
//         const user = sub.userId;

//         return {
//           id: user._id,
//           email: user.email,
//           name: user.name || 'Member',
//           subscriptionStatus: sub.status,
//           birth_date: user.birth_date,
//           birth_time: user.birth_time,
//           birth_timezone: user.birth_timezone
//         };
//       });

//     console.log(`Found ${members.length} active members with birth dates`);

//     return members;
//   } catch (error) {
//     console.error('Error fetching members:', error);
//     return [];
//   }
// };


// function getZodiacSign(longitude) {
//   const signs = [
//     'Aries ♈', 'Taurus ♉', 'Gemini ♊', 'Cancer ♋', 
//     'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Scorpio ♏', 
//     'Sagittarius ♐', 'Capricorn ♑', 'Aquarius ♒', 'Pisces ♓'
//   ];
//   const signIndex = Math.floor(longitude / 30);
//   return signs[signIndex];
// }

// function generateNatalChartSection(natalChart, member) {
//     const chartSVG = generateNatalChartSVG(natalChart);
    
//     const planetPositions = Object.entries(natalChart)
//       .filter(([planetId, data]) => data.position)
//       .map(([planetId, data]) => {
//         const longitude = raDecToEclipticLongitude(
//           data.position.equatorial.rightAscension,
//           data.position.equatorial.declination,
//           data.name
//         );
        
//         const zodiacSign = getZodiacSign(longitude);
//         const degreeInSign = (longitude % 30).toFixed(2);
        
//         return `
//           <tr>
//             <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; font-weight: bold;">${getPlanetSymbol(data.name)} ${data.name}</td>
//             <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${zodiacSign}</td>
//             <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${degreeInSign}°</td>
//             <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${data.position.constellation}</td>
//           </tr>
//         `;
//       }).join('');
  
//     return `
//       <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #667eea;">
//         <h3 style="color: #667eea; margin-top: 0; text-align: center;">🌟 Your Natal Chart</h3>
      
//         <!-- Natal Chart Wheel -->
//         <div style="text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 8px;">
//           ${chartSVG}
//         </div>
        
//         <!-- Planet Positions Table -->
//         <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden;">
//           <thead>
//             <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
//               <th style="padding: 12px; text-align: left;">Planet</th>
//               <th style="padding: 12px; text-align: left;">Sign</th>
//               <th style="padding: 12px; text-align: left;">Degree</th>
//               <th style="padding: 12px; text-align: left;">Constellation</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${planetPositions}
//           </tbody>
//         </table>
//       </div>
//     `;
//   }

// async function generateWeeklyTransitReport(member) {
//   try {
//     console.log(`\n🌟 Generating weekly report for ${member.name}`);

//     console.log(`📌 Fetching natal chart for birth date: ${member.birth_date}`);
//     console.log(`📌 Birth time: ${member.birth_time || 'NOT PROVIDED'}`);
//     console.log(`📌 Birth timezone: ${member.birth_timezone || 'NOT PROVIDED'}`);
    
//     const natalChart = await getBirthChartPositions(
//       member.birth_date, 
//       member.birth_time,
//       member.birth_timezone
//     );
//     console.log(`✅ Got natal chart for ${member.name}`);
//     console.log(`📊 Natal Chart Planets:`, Object.keys(natalChart));
//     natalChart && Object.entries(natalChart).forEach(([key, planet]) => {
//       console.log(`   🪐 ${key}: RA=${planet.position?.equatorial?.rightAscension}, Dec=${planet.position?.equatorial?.declination}`);
//     });

//     const weekDates = getWeekDates();
//     const weekStart = weekDates[0];
//     const weekEnd = weekDates[6];

//     console.log(`\n📅 Fetching transits for entire week (${formatDate(weekStart)} to ${formatDate(weekEnd)})...`);
//     const weeklyPositions = await getWeeklyPlanetaryPositions(weekStart, weekEnd);
//     console.log(`✅ Weekly positions received`);
//     console.log(`📊 Dates available in response:`, Object.keys(weeklyPositions).sort());

//     const weekData = [];

//     for (const date of weekDates) {
//       const dateKey = formatDate(date);
      
//       const matchingDateKey = Object.keys(weeklyPositions).find(key => 
//         key.startsWith(dateKey)
//       );
      
//       const dailyTransits = weeklyPositions[matchingDateKey] || {};

//       console.log(`\n📆 Processing ${dateKey}:`);
//       console.log(`   🔗 Matching API key: ${matchingDateKey || 'NOT FOUND'}`);
//       console.log(`   📍 Daily planets available:`, Object.keys(dailyTransits));
      
//       if (Object.keys(dailyTransits).length === 0) {
//         console.warn(`   ⚠️  No planet data for ${dateKey}`);
//         console.log(`   📌 Available keys in response:`, Object.keys(weeklyPositions));
//       } else {
//         dailyTransits && Object.entries(dailyTransits).forEach(([key, planet]) => {
//           console.log(`      🪐 ${key}: RA=${planet.position?.equatorial?.rightAscension}, Dec=${planet.position?.equatorial?.declination}`);
//         });
//       }

//       const dayTransits = compareTransitsWithNatal(dailyTransits, natalChart);
//       console.log(`   ✨ Transits found: ${dayTransits.length}`);
//       dayTransits.forEach(t => {
//         console.log(`      → ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°, ${t.intensity})`);
//       });

//       weekData.push({
//         date,
//         dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
//         transits: dayTransits,
//         planets: dailyTransits
//       });
//     }

//     const guidance = generateDayByDayGuidance(weekData);

//     console.log(`\n📋 Report Summary:`);
//     console.log(`   Total transits for week: ${weekData.reduce((sum, day) => sum + day.transits.length, 0)}`);

//     return {
//       memberId: member.id,
//       memberName: member.name,
//       memberEmail: member.email,
//       birth_date: member.birth_date,
//       weekStart: formatDate(weekStart),
//       weekEnd: formatDate(weekEnd),
//       week: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
//       systemUsed: 'Weekly Transit Report with Astronomy API',
//       weekData: weekData,
//       guidance: guidance,
//       natalChart: natalChart,
//       generatedAt: new Date().toISOString()
//     };
//   } catch (error) {
//     console.error(`Error generating report for ${member.name}:`, error.message);
//     console.error(error.stack);
//     return null;
//   }
// }

// async function sendDynamicWeeklyReport(member, report) {
//   const chartSVG = generateNatalChartSVG(report.natalChart);

//   const tempDir = path.join(__dirname, '..', 'temp');
//   await fs.mkdir(tempDir, { recursive: true });
//   const imagePath = path.join(tempDir, `natal-chart-${member.id}-${Date.now()}.png`);
//   await convertSVGtoPNG(chartSVG, imagePath);
//   const uploadResult = await cloudinaryUploadImage(imagePath);
//   if (!uploadResult || !uploadResult.url) {
//     throw new Error('Failed to upload image to Cloudinary');
//   }
  
//   const imageUrl = uploadResult.url;
//   const natalChartSection = `
//   <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #667eea;">
//     <h3 style="color: #667eea; margin-top: 0; text-align: center;">🌟 Your Natal Chart Wheel</h3>
   
//     <!-- Natal Chart Wheel -->
//     <div style="text-align: center; margin: 20px 0;">
//       <img src="${imageUrl}" alt="Your Natal Chart Wheel" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>
//     </div>
//   </div>
// `;
  
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER || 'lemightyeagle@gmail.com',
//         pass: process.env.EMAIL_PASS || 'uhrkgdguezzjduul'
//     }
//   });



//   const dailyBreakdownHtml = report.weekData.map((day, index) => {
//     const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
//     const transitRows = day.transits.length > 0
//       ? day.transits.map(t => {
//           const interpretation = getFallbackInterpretation(t.transitPlanet, t.natalPlanet, t.aspect); 
//       return `
//         <tr style="background: ${t.exact ? '#ffe6e6' : t.intensity === 'Very Strong' ? '#fff3cd' : '#f8f9fa'};">
//           <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;"><strong>${t.transitPlanet}</strong></td>
//           <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${t.aspect}</td>
//           <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;"><strong>${t.natalPlanet}</strong></td>
//           <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; color: ${t.exact ? '#e74c3c' : t.intensity === 'Very Strong' ? '#f39c12' : '#27ae60'}; font-weight: bold;">${t.intensity}</td>
//           <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${t.orb}°</td>
//         </tr>
//         <tr style="background: ${t.exact ? '#ffe6e6' : t.intensity === 'Very Strong' ? '#fff3cd' : '#f8f9fa'};">
//           <td colspan="5" style="padding: 8px 15px 15px 15px; border-bottom: 2px solid #ecf0f1; color: #555; font-style: italic; font-size: 13px;">
//             💫 ${interpretation}
//           </td>
//         </tr>
//       `;
//     }).join('')
//   : `<tr><td colspan="5" style="padding: 15px; text-align: center; color: #7f8c8d;">No significant transits</td></tr>`;
//     return `
//       <div style="margin: 20px 0; border: 2px solid #667eea; border-radius: 8px; overflow: hidden;">
//         <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; font-size: 18px; font-weight: bold;">
//           ${dayNames[index]} - ${day.date.toLocaleDateString()}
//         </div>
//         <table style="width: 100%; border-collapse: collapse; background: white;">
//          <thead>
//  <thead>
//   <tr style="background: #f8f9fa;">
//     <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Transit Planet</th>
//     <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Aspect</th>
//     <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Natal Planet</th>
//     <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Strength</th>
//     <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Orb</th>
//   </tr>
// </thead>
// </thead>
//           <tbody>
//             ${transitRows}
//           </tbody>
//         </table>
//       </div>
//     `;
//   }).join('');


//   const emailContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <style>
//         body { 
//           font-family: 'Georgia', serif; 
//           line-height: 1.8; 
//           color: #2c3e50; 
//           margin: 0;
//           padding: 0;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//         }
//         .wrapper {
//           max-width: 900px;
//           margin: 30px auto;
//           padding: 20px;
//         }
//         .container {
//           background-color: white;
//           padding: 40px;
//           border-radius: 15px;
//           box-shadow: 0 10px 40px rgba(0,0,0,0.3);
//         }
//         .header {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           padding: 30px;
//           border-radius: 10px 10px 0 0;
//           margin: -40px -40px 30px -40px;
//           text-align: center;
//         }
//         h1 { 
//           margin: 0;
//           font-size: 28px;
//           font-weight: normal;
//         }
//         h2 {
//           color: #667eea;
//           margin-top: 35px;
//           font-size: 22px;
//           border-bottom: 2px solid #667eea;
//           padding-bottom: 10px;
//         }
//         .footer {
//           text-align: center;
//           margin-top: 30px;
//           padding-top: 20px;
//           border-top: 2px solid #ecf0f1;
//           color: #7f8c8d;
//           font-size: 13px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="wrapper">
//         <div class="container">
//           <div class="header">
//             <h1>🌌 Your Weekly Transit Report</h1>
//             <p style="margin: 15px 0 0 0; opacity: 0.9;">Personal Planetary Forecast - ${report.week}</p>
//           </div>

//           ${natalChartSection}

         
//           <h2>📅 Daily Transit Breakdown</h2>
//           <p style="color: #7f8c8d; margin: 15px 0;">This week's planetary transits interacting with your natal chart:</p>
          
//           ${dailyBreakdownHtml}

//           <h2>📋 Weekly Summary</h2>
//           <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-left: 5px solid #667eea; margin: 25px 0; border-radius: 8px; white-space: pre-line;">
// ${report.guidance}
//           </div>

//           <div class="footer">
//             <p><strong>System:</strong> ${report.systemUsed}</p>
          
//             <p>✨ May the stars illuminate your path ✨</p>
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//   try {
//     await transporter.sendMail({
//       from: `"True Sky Astrology" <lemightyeagle@gmail.com>`,
//       to: member.email,
//       subject: `🌙 ${member.name}, Your Weekly Transit Report - ${report.week}`,
//       html: emailContent
//     });

//     await fs.unlink(imagePath);
//     console.log(`✅ Report sent to ${member.email}`);
//     return true;
//   } catch (error) {
//     console.error(`Error sending email to ${member.email}:`, error.message);
//     return false;
//   }
// }

// async function processWeeklyIntegration() {
//   console.log('\n🌟 Starting Weekly Transit Report Generation...');
//   console.log(`📅 Date: ${new Date().toISOString()}\n`);

//   const members = await getMembers();

//   if (members.length === 0) {
//     console.log('❌ No active members with birth dates found');
//     return;
//   }

//   let successCount = 0;
//   let failureCount = 0;

//   for (const member of members) {
//     try {
//       console.log(`\n📧 Processing: ${member.name} (${member.email})`);

//       const report = await generateWeeklyTransitReport(member);

//       if (report) {
//         const sendSuccess = await sendDynamicWeeklyReport(member, report);

//         if (sendSuccess) {
//           successCount++;
//           console.log(`✅ Success for ${member.name}`);
//         } else {
//           failureCount++;
//           console.log(`❌ Failed to send email for ${member.name}`);
//         }
//       } else {
//         failureCount++;
//         console.log(`❌ Failed to generate report for ${member.name}`);
//       }
//     } catch (error) {
//       console.error(`❌ Error processing ${member.name}:`, error.message);
//       failureCount++;
//     }
//   }

//   console.log(`\n📊 Weekly Report Summary:`);
//   console.log(`✅ Successful: ${successCount}`);
//   console.log(`❌ Failed: ${failureCount}`);
//   console.log(`📧 Total Processed: ${members.length}\n`);
// }

// async function manualTrigger() {
//   console.log('🔧 Manual trigger initiated...');
//   await processWeeklyIntegration();
// }

// const runCron = () => {
//   const job = cron.schedule('0 5 * * 0', async () => {
//     console.log('⏰ Cron triggered: Sunday 5 AM');
//     await processWeeklyIntegration();
//   }, {
//     timezone: process.env.TIMEZONE || 'America/New_York'
//   });

//   console.log('✅ Cron job scheduled: Every Sunday at 5 AM');
//   return job;
// };


// function generateNatalChartSVG(natalChart) {
//   const planets = [];
  
//   console.log("🌌 Generating Natal Chart Wheel - Tropical Zodiac System");
  
//   // Calculate tropical positions from API data
//   Object.entries(natalChart).forEach(([planetId, data]) => {
//       if (!data.position || !data.position.equatorial) {
//           console.warn(`⚠️  Missing position data for ${planetId}`);
//           return;
//       }

//       // Convert RA/Dec to ecliptic longitude
//       const raHours = data.position.equatorial.rightAscension;
//       const decDegrees = data.position.equatorial.declination;
      
//       // Calculate tropical longitude from RA/Dec
//       const tropicalLongitude = calculateTropicalLongitude(raHours, decDegrees);
      
//       const zodiacInfo = getZodiacSignFromLongitude(tropicalLongitude);
      
//       planets.push({
//           name: data.name,
//           longitude: tropicalLongitude,
//           symbol: getPlanetSymbol(data.name),
//           planetId: planetId,
//           zodiacSign: zodiacInfo.name,
//           zodiacSymbol: zodiacInfo.symbol,
//           degreeInSign: zodiacInfo.degree.toFixed(2)
//       });
      
//       console.log(`✅ ${data.name}: ${zodiacInfo.name} ${zodiacInfo.symbol} ${zodiacInfo.degree.toFixed(2)}° (Tropical Longitude: ${tropicalLongitude.toFixed(2)}°)`);
//   });

//   if (planets.length === 0) {
//       console.error('❌ No planets to display in chart');
//       return '<svg width="700" height="700"><text x="350" y="350" text-anchor="middle">No chart data available</text></svg>';
//   }

//   const size = 700;
//   const center = size / 2;
//   const outerRadius = 320;
//   const middleRadius = 260;
//   const innerRadius = 200;
//   const planetRadius = 140;

//   // Zodiac signs with colors
//   const zodiacSigns = [
//       { name: 'Aries', symbol: '♈', color: '#e74c3c', start: 0 },
//       { name: 'Taurus', symbol: '♉', color: '#27ae60', start: 30 },
//       { name: 'Gemini', symbol: '♊', color: '#f39c12', start: 60 },
//       { name: 'Cancer', symbol: '♋', color: '#9b59b6', start: 90 },
//       { name: 'Leo', symbol: '♌', color: '#e67e22', start: 120 },
//       { name: 'Virgo', symbol: '♍', color: '#16a085', start: 150 },
//       { name: 'Libra', symbol: '♎', color: '#3498db', start: 180 },
//       { name: 'Scorpio', symbol: '♏', color: '#c0392b', start: 210 },
//       { name: 'Sagittarius', symbol: '♐', color: '#8e44ad', start: 240 },
//       { name: 'Capricorn', symbol: '♑', color: '#2c3e50', start: 270 },
//       { name: 'Aquarius', symbol: '♒', color: '#1abc9c', start: 300 },
//       { name: 'Pisces', symbol: '♓', color: '#2980b9', start: 330 }
//   ];

//   // Draw zodiac wheel sections (outer ring)
//   let zodiacWheel = '';
//   for (let i = 0; i < 12; i++) {
//       const startAngle = (zodiacSigns[i].start - 90) * Math.PI / 180;
//       const endAngle = (zodiacSigns[i].start + 30 - 90) * Math.PI / 180;
      
//       const x1 = center + outerRadius * Math.cos(startAngle);
//       const y1 = center + outerRadius * Math.sin(startAngle);
//       const x2 = center + outerRadius * Math.cos(endAngle);
//       const y2 = center + outerRadius * Math.sin(endAngle);
//       const x3 = center + middleRadius * Math.cos(endAngle);
//       const y3 = center + middleRadius * Math.sin(endAngle);
//       const x4 = center + middleRadius * Math.cos(startAngle);
//       const y4 = center + middleRadius * Math.sin(startAngle);

//       zodiacWheel += `
//           <path d="M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${middleRadius} ${middleRadius} 0 0 0 ${x4} ${y4} Z" 
//                 fill="${zodiacSigns[i].color}" 
//                 fill-opacity="0.2" 
//                 stroke="${zodiacSigns[i].color}" 
//                 stroke-width="2"/>
//       `;

//       // Zodiac symbol
//       const labelAngle = (zodiacSigns[i].start + 15 - 90) * Math.PI / 180;
//       const labelRadius = (outerRadius + middleRadius) / 2;
//       const labelX = center + labelRadius * Math.cos(labelAngle);
//       const labelY = center + labelRadius * Math.sin(labelAngle);

//       zodiacWheel += `
//           <text x="${labelX}" y="${labelY}" 
//                 text-anchor="middle" 
//                 dominant-baseline="middle" 
//                 font-size="28" 
//                 font-weight="bold" 
//                 fill="${zodiacSigns[i].color}">
//               ${zodiacSigns[i].symbol}
//           </text>
//       `;
//   }

//   // House divisions (12 houses - equal house system)
//   let houseDivisions = '';
//   for (let i = 0; i < 12; i++) {
//       const angle = (i * 30 - 90) * Math.PI / 180;
//       const x1 = center + middleRadius * Math.cos(angle);
//       const y1 = center + middleRadius * Math.sin(angle);
//       const x2 = center + innerRadius * Math.cos(angle);
//       const y2 = center + innerRadius * Math.sin(angle);
      
//       houseDivisions += `
//           <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
//                 stroke="rgba(138, 101, 255, 0.5)" 
//                 stroke-width="2"/>
//       `;

//       // House numbers
//       const houseAngle = (i * 30 + 15 - 90) * Math.PI / 180;
//       const houseRadius = (middleRadius + innerRadius) / 2;
//       const houseX = center + houseRadius * Math.cos(houseAngle);
//       const houseY = center + houseRadius * Math.sin(houseAngle);

//       houseDivisions += `
//           <text x="${houseX}" y="${houseY}" 
//                 text-anchor="middle" 
//                 dominant-baseline="middle" 
//                 font-size="16" 
//                 font-weight="bold" 
//                 fill="#ec4899">
//               ${i + 1}
//           </text>
//       `;
//   }

//   // Planet markers with collision detection
//   let planetMarkers = '';
//   const usedPositions = [];
  
//   planets.forEach((planet, index) => {
//       let adjustedRadius = planetRadius;
//       let positionFound = false;
      
//       // Try different radii to avoid overlaps
//       for (let radiusOffset = 0; radiusOffset < 60 && !positionFound; radiusOffset += 20) {
//           adjustedRadius = planetRadius + radiusOffset;
//           const angle = (planet.longitude - 90) * Math.PI / 180;
//           const x = center + adjustedRadius * Math.cos(angle);
//           const y = center + adjustedRadius * Math.sin(angle);
          
//           // Check if position is too close to others
//           const tooClose = usedPositions.some(pos => {
//               const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
//               return distance < 35;
//           });
          
//           if (!tooClose) {
//               positionFound = true;
//               usedPositions.push({ x, y });
              
//               const zodiacSign = zodiacSigns.find(sign => 
//                   planet.longitude >= sign.start && planet.longitude < sign.start + 30
//               ) || zodiacSigns[0];

//               planetMarkers += `
//                   <g class="planet-marker">
//                       <circle cx="${x}" cy="${y}" r="15" 
//                               fill="${zodiacSign.color}" 
//                               stroke="white" 
//                               stroke-width="3"/>
//                       <text x="${x}" y="${y}" 
//                             text-anchor="middle" 
//                             dominant-baseline="middle" 
//                             font-size="18" 
//                             fill="white" 
//                             font-weight="bold">
//                           ${planet.symbol}
//                       </text>
                      
//                       <text x="${x}" y="${y + 28}" 
//                             text-anchor="middle" 
//                             font-size="11" 
//                             fill="#2c3e50"
//                             font-weight="bold">
//                           ${planet.degreeInSign}°
//                       </text>
//                   </g>
//               `;
//           }
//       }
//   });

//   // Aspect lines
//   let aspectLines = '';
//   for (let i = 0; i < planets.length; i++) {
//       for (let j = i + 1; j < planets.length; j++) {
//           let diff = Math.abs(planets[i].longitude - planets[j].longitude);
//           if (diff > 180) diff = 360 - diff;

//           let aspectColor = null;
          
//           if (Math.abs(diff - 0) < 8) aspectColor = '#fbbf24'; // Conjunction
//           else if (Math.abs(diff - 60) < 6) aspectColor = '#3b82f6'; // Sextile
//           else if (Math.abs(diff - 90) < 7) aspectColor = '#f97316'; // Square
//           else if (Math.abs(diff - 120) < 8) aspectColor = '#10b981'; // Trine
//           else if (Math.abs(diff - 180) < 8) aspectColor = '#ef4444'; // Opposition

//           if (aspectColor) {
//               const angle1 = (planets[i].longitude - 90) * Math.PI / 180;
//               const angle2 = (planets[j].longitude - 90) * Math.PI / 180;
              
//               const lineRadius = planetRadius - 30;
//               const x1 = center + lineRadius * Math.cos(angle1);
//               const y1 = center + lineRadius * Math.sin(angle1);
//               const x2 = center + lineRadius * Math.cos(angle2);
//               const y2 = center + lineRadius * Math.sin(angle2);

//               aspectLines += `
//                   <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
//                         stroke="${aspectColor}" 
//                         stroke-width="1.5" 
//                         opacity="0.4"/>
//               `;
//           }
//       }
//   }

//   const svg = `
//       <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//               <radialGradient id="bgGradient">
//                   <stop offset="0%" stop-color="#1a1147" />
//                   <stop offset="100%" stop-color="#0a0e27" />
//               </radialGradient>
//           </defs>
          
//           <!-- Background -->
//           <circle cx="${center}" cy="${center}" r="${outerRadius + 20}" fill="url(#bgGradient)"/>
          
//           <!-- Outer ring -->
//           <circle cx="${center}" cy="${center}" r="${outerRadius}" 
//                   fill="none" 
//                   stroke="rgba(168, 139, 250, 0.4)" 
//                   stroke-width="3"/>
          
//           <!-- Zodiac wheel sections -->
//           ${zodiacWheel}
          
//           <!-- Middle ring -->
//           <circle cx="${center}" cy="${center}" r="${middleRadius}" 
//                   fill="none" 
//                   stroke="rgba(168, 139, 250, 0.3)" 
//                   stroke-width="2"/>
          
//           <!-- Inner ring -->
//           <circle cx="${center}" cy="${center}" r="${innerRadius}" 
//                   fill="rgba(138, 101, 255, 0.05)" 
//                   stroke="rgba(199, 181, 255, 0.5)" 
//                   stroke-width="2"/>
          
//           <!-- House divisions -->
//           ${houseDivisions}
          
//           <!-- Aspect lines -->
//           ${aspectLines}
          
//           <!-- Planet markers -->
//           ${planetMarkers}
          
//           <!-- Center circle -->
//           <circle cx="${center}" cy="${center}" r="60" 
//                   fill="rgba(138, 101, 255, 0.1)" 
//                   stroke="rgba(168, 139, 250, 0.6)" 
//                   stroke-width="2"/>
          
//           <!-- Center text -->
//           <text x="${center}" y="${center - 10}" 
//                 text-anchor="middle" 
//                 font-size="16" 
//                 font-weight="bold" 
//                 fill="#a78bfa">NATAL</text>
//           <text x="${center}" y="${center + 10}" 
//                 text-anchor="middle" 
//                 font-size="16" 
//                 font-weight="bold" 
//                 fill="#ec4899">CHART</text>
//       </svg>
//   `;

//   return svg;
// }

// // Add this new function to calculate tropical longitude from RA/Dec
// function calculateTropicalLongitude(raHours, decDegrees) {
//     // Convert RA (hours) to degrees
//     const raDegrees = raHours * 15;
    
//     // Obliquity of the ecliptic (Earth's axial tilt)
//     const epsilon = 23.43928; // degrees
    
//     // Convert to radians
//     const raRad = raDegrees * Math.PI / 180;
//     const decRad = decDegrees * Math.PI / 180;
//     const epsRad = epsilon * Math.PI / 180;
    
//     // Calculate ecliptic longitude using spherical astronomy formulas
//     const tanLambda = (Math.sin(raRad) * Math.cos(epsRad) + Math.tan(decRad) * Math.sin(epsRad)) / Math.cos(raRad);
//     let lambda = Math.atan(tanLambda) * 180 / Math.PI;
    
//     // Adjust quadrant based on RA
//     if (raDegrees >= 90 && raDegrees < 270) {
//         lambda += 180;
//     } else if (lambda < 0) {
//         lambda += 360;
//     }
    
//     // Normalize to 0-360
//     lambda = ((lambda % 360) + 360) % 360;
    
//     return lambda;
// }

// function getZodiacSignFromLongitude(longitude) {
//     const signs = [
//         { name: 'Aries', symbol: '♈', start: 0 },
//         { name: 'Taurus', symbol: '♉', start: 30 },
//         { name: 'Gemini', symbol: '♊', start: 60 },
//         { name: 'Cancer', symbol: '♋', start: 90 },
//         { name: 'Leo', symbol: '♌', start: 120 },
//         { name: 'Virgo', symbol: '♍', start: 150 },
//         { name: 'Libra', symbol: '♎', start: 180 },
//         { name: 'Scorpio', symbol: '♏', start: 210 },
//         { name: 'Sagittarius', symbol: '♐', start: 240 },
//         { name: 'Capricorn', symbol: '♑', start: 270 },
//         { name: 'Aquarius', symbol: '♒', start: 300 },
//         { name: 'Pisces', symbol: '♓', start: 330 }
//     ];
    
//     const normalizedLong = ((longitude % 360) + 360) % 360;
//     const signIndex = Math.floor(normalizedLong / 30);
//     const sign = signs[signIndex] || signs[0];
//     const degreeInSign = normalizedLong - sign.start;
    
//     return {
//         name: sign.name,
//         symbol: sign.symbol,
//         degree: degreeInSign
//     };
// }

// function getPlanetSymbol(planetName) {
//     const symbols = {
//         'Sun': '☉',
//         'Moon': '☽',
//         'Mercury': '☿',
//         'Venus': '♀',
//         'Mars': '♂',
//         'Jupiter': '♃',
//         'Saturn': '♄',
//         'Uranus': '♅',
//         'Neptune': '♆',
//         'Pluto': '♇'
//     };
//     return symbols[planetName] || '●';
// }

// function generateVerificationTable(planetData) {
//     let table = `
//         <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
//             <h3 style="color: #2c3e50; margin-bottom: 15px;">✅ Natal Chart Verification</h3>
//             <table style="width: 100%; border-collapse: collapse;">
//                 <thead>
//                     <tr style="background: #667eea; color: white;">
//                         <th style="padding: 10px; text-align: left;">Planet</th>
//                         <th style="padding: 10px; text-align: left;">Tropical Zodiac</th>
//                         <th style="padding: 10px; text-align: left;">Position</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//     `;
    
//     planetData.forEach(planet => {
//         table += `
//             <tr style="border-bottom: 1px solid #ddd;">
//                 <td style="padding: 10px;"><strong>${planet.symbol} ${planet.name}</strong></td>
//                 <td style="padding: 10px;">${planet.sign} ${getZodiacSymbol(planet.sign)}</td>
//                 <td style="padding: 10px;">${planet.degree}°</td>
//             </tr>
//         `;
//     });
    
//     table += `
//                 </tbody>
//             </table>
//             <p style="margin-top: 15px; color: #666; font-size: 14px;">
//                 <strong>Note:</strong> This chart uses <strong>Tropical Zodiac</strong> (Western astrology). 
//                 The constellations shown in astronomical data are different due to precession (~24° offset).
//             </p>
//         </div>
//     `;
    
//     return table;
// }

// function getZodiacSymbol(signName) {
//     const symbols = {
//         'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
//         'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
//         'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
//     };
//     return symbols[signName] || '';
// }
// function getPlanetSymbol(planetName) {
//     const symbols = {
//         'Sun': '☉',
//         'Moon': '☽',
//         'Mercury': '☿',
//         'Venus': '♀',
//         'Mars': '♂',
//         'Jupiter': '♃',
//         'Saturn': '♄',
//         'Uranus': '♅',
//         'Neptune': '♆',
//         'Pluto': '♇'
//     };
//     return symbols[planetName] || '●';
// }

// function getPlanetSymbol(planetName) {
//   const symbols = {
//     'Sun': '☉',
//     'Moon': '☽',
//     'Mercury': '☿',
//     'Venus': '♀',
//     'Mars': '♂',
//     'Jupiter': '♃',
//     'Saturn': '♄',
//     'Uranus': '♅',
//     'Neptune': '♆',
//     'Pluto': '♇'
//   };
//   return symbols[planetName] || '●';
// }


// function raDecToEclipticLongitude(ra, dec, planetName) {
 
//   const mockLongitudes = {
//     'Sun': 128.83,    
//     'Moon': 139.04,     
//     'Mercury': 109.97, 
//     'Venus': 142.80,  
//     'Mars': 119.84,   
//     'Jupiter': 65.93,  
//     'Saturn': 59.34,   
//     'Uranus': 319.24,  
//     'Neptune': 305.05, 
//     'Pluto': 250.20    
//   };
  
//   return mockLongitudes[planetName] || (Math.random() * 360);
// }
  
//   function getPlanetSymbol(planetName) {
//     const symbols = {
//       'Sun': '☉',
//       'Moon': '☽',
//       'Mercury': '☿',
//       'Venus': '♀',
//       'Mars': '♂',
//       'Jupiter': '♃',
//       'Saturn': '♄',
//       'Uranus': '♅',
//       'Neptune': '♆',
//       'Pluto': '♇'
//     };
//     return symbols[planetName] || planetName.charAt(0);
//   }
  
 
//   function raDecToEclipticLongitude(raHours, declination, planetName = '') {
//     try {
//       console.log(`   🌍 Converting ${planetName}: RA=${raHours.toFixed(4)} hours, Dec=${declination.toFixed(4)}°`);
      
//       const raDegrees = raHours * 15;
//       const epsilon = 23.43928;
      
//       console.log(`      RA in degrees: ${raDegrees.toFixed(2)}°`);
      
//       const raRad = raDegrees * Math.PI / 180;
//       const decRad = declination * Math.PI / 180;
//       const epsRad = epsilon * Math.PI / 180;
      
//       const sinDec = Math.sin(decRad);
//       const cosDec = Math.cos(decRad);
//       const sinRa = Math.sin(raRad);
//       const cosRa = Math.cos(raRad);
//       const sinEps = Math.sin(epsRad);
//       const cosEps = Math.cos(epsRad);
      
//       const numerator = sinRa * cosEps + Math.tan(decRad) * sinEps;
//       const denominator = cosRa;
      
//       let lambdaRad = Math.atan2(numerator, denominator);
//       let eclipticLong = lambdaRad * 180 / Math.PI;
      
//       if (eclipticLong < 0) eclipticLong += 360;
      
//       console.log(`      🌟 Ecliptic Longitude: ${eclipticLong.toFixed(2)}°`);
//       return eclipticLong;
//     } catch (error) {
//       console.error('Error in ecliptic conversion:', error);
//       return 0;
//     }
//   }

//   function getPlanetSymbol(planetName) {
//     const symbols = {
//       'Sun': '☉',
//       'Moon': '☽',
//       'Mercury': '☿',
//       'Venus': '♀',
//       'Mars': '♂',
//       'Jupiter': '♃',
//       'Saturn': '♄',
//       'Uranus': '♅',
//       'Neptune': '♆',
//       'Pluto': '♇'
//     };
//     return symbols[planetName] || planetName.charAt(0);
//   }


// module.exports = {
//   sendDynamicWeeklyReport,
//   manualTrigger,
//   runCron,
//   processWeeklyIntegration,
//   getMembers,
//   generateWeeklyTransitReport,
//   getPlanetaryPositions,
//   getAPIPlanetaryPositions,
//   getWeeklyPlanetaryPositions,
//   getBirthChartPositions,
//   compareTransitsWithNatal,
//   getWeekDates
// };




const AYANAMSA_2025 = 24.18;
const ZODIAC_13_SIGNS = [
  { name: 'Aries', symbol: '♈', start: 0, end: 51.16, width: 51.16, color: '#e74c3c' },
  { name: 'Taurus', symbol: '♉', start: 51.16, end: 89.93, width: 38.77, color: '#27ae60' },
  { name: 'Gemini', symbol: '♊', start: 89.93, end: 118.46, width: 28.53, color: '#f39c12' },
  { name: 'Cancer', symbol: '♋', start: 118.46, end: 138.45, width: 19.99, color: '#9b59b6' },
  { name: 'Leo', symbol: '♌', start: 138.45, end: 174.24, width: 35.79, color: '#e67e22' },
  { name: 'Virgo', symbol: '♍', start: 174.24, end: 218.38, width: 44.14, color: '#16a085' },
  { name: 'Libra', symbol: '♎', start: 218.38, end: 241.79, width: 23.41, color: '#3498db' },
  { name: 'Scorpio', symbol: '♏', start: 241.79, end: 248.89, width: 7.10, color: '#c0392b' },
  { name: 'Ophiuchus', symbol: '⛎', start: 248.89, end: 266.82, width: 17.93, color: '#9d4edd' },
  { name: 'Sagittarius', symbol: '♐', start: 266.82, end: 299.93, width: 33.11, color: '#8e44ad' },
  { name: 'Capricorn', symbol: '♑', start: 299.93, end: 327.64, width: 27.71, color: '#2c3e50' },
  { name: 'Aquarius', symbol: '♒', start: 327.64, end: 351.49, width: 23.85, color: '#1abc9c' },
  { name: 'Pisces', symbol: '♓', start: 351.49, end: 360, width: 8.51, color: '#2980b9' }
];
const svg2img = require('svg2img');
const util = require('util');
const svg2imgPromise = util.promisify(svg2img);
const fs = require('fs').promises;
const path = require('path'); 
const nodemailer = require('nodemailer');
const {cloudinaryUploadImage}=require('../util/cloudinary')
const cron = require('node-cron');
const axios = require('axios');
const subscription = require('../models/subscription');

const APP_ID = '37dc92a5-a64e-45fa-8566-1fc9d1d648f1'.trim();
const APP_SECRET = 'cd40ba3f33a87de9eee56063e276f77d2a8080fd1a5a8674f466f0c01dbbba425d89fab89e894f0849c9831b0306a6e22b5bf0bd198f36b1cd01e9a8b8c6621cc9591f6cdf9e7f1fb7193262083a47ca9ae90ec1bc935f7b53cd6d9eed9a7e29930012498f0e71ea38fe48cf10fc2c1d'.trim();




const OBSERVER_LATITUDE = 33.775867;
const OBSERVER_LONGITUDE = -84.39733;
const OBSERVER_ELEVATION = 10;



async function convertSVGtoPNG(svgContent, outputPath) {
  try {
    console.log(`🔄 Converting SVG to PNG...`);
    console.log(`📝 SVG length: ${svgContent.length} characters`);
    
    const pngBuffer = await svg2imgPromise(svgContent, {
      width: 800,
      height: 800,
      format: 'png'
    });
    
    await fs.writeFile(outputPath, pngBuffer);
    
    console.log(`✅ Natal chart image saved: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error converting SVG to PNG:', error);
    throw error;
  }
}

function getWeekDates(startDate = new Date()) {
  const dates = [];
  const current = new Date(startDate);
  const dayOfWeek = current.getDay();
  
  let daysUntilNextSunday;
  if (dayOfWeek === 0) {
    daysUntilNextSunday = 0;
  } else {
    daysUntilNextSunday = 7 - dayOfWeek;
  }
  
  const sunday = new Date(current);
  sunday.setDate(sunday.getDate() + daysUntilNextSunday);
  sunday.setHours(12, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday);
    day.setDate(day.getDate() + i);
    dates.push(day);
  }

  return dates;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function parseRAToDecimal(raValue) {
  try {
    if (typeof raValue === 'number') {
      console.log(`   ✅ RA already decimal: ${raValue} hours`);
      return raValue;
    }

    if (typeof raValue === 'object' && raValue !== null && raValue.hours !== undefined) {
      const hoursValue = parseFloat(raValue.hours);
      console.log(`   ✅ RA from object.hours: ${hoursValue} hours`);
      return hoursValue;
    }

    if (typeof raValue === 'string') {
      const match = raValue.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        const result = hours + (minutes / 60) + (seconds / 3600);
        console.log(`   ✅ RA parsed from string: ${result} hours`);
        return result;
      }
    }

    console.warn(`   ❌ Could not parse RA:`, raValue);
    return 0;
  } catch (error) {
    console.error('❌ Error parsing RA:', error, raValue);
    return 0;
  }
}

function parseDecToDecimal(decValue) {
  try {
    if (typeof decValue === 'number') {
      console.log(`   ✅ Dec already decimal: ${decValue} degrees`);
      return decValue;
    }

    if (typeof decValue === 'object' && decValue !== null && decValue.degrees !== undefined) {
      const degreesValue = parseFloat(decValue.degrees);
      console.log(`   ✅ Dec from object.degrees: ${degreesValue} degrees`);
      return degreesValue;
    }

    if (typeof decValue === 'string') {
      const match = decValue.match(/([-+]?)(\d+)°\s*(\d+)'\s*([\d.]+)"/);
      if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const degrees = parseInt(match[2]);
        const minutes = parseInt(match[3]);
        const seconds = parseFloat(match[4]);
        const result = sign * (degrees + (minutes / 60) + (seconds / 3600));
        console.log(`   ✅ Dec parsed from string: ${result} degrees`);
        return result;
      }
    }

    console.warn(`   ❌ Could not parse Dec:`, decValue);
    return 0;
  } catch (error) {
    console.error('❌ Error parsing Dec:', error, decValue);
    return 0;
  }
}

async function getWeeklyPlanetaryPositions(fromDate, toDate) {
  try {
    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);
    const time = formatTime(new Date());
    
    const authString = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');

    console.log(`📡 Fetching planetary data from ${formattedFromDate} to ${formattedToDate}`);
    console.log(`📍 Observer Location: Lat ${OBSERVER_LATITUDE}, Lon ${OBSERVER_LONGITUDE}, Elev ${OBSERVER_ELEVATION}m`);
    console.log(`⏰ Time: ${time}`);

    const requestParams = {
      latitude: OBSERVER_LATITUDE,
      longitude: OBSERVER_LONGITUDE,
      elevation: OBSERVER_ELEVATION,
      from_date: formattedFromDate,
      to_date: formattedToDate,
      time: time,
      bodies: 'sun,moon,mercury,venus,mars,jupiter,saturn',
    };

    console.log(`🔍 Request Params:`, JSON.stringify(requestParams, null, 2));

    const response = await axios.get(
      'https://api.astronomyapi.com/api/v2/bodies/positions',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
        },
        params: requestParams,
      }
    );

    console.log(`✅ API Response received. Status: ${response.status}`);
    return processAPIResponse(response.data);
  } catch (error) {
    console.error('❌ API request failed:', error.message);
    
    if (error.response) {
      console.error('📊 Response Status:', error.response.status);
      console.error('📊 Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('📊 Response Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('📊 No response received. Request:', error.request);
    } else {
      console.error('📊 Error setting up request:', error.message);
    }
    
    throw error;
  }
}

function processAPIResponse(apiResponse) {
  const positionsByDate = {};

  console.log(`🔍 Processing API Response...`);
  console.log(`📋 Response keys:`, Object.keys(apiResponse));

  if (apiResponse.data && apiResponse.data.table && apiResponse.data.table.rows) {
    const rows = apiResponse.data.table.rows;
    console.log(`📊 Total rows received: ${rows.length}`);

    rows.forEach((row, rowIndex) => {
      const planetId = row.entry.id;
      const planetName = row.entry.name;

      console.log(`  🪐 Planet ${rowIndex + 1}: ${planetName} (${planetId}) - ${row.cells ? row.cells.length : 0} cells`);

      if (row.cells && row.cells.length > 0) {
        row.cells.forEach((cell, cellIndex) => {
          const cellDate = cell.date;

          if (!positionsByDate[cellDate]) {
            positionsByDate[cellDate] = {};
          }

          const raValue = cell.position.equatorial.rightAscension;
          const decValue = cell.position.equatorial.declination;
          
          const raDecimal = parseRAToDecimal(raValue);
          const decDecimal = parseDecToDecimal(decValue);

          console.log(`      📊 Parsed ${cell.name}: RA=${raDecimal}, Dec=${decDecimal}`);

          positionsByDate[cellDate][planetId] = {
            id: cell.id,
            name: cell.name,
            date: cell.date,
            distance: {
              au: parseFloat(cell.distance.fromEarth.au),
              km: parseFloat(cell.distance.fromEarth.km)
            },
            position: {
              horizontal: {
                altitude: parseFloat(cell.position.horizontal.altitude.degrees),
                azimuth: parseFloat(cell.position.horizontal.azimuth.degrees)
              },
              equatorial: {
                rightAscension: raDecimal,
                declination: decDecimal
              },
              constellation: cell.position.constellation.name
            },
            magnitude: cell.extraInfo.magnitude !== null ? parseFloat(cell.extraInfo.magnitude) : null,
            elongation: cell.extraInfo.elongation !== null ? parseFloat(cell.extraInfo.elongation) : null
          };
        });
      }
    });

    console.log(`✅ Processed ${Object.keys(positionsByDate).length} unique dates`);
    console.log(`📅 Dates available:`, Object.keys(positionsByDate).sort());
  } else {
    console.warn(`⚠️  Unexpected API response structure`);
    console.log(`Full response:`, JSON.stringify(apiResponse, null, 2));
  }

  return positionsByDate;
}

async function getAPIPlanetaryPositions(date = new Date()) {
  try {
    const formattedDate = formatDate(date);
    const time = formatTime(new Date());
    const authString = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');

    console.log(`🔍 [Single Date] Fetching for: ${formattedDate}`);
    console.log(`⏰ [Single Date] Time: ${time}`);

    const requestParams = {
      latitude: OBSERVER_LATITUDE,
      longitude: OBSERVER_LONGITUDE,
      elevation: OBSERVER_ELEVATION,
      from_date: formattedDate,
      to_date: formattedDate,
      time: time,
      bodies: 'sun,moon,mercury,venus,mars,jupiter,saturn',
    };

    console.log(`🔍 [Single Date] Request Params:`, JSON.stringify(requestParams, null, 2));

    const response = await axios.get(
      'https://api.astronomyapi.com/api/v2/bodies/positions',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
        },
        params: requestParams,
      }
    );

    console.log(`✅ [Single Date] API Response received. Status: ${response.status}`);
    return processSingleDateResponse(response.data);
  } catch (error) {
    console.error('❌ [Single Date] API request failed:', error.message);
    
    if (error.response) {
      console.error('📊 Response Status:', error.response.status);
      console.error('📊 Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📊 No response received. Request:', error.request);
    }
    
    throw error;
  }
}

function processSingleDateResponse(apiResponse) {
  const positions = {};

  console.log(`🔍 Processing Single Date Response...`);
  console.log(`📋 Response keys:`, Object.keys(apiResponse));

  if (apiResponse.data && apiResponse.data.table && apiResponse.data.table.rows) {
    const rows = apiResponse.data.table.rows;
    console.log(`📊 Total rows received: ${rows.length}`);

    rows.forEach((row, rowIndex) => {
      const planetId = row.entry.id;
      const planetName = row.entry.name;

      console.log(`  🪐 Planet ${rowIndex + 1}: ${planetName} (${planetId}) - ${row.cells ? row.cells.length : 0} cells`);

      if (row.cells && row.cells.length > 0) {
        const cell = row.cells[0];

        const raValue = cell.position.equatorial.rightAscension;
        const decValue = cell.position.equatorial.declination;
        
        const raDecimal = parseRAToDecimal(raValue);
        const decDecimal = parseDecToDecimal(decValue);

        console.log(`      📊 Parsed ${cell.name}: RA=${raDecimal}, Dec=${decDecimal}`);

        positions[planetId] = {
          id: cell.id,
          name: cell.name,
          date: cell.date,
          distance: {
            au: parseFloat(cell.distance.fromEarth.au),
            km: parseFloat(cell.distance.fromEarth.km)
          },
          position: {
            horizontal: {
              altitude: parseFloat(cell.position.horizontal.altitude.degrees),
              azimuth: parseFloat(cell.position.horizontal.azimuth.degrees)
            },
            equatorial: {
              rightAscension: raDecimal,
              declination: decDecimal
            },
            constellation: cell.position.constellation.name
          },
          magnitude: cell.extraInfo.magnitude !== null ? parseFloat(cell.extraInfo.magnitude) : null,
          elongation: cell.extraInfo.elongation !== null ? parseFloat(cell.extraInfo.elongation) : null
        };
      }
    });

    console.log(`✅ Processed ${Object.keys(positions).length} planets`);
  } else {
    console.warn(`⚠️  Unexpected API response structure`);
    console.log(`Full response:`, JSON.stringify(apiResponse, null, 2));
  }

  return positions;
}

async function getPlanetaryPositions(date = new Date()) {
  try {
    const positions = await getAPIPlanetaryPositions(date);

    if (!positions || Object.keys(positions).length === 0) {
      throw new Error('No positions received from API');
    }

    return positions;
  } catch (error) {
    console.error('Error getting planetary positions:', error.message);
    throw error;
  }
}

async function getAspectInterpretation(transitPlanet, natalPlanet, aspect) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective model
        messages: [
          {
            role: 'system',
            content: 'You are an expert astrologer providing insightful, personalized transit interpretations. Keep responses concise (2-3 sentences), practical, and empowering.'
          },
          {
            role: 'user',
            content: `Provide an interpretation for: Transit ${transitPlanet} ${aspect} natal ${natalPlanet}. Focus on practical guidance and what this means for daily life.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('Error fetching interpretation:', error);
    
    // Fallback to static interpretations
    return getFallbackInterpretation(transitPlanet, natalPlanet, aspect);
  }
}

function getFallbackInterpretation(transitPlanet, natalPlanet, aspect) {
  const interpretations = {
    // ☀️ SUN
    'Sun Conjunction': 'Vitality and self-expression are amplified. A powerful time for new beginnings.',
    'Sun Trine': 'Harmonious energy flow. Things come easily and naturally today.',
    'Sun Sextile': 'Opportunities for growth and positive connections arise. Take initiative.',
    'Sun Square': 'Challenges test your willpower. Push through resistance with confidence.',
    'Sun Opposition': 'Awareness through contrast. Balance opposing forces in your life.',
  
    // 🌙 MOON
    'Moon Conjunction': 'Emotional intensity and heightened intuition. Trust your feelings.',
    'Moon Trine': 'Emotional harmony and comfort. A nurturing day for relationships.',
    'Moon Sextile': 'Emotional clarity and social ease. Express your feelings openly.',
    'Moon Square': 'Emotional tension or restlessness. Take time to process inner needs.',
    'Moon Opposition': 'Emotional awareness through others. Seek emotional balance.',
  
    // ☿ MERCURY
    'Mercury Conjunction': 'Mental clarity and communication focus. Share your ideas confidently.',
    'Mercury Trine': 'Easy communication and clear thinking. Great for meaningful conversations.',
    'Mercury Sextile': 'Positive exchanges and good news. Network and connect.',
    'Mercury Square': 'Mental stress or miscommunication possible. Double-check details.',
    'Mercury Opposition': 'Conflicting viewpoints arise. Listen as much as you speak.',
  
    // ♀ VENUS
    'Venus Conjunction': 'Love, beauty, and pleasure are emphasized. Enjoy life’s sweetness.',
    'Venus Trine': 'Romantic harmony and social grace. A fortunate day for relationships.',
    'Venus Sextile': 'Pleasant surprises and social opportunities. Say yes to invitations.',
    'Venus Square': 'Relationship tension or financial strain. Avoid impulsive decisions.',
    'Venus Opposition': 'Relationship awareness grows through contrast. Find compromise and balance.',
  
    // ♂ MARS
    'Mars Conjunction': 'High energy and assertiveness. Take bold action but avoid aggression.',
    'Mars Trine': 'Courageous action flows naturally. You have the strength to succeed.',
    'Mars Sextile': 'Motivated and productive energy. A great time to start new projects.',
    'Mars Square': 'Frustration or conflict may arise. Channel energy constructively.',
    'Mars Opposition': 'Power struggles possible. Choose your battles wisely.',
  
    // ♃ JUPITER
    'Jupiter Conjunction': 'Expansion and opportunity. Think big but act with wisdom.',
    'Jupiter Trine': 'Luck and growth come easily. Your optimism attracts good fortune.',
    'Jupiter Sextile': 'Positive developments and learning opportunities. Stay open to growth.',
    'Jupiter Square': 'Overconfidence or excess possible. Keep expectations realistic.',
    'Jupiter Opposition': 'Balance optimism with realism. Avoid overextending yourself.',
  
    // ♄ SATURN
    'Saturn Conjunction': 'Reality checks and responsibility. Build strong foundations.',
    'Saturn Trine': 'Discipline pays off. Hard work brings lasting results.',
    'Saturn Sextile': 'Structured progress and steady growth. Stay consistent.',
    'Saturn Square': 'Obstacles test patience and endurance. Persevere with discipline.',
    'Saturn Opposition': 'External pressure increases. Reorganize priorities and boundaries.',
  
    // ♅ URANUS
    'Uranus Conjunction': 'Revolutionary change and awakening. Embrace the unexpected.',
    'Uranus Trine': 'Innovation flows smoothly. Break free from routine.',
    'Uranus Sextile': 'Creative breakthroughs and liberating opportunities. Try something new.',
    'Uranus Square': 'Sudden disruptions or surprises. Stay flexible and adaptable.',
    'Uranus Opposition': 'Freedom versus responsibility. Balance independence with commitment.',
  
    // ♆ NEPTUNE
    'Neptune Conjunction': 'Spiritual awakening and dissolving boundaries. Trust your intuition.',
    'Neptune Trine': 'Creative inspiration and heightened intuition. Dream big with purpose.',
    'Neptune Sextile': 'Compassion and artistic flow. Express imagination freely.',
    'Neptune Square': 'Confusion or illusion possible. Seek clarity and avoid escapism.',
    'Neptune Opposition': 'Fantasy versus reality. Ground dreams in practical action.',
  
    // ♇ PLUTO
    'Pluto Conjunction': 'Deep transformation and rebirth. Let go of what no longer serves you.',
    'Pluto Trine': 'Powerful regeneration and empowerment. Positive change unfolds smoothly.',
    'Pluto Sextile': 'Opportunities for deep healing and transformation arise. Embrace growth.',
    'Pluto Square': 'Intense pressure sparks evolution. Face your shadows courageously.',
    'Pluto Opposition': 'Power dynamics surface. Transformation comes through confrontation.',
  
    // ⚷ CHIRON
    'Chiron Conjunction': 'Healing comes through awareness. Pain becomes wisdom.',
    'Chiron Trine': 'Gentle healing and empathy. Share your journey to inspire others.',
    'Chiron Sextile': 'Healing opportunities appear. Be open to emotional growth.',
    'Chiron Square': 'Old wounds resurface for healing. Face pain with compassion.',
    'Chiron Opposition': 'Healing through relationship mirrors. Recognize yourself in others.',
  
    // ☊ NORTH NODE
    'North Node Conjunction': 'Destiny calls. Move toward your soul’s purpose.',
    'North Node Trine': 'You’re aligned with your life path. Doors open naturally.',
    'North Node Sextile': 'Opportunities for growth align with your purpose. Take steady steps.',
    'North Node Square': 'Growing pains on your evolutionary path. Choose growth over comfort.',
    'North Node Opposition': 'Release the past to embrace your future. Let go gracefully.'
  };
  
  
  const specificInterpretations = {
    // ☀️ SUN
    'Jupiter Conjunction Sun': 'A period of confidence and success begins. Your optimism shines brightly.',
    'Saturn Conjunction Sun': 'A time of responsibility and maturity. Define your goals clearly.',
    'Uranus Conjunction Sun': 'Radical self-reinvention. Break free from limiting patterns.',
    'Neptune Conjunction Sun': 'Spiritual identity shift. Your ego dissolves into higher purpose.',
    'Pluto Conjunction Sun': 'Profound transformation of identity. You emerge renewed and empowered.',
  
    // 🌙 MOON
    'Jupiter Conjunction Moon': 'Emotional expansion and family blessings. Joy grows within your home life.',
    'Saturn Conjunction Moon': 'Emotional maturity develops. Time to set healthy boundaries.',
    'Uranus Conjunction Moon': 'Emotional liberation and breakthrough. Expect surprising shifts.',
    'Neptune Conjunction Moon': 'Heightened sensitivity and empathy. Protect emotional boundaries.',
    'Pluto Conjunction Moon': 'Emotional catharsis and deep healing. Inner transformation unfolds.',
  
    // ☿ MERCURY
    'Jupiter Conjunction Mercury': 'Expanded thinking and communication success. Speak with confidence.',
    'Saturn Conjunction Mercury': 'Serious study and disciplined thought. Master complex subjects.',
    'Uranus Conjunction Mercury': 'Sudden insights and innovative ideas. Your mind awakens to new truths.',
    'Neptune Conjunction Mercury': 'Inspired yet dreamy thinking. Clarify facts before acting.',
    'Pluto Conjunction Mercury': 'Intense focus and transformative communication. Uncover hidden knowledge.',
  
    // ♀ VENUS
    'Jupiter Conjunction Venus': 'Love and abundance expand. Relationships and finances thrive.',
    'Saturn Conjunction Venus': 'Relationship reality check. Define values and commitment.',
    'Uranus Conjunction Venus': 'Unexpected love or social changes. Embrace freedom in connections.',
    'Neptune Conjunction Venus': 'Idealized or spiritual love. Stay grounded in reality.',
    'Pluto Conjunction Venus': 'Intense, transformative love. Deep emotional and financial shifts.',
  
    // ♂ MARS
    'Jupiter Conjunction Mars': 'Tremendous drive and courage. Take bold steps toward your ambitions.',
    'Saturn Conjunction Mars': 'Disciplined energy and endurance. Patience brings mastery.',
    'Uranus Conjunction Mars': 'Explosive energy and sudden impulses. Direct power wisely.',
    'Neptune Conjunction Mars': 'Scattered motivation or confusion. Focus your intentions clearly.',
    'Pluto Conjunction Mars': 'Immense power and will. Channel determination ethically.',
  
    // ♃ JUPITER
    'Saturn Conjunction Jupiter': 'Practical optimism. Balance vision with discipline.',
    'Uranus Conjunction Jupiter': 'Sudden breakthroughs and liberation. Lucky opportunities arise.',
    'Neptune Conjunction Jupiter': 'Spiritual expansion and idealism. Keep faith grounded.',
    'Pluto Conjunction Jupiter': 'Transformative success and deep empowerment. Prosper through change.',
  
    // ♄ SATURN
    'Uranus Conjunction Saturn': 'Breaking free from limitations. Restructure for greater freedom.',
    'Neptune Conjunction Saturn': 'Boundaries dissolve. Learn to balance form with flow.',
    'Pluto Conjunction Saturn': 'Profound rebuilding of structures. Renew foundations with strength.',
  
    // ♅ URANUS
    'Neptune Conjunction Uranus': 'Spiritual and technological awakening. Revolutionary creativity.',
    'Pluto Conjunction Uranus': 'Generational upheaval and innovation. Deep social transformation.',
  
    // ♆ NEPTUNE
    'Pluto Conjunction Neptune': 'Spiritual and collective transformation. The unseen becomes visible.'
  };
  
 
  const specificKey = `${transitPlanet} ${aspect} ${natalPlanet}`;
  if (specificInterpretations[specificKey]) {
    return specificInterpretations[specificKey];
  }

 
  const key = `${transitPlanet} ${aspect}`;
  const interpretation = interpretations[key];

  if (interpretation) {
    return `${interpretation} (affecting your natal ${natalPlanet})`;
  }

  return `${transitPlanet} ${aspect} your natal ${natalPlanet} - ${getAspectNature(aspect)} energy.`;
}


function getAspect(transitDegree, natalDegree, transitSign, natalSign) {
  let diff = Math.abs(transitDegree - natalDegree);
  if (diff > 180) diff = 360 - diff;

  console.log(`      📐 Aspect calc: |${transitDegree.toFixed(2)}° - ${natalDegree.toFixed(2)}°| = ${diff.toFixed(2)}°`);
  console.log(`      🔮 Signs: Transit ${transitSign.name}, Natal ${natalSign.name}`);

  // Dynamic orbs based on sign widths
  const avgWidth = (transitSign.width + natalSign.width) / 2;
  const orbMultiplier = avgWidth / 30; // Normalize to traditional 30° sign
  
  const aspects = [
    { name: 'Conjunction', angle: 0, baseOrb: 8 },
    { name: 'Sextile', angle: 60, baseOrb: 6 },
    { name: 'Square', angle: 90, baseOrb: 7 },
    { name: 'Trine', angle: 120, baseOrb: 8 },
    { name: 'Opposition', angle: 180, baseOrb: 8 },
  ];

  for (const aspect of aspects) {
    // Adjust orb based on sign widths
    const adjustedOrb = aspect.baseOrb * orbMultiplier;
    const orb = Math.abs(diff - aspect.angle);
    
    if (orb <= adjustedOrb) {
      console.log(`      ✨ Match: ${aspect.name} (orb: ${orb.toFixed(2)}°, adjusted threshold: ${adjustedOrb.toFixed(2)}°)`);
      return { name: aspect.name, orb, exact: orb < 1 };
    }
  }

  console.log(`      ✗ No aspect match`);
  return null;
}

function get13SignAspectNature(aspect, transitSign, natalSign) {
  // Special handling for Ophiuchus
  if (transitSign.name === 'Ophiuchus' || natalSign.name === 'Ophiuchus') {
    return {
      nature: 'Transformative',
      note: 'Ophiuchus energy brings healing and deep transformation'
    };
  }
  
  // Scorpio's narrow width makes aspects more intense
  if (transitSign.name === 'Scorpio' || natalSign.name === 'Scorpio') {
    return {
      nature: 'Intense',
      note: 'Scorpio\'s concentrated energy amplifies this aspect'
    };
  }
  
  // Aries' wide width diffuses energy
  if (transitSign.name === 'Aries' || natalSign.name === 'Aries') {
    return {
      nature: 'Expansive',
      note: 'Aries\' broad influence spreads this energy widely'
    };
  }
  
  // Default traditional interpretation
  const harmonious = ['Trine', 'Sextile', 'Conjunction'];
  const challenging = ['Square', 'Opposition'];
  
  if (harmonious.includes(aspect)) return { nature: 'Harmonious', note: '' };
  if (challenging.includes(aspect)) return { nature: 'Challenging', note: '' };
  return { nature: 'Neutral', note: '' };
}
async function getBirthChartPositions(birthDate, birthTime = null, birthTimezone = null) {
  try {
    let birthDateTime = new Date(birthDate);
    
    if (birthTime) {
      const [hours, minutes, seconds] = birthTime.split(':').map(Number);
      birthDateTime.setHours(hours, minutes, seconds || 0, 0);
      console.log(`🎂 Using provided birth time: ${birthTime}`);
    } else {
      console.log(`🎂 Using birth date object time`);
    }
    
    console.log(`🎂 Birth DateTime:`, birthDateTime);
    console.log(`🕐 Formatted for API: ${formatDate(birthDateTime)} ${formatTime(birthDateTime)}`);

    const positions = await getAPIPlanetaryPositions(birthDateTime);
    return positions;
  } catch (error) {
    console.error('Error getting birth chart positions:', error.message);
    throw error;
  }
}

function compareTransitsWithNatal(dailyTransits, natalChart) {
  const transits = [];
  const validPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
  console.log(`\n🔍 Comparing transits with natal chart...`);
  console.log(`   Transit planets: ${Object.keys(dailyTransits).join(', ')}`);
  console.log(`   Natal planets: ${Object.keys(natalChart).join(', ')}`);

  for (const [transitKey, transitPlanet] of Object.entries(dailyTransits)) {
    for (const [natalKey, natalPlanet] of Object.entries(natalChart)) {
      if (!validPlanets.includes(transitKey.toLowerCase()) || 
          !validPlanets.includes(natalKey.toLowerCase())) {
        continue;
      }
      
      if (transitKey === natalKey) continue;
      
      const transitTropicalLong = raDecToEclipticLongitude(
        transitPlanet.position.equatorial.rightAscension,
        transitPlanet.position.equatorial.declination
      );
      
      const natalTropicalLong = raDecToEclipticLongitude(
        natalPlanet.position.equatorial.rightAscension,
        natalPlanet.position.equatorial.declination
      );
      
 
      let transitLongitude = transitTropicalLong - AYANAMSA_2025;
      if (transitLongitude < 0) transitLongitude += 360;
      
      let natalLongitude = natalTropicalLong - AYANAMSA_2025;
      if (natalLongitude < 0) natalLongitude += 360;

      console.log(`   Comparing ${transitKey} (${transitLongitude.toFixed(2)}°) vs ${natalKey} (${natalLongitude.toFixed(2)}°)`);

     // Get zodiac signs for both positions
const transitSignInfo = getZodiacSign(transitTropicalLong);
const natalSignInfo = getZodiacSign(natalTropicalLong);

// Find full sign data including width
const transitSign = ZODIAC_13_SIGNS.find(s => s.name === transitSignInfo.name);
const natalSign = ZODIAC_13_SIGNS.find(s => s.name === natalSignInfo.name);

const aspect = getAspect(transitLongitude, natalLongitude, transitSign, natalSign);

      if (aspect && isValidAspect(aspect, transitKey, natalKey)) {
        console.log(`      ✨ Found: ${aspect.name} (orb: ${aspect.orb.toFixed(2)}°)`);
        transits.push({
          transitPlanet: transitPlanet.name,
          natalPlanet: natalPlanet.name,
          aspect: aspect.name,
          orb: aspect.orb.toFixed(2),
          exact: aspect.exact,
          intensity: getIntensityLevel(aspect.orb)
        });
      }
    }
  }
  
  console.log(`   📊 Total aspects found: ${transits.length}`);
  return transits;
}

function isValidAspect(aspect, transitPlanet, natalPlanet) {
  if (aspect.orb > 10) return false;
  return true;
}

function getIntensityLevel(orb) {
  if (orb < 0.3) return 'Exact';
  if (orb < 2.0) return 'Very Strong';
  if (orb < 4.0) return 'Strong';
  if (orb < 6.0) return 'Moderate';
  return 'Weak';
}

function getAspectNature(aspectName) {
  const harmonious = ['Trine', 'Sextile', 'Conjunction'];
  const challenging = ['Square', 'Opposition'];
  
  if (harmonious.includes(aspectName)) return 'Harmonious';
  if (challenging.includes(aspectName)) return 'Challenging';
  return 'Neutral';
}

function raDecToEclipticLongitude(raHours, declination, planetName = '') {
  try {
    console.log(`   🌍 Converting ${planetName}: RA=${raHours.toFixed(4)} hours, Dec=${declination.toFixed(4)}°`);
    
    const raDegrees = raHours * 15;
    const epsilon = 23.43928;
    
    console.log(`      RA in degrees: ${raDegrees.toFixed(2)}°`);
    
    const raRad = raDegrees * Math.PI / 180;
    const decRad = declination * Math.PI / 180;
    const epsRad = epsilon * Math.PI / 180;
    
    const sinDec = Math.sin(decRad);
    const cosDec = Math.cos(decRad);
    const sinRa = Math.sin(raRad);
    const cosRa = Math.cos(raRad);
    const sinEps = Math.sin(epsRad);
    const cosEps = Math.cos(epsRad);
    
    const numerator = sinRa * cosEps + Math.tan(decRad) * sinEps;
    const denominator = cosRa;
    
    let lambdaRad = Math.atan2(numerator, denominator);
    let eclipticLong = lambdaRad * 180 / Math.PI;
    
    if (eclipticLong < 0) eclipticLong += 360;
    
    console.log(`      🌟 Ecliptic Longitude: ${eclipticLong.toFixed(2)}°`);
    return eclipticLong;
  } catch (error) {
    console.error('Error in ecliptic conversion:', error);
    return 0;
  }
}

function generateDayByDayGuidance(weekData) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let guidance = '';

  weekData.forEach((day, index) => {
    guidance += `**${dayNames[index]} - ${day.date.toLocaleDateString()}**\n\n`;

    if (day.transits.length === 0) {
      guidance += `No significant transits today. A day for integration and reflection.\n\n`;
    } else {
      const criticalTransits = day.transits.filter(t => t.exact || t.intensity === 'Exact');
      const strongTransits = day.transits.filter(t => t.intensity === 'Very Strong');
      const moderateTransits = day.transits.filter(t => t.intensity === 'Strong');

      if (criticalTransits.length > 0) {
        guidance += `🔥 **EXACT ASPECTS - Major Energy:**\n`;
        criticalTransits.forEach(t => {
          guidance += `• ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°)\n`;
          guidance += `  Energy: High impact. This is a powerful day for action related to ${t.natalPlanet} themes.\n`;
        });
        guidance += `\n`;
      }

      if (strongTransits.length > 0) {
        guidance += `⚡ **STRONG INFLUENCES:**\n`;
        strongTransits.forEach(t => {
          guidance += `• ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°)\n`;
        });
        guidance += `\n`;
      }

      if (moderateTransits.length > 0) {
        guidance += `💫 **SUPPORTING ENERGIES:**\n`;
        moderateTransits.forEach(t => {
          guidance += `• ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°)\n`;
        });
        guidance += `\n`;
      }
    }

    guidance += `---\n\n`;
  });

  return guidance;
}

const getMembers = async () => {
  try {
    const subscribers = await subscription
      .find({
        status: { $in: ['active', 'trialing'] }
      })
      .populate('userId');

    if (!subscribers || subscribers.length === 0) {
      console.log('No active subscribers found');
      return [];
    }

    const members = subscribers
      .filter(sub => sub.userId && sub.userId.email && sub.userId.birth_date)
      .map(sub => {
        const user = sub.userId;

        return {
          id: user._id,
          email: user.email,
          name: user.name || 'Member',
          subscriptionStatus: sub.status,
          birth_date: user.birth_date,
          birth_time: user.birth_time,
          birth_timezone: user.birth_timezone
        };
      });

    console.log(`Found ${members.length} active members with birth dates`);

    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};


function getZodiacSign(longitude) {
 
  let siderealLong = longitude - AYANAMSA_2025;
  if (siderealLong < 0) siderealLong += 360;
  const normalized = ((siderealLong % 360) + 360) % 360;
  

  for (const sign of ZODIAC_13_SIGNS) {
    if (sign.name === 'Pisces') {
      if (normalized >= sign.start || normalized < 0) {
        const degreeInSign = normalized >= sign.start ? normalized - sign.start : normalized + (360 - sign.start);
        return { name: sign.name, symbol: sign.symbol, degree: degreeInSign };
      }
    } else {
      if (normalized >= sign.start && normalized < sign.end) {
        return { name: sign.name, symbol: sign.symbol, degree: normalized - sign.start };
      }
    }
  }
  return { name: 'Aries', symbol: '♈', degree: 0 }; 
}



function generateNatalChartSection(natalChart, member) {
    const chartSVG = generateNatalChartSVG(natalChart);
    
    const planetPositions = Object.entries(natalChart)
      .filter(([planetId, data]) => data.position)
      .map(([planetId, data]) => {
        const longitude = raDecToEclipticLongitude(
          data.position.equatorial.rightAscension,
          data.position.equatorial.declination,
          data.name
        );
        
        const zodiacInfo = getZodiacSign(longitude);
        const zodiacSign = `${zodiacInfo.name} ${zodiacInfo.symbol}`;
        const degreeInSign = zodiacInfo.degree.toFixed(2);
        
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; font-weight: bold;">${getPlanetSymbol(data.name)} ${data.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${zodiacSign}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${degreeInSign}°</td>
            <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${data.position.constellation}</td>
          </tr>
        `;
      }).join('');
  
    return `
      <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #667eea;">
        <h3 style="color: #667eea; margin-top: 0; text-align: center;">🌟 Your Natal Chart</h3>
      
        <!-- Natal Chart Wheel -->
        <div style="text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 8px;">
          ${chartSVG}
        </div>
        
        <!-- Planet Positions Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <th style="padding: 12px; text-align: left;">Planet</th>
              <th style="padding: 12px; text-align: left;">Sign</th>
              <th style="padding: 12px; text-align: left;">Degree</th>
              <th style="padding: 12px; text-align: left;">Constellation</th>
            </tr>
          </thead>
          <tbody>
            ${planetPositions}
          </tbody>
        </table>
      </div>
    `;
  }

async function generateWeeklyTransitReport(member) {
  try {
    console.log(`\n🌟 Generating weekly report for ${member.name}`);

    console.log(`📌 Fetching natal chart for birth date: ${member.birth_date}`);
    console.log(`📌 Birth time: ${member.birth_time || 'NOT PROVIDED'}`);
    console.log(`📌 Birth timezone: ${member.birth_timezone || 'NOT PROVIDED'}`);
    
    const natalChart = await getBirthChartPositions(
      member.birth_date, 
      member.birth_time,
      member.birth_timezone
    );
    console.log(`✅ Got natal chart for ${member.name}`);
    console.log(`📊 Natal Chart Planets:`, Object.keys(natalChart));
    natalChart && Object.entries(natalChart).forEach(([key, planet]) => {
      console.log(`   🪐 ${key}: RA=${planet.position?.equatorial?.rightAscension}, Dec=${planet.position?.equatorial?.declination}`);
    });

    const weekDates = getWeekDates();
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];

    console.log(`\n📅 Fetching transits for entire week (${formatDate(weekStart)} to ${formatDate(weekEnd)})...`);
    const weeklyPositions = await getWeeklyPlanetaryPositions(weekStart, weekEnd);
    console.log(`✅ Weekly positions received`);
    console.log(`📊 Dates available in response:`, Object.keys(weeklyPositions).sort());

    const weekData = [];

    for (const date of weekDates) {
      const dateKey = formatDate(date);
      
      const matchingDateKey = Object.keys(weeklyPositions).find(key => 
        key.startsWith(dateKey)
      );
      
      const dailyTransits = weeklyPositions[matchingDateKey] || {};

      console.log(`\n📆 Processing ${dateKey}:`);
      console.log(`   🔗 Matching API key: ${matchingDateKey || 'NOT FOUND'}`);
      console.log(`   📍 Daily planets available:`, Object.keys(dailyTransits));
      
      if (Object.keys(dailyTransits).length === 0) {
        console.warn(`   ⚠️  No planet data for ${dateKey}`);
        console.log(`   📌 Available keys in response:`, Object.keys(weeklyPositions));
      } else {
        dailyTransits && Object.entries(dailyTransits).forEach(([key, planet]) => {
          console.log(`      🪐 ${key}: RA=${planet.position?.equatorial?.rightAscension}, Dec=${planet.position?.equatorial?.declination}`);
        });
      }

      const dayTransits = compareTransitsWithNatal(dailyTransits, natalChart);
      console.log(`   ✨ Transits found: ${dayTransits.length}`);
      console.log(`   ✨ Transits found: ${dayTransits.length}`);
      dayTransits.forEach(t => {
        console.log(`      → ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.orb}°, ${t.intensity})`);
      });

      weekData.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        transits: dayTransits,
        planets: dailyTransits
      });
    }

    const guidance = generateDayByDayGuidance(weekData);

    console.log(`\n📋 Report Summary:`);
    console.log(`   Total transits for week: ${weekData.reduce((sum, day) => sum + day.transits.length, 0)}`);

    return {
      memberId: member.id,
      memberName: member.name,
      memberEmail: member.email,
      birth_date: member.birth_date,
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      week: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
      systemUsed: 'Weekly Transit Report with Astronomy API',
      weekData: weekData,
      guidance: guidance,
      natalChart: natalChart,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error generating report for ${member.name}:`, error.message);
    console.error(error.stack);
    return null;
  }
}

async function sendDynamicWeeklyReport(member, report) {
  const chartSVG = generateNatalChartSVG(report.natalChart);

  const tempDir = path.join(__dirname, '..', 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  const imagePath = path.join(tempDir, `natal-chart-${member.id}-${Date.now()}.png`);
  await convertSVGtoPNG(chartSVG, imagePath);
  const uploadResult = await cloudinaryUploadImage(imagePath);
  if (!uploadResult || !uploadResult.url) {
    throw new Error('Failed to upload image to Cloudinary');
  }
  
  const imageUrl = uploadResult.url;
  const natalChartSection = `
  <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #667eea;">
    <h3 style="color: #667eea; margin-top: 0; text-align: center;">🌟 Your Natal Chart Wheel</h3>
   
    <!-- Natal Chart Wheel -->
    <div style="text-align: center; margin: 20px 0;">
      <img src="${imageUrl}" alt="Your Natal Chart Wheel" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>
    </div>
  </div>
`;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'lemightyeagle@gmail.com',
        pass: process.env.EMAIL_PASS || 'uhrkgdguezzjduul'
    }
  });



  const dailyBreakdownHtml = report.weekData.map((day, index) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const transitRows = day.transits.length > 0
      ? day.transits.map(t => {
          const interpretation = getFallbackInterpretation(t.transitPlanet, t.natalPlanet, t.aspect); 
      return `
        <tr style="background: ${t.exact ? '#ffe6e6' : t.intensity === 'Very Strong' ? '#fff3cd' : '#f8f9fa'};">
          <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;"><strong>${t.transitPlanet}</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${t.aspect}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;"><strong>${t.natalPlanet}</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; color: ${t.exact ? '#e74c3c' : t.intensity === 'Very Strong' ? '#f39c12' : '#27ae60'}; font-weight: bold;">${t.intensity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${t.orb}°</td>
        </tr>
        <tr style="background: ${t.exact ? '#ffe6e6' : t.intensity === 'Very Strong' ? '#fff3cd' : '#f8f9fa'};">
          <td colspan="5" style="padding: 8px 15px 15px 15px; border-bottom: 2px solid #ecf0f1; color: #555; font-style: italic; font-size: 13px;">
            💫 ${interpretation}
          </td>
        </tr>
      `;
    }).join('')
  : `<tr><td colspan="5" style="padding: 15px; text-align: center; color: #7f8c8d;">No significant transits</td></tr>`;
    return `
      <div style="margin: 20px 0; border: 2px solid #667eea; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; font-size: 18px; font-weight: bold;">
          ${dayNames[index]} - ${day.date.toLocaleDateString()}
        </div>
        <table style="width: 100%; border-collapse: collapse; background: white;">
         <thead>
 <thead>
  <tr style="background: #f8f9fa;">
    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Transit Planet</th>
    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Aspect</th>
    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Natal Planet</th>
    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Strength</th>
    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Orb</th>
  </tr>
</thead>
</thead>
          <tbody>
            ${transitRows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');


  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Georgia', serif; 
          line-height: 1.8; 
          color: #2c3e50; 
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .wrapper {
          max-width: 900px;
          margin: 30px auto;
          padding: 20px;
        }
        .container {
          background-color: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          margin: -40px -40px 30px -40px;
          text-align: center;
        }
        h1 { 
          margin: 0;
          font-size: 28px;
          font-weight: normal;
        }
        h2 {
          color: #667eea;
          margin-top: 35px;
          font-size: 22px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #ecf0f1;
          color: #7f8c8d;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
        <div class="header">
  <h1>🌌 Your Weekly Transit Report</h1>
  <p style="margin: 15px 0 0 0; opacity: 0.9;">Personal Planetary Forecast - ${report.week}</p>
  <p style="margin: 10px 0 0 0; opacity: 0.85; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px;">
    ✨ 13-Sign Sidereal System (including Ophiuchus ⛎)<br/>
    📐 Ayanamsa 2025: 24.18° | Sign-Aware Variable Orbs
  </p>
</div>

          ${natalChartSection}

         
          <h2>📅 Daily Transit Breakdown</h2>
          <p style="color: #7f8c8d; margin: 15px 0;">This week's planetary transits interacting with your natal chart:</p>
          
          ${dailyBreakdownHtml}

          <h2>📋 Weekly Summary</h2>
          <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-left: 5px solid #667eea; margin: 25px 0; border-radius: 8px; white-space: pre-line;">
${report.guidance}
          </div>

          <div class="footer">
   <p><strong>System:</strong> 13-Sign Sidereal Zodiac with Ophiuchus</p>
<p style="font-size: 12px; margin-top: 5px;">
  Uses Ayanamsa 2025 (24.18°) | Variable sign widths | Sign-aware aspect orbs<br/>
  Scorpio: 7.10° | Ophiuchus: 17.93° | Aries: 51.16° | Traditional aspects adapted for sidereal
</p>
          
            <p>✨ May the stars illuminate your path ✨</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"True Sky Astrology" <lemightyeagle@gmail.com>`,
      to: member.email,
      subject: `🌙 ${member.name}, Your Weekly Transit Report - ${report.week}`,
      html: emailContent
    });

    await fs.unlink(imagePath);
    console.log(`✅ Report sent to ${member.email}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${member.email}:`, error.message);
    return false;
  }
}

async function processWeeklyIntegration() {
  console.log('\n🌟 Starting Weekly Transit Report Generation...');
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  const members = await getMembers();

  if (members.length === 0) {
    console.log('❌ No active members with birth dates found');
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  for (const member of members) {
    try {
      console.log(`\n📧 Processing: ${member.name} (${member.email})`);

      const report = await generateWeeklyTransitReport(member);

      if (report) {
        const sendSuccess = await sendDynamicWeeklyReport(member, report);

        if (sendSuccess) {
          successCount++;
          console.log(`✅ Success for ${member.name}`);
        } else {
          failureCount++;
          console.log(`❌ Failed to send email for ${member.name}`);
        }
      } else {
        failureCount++;
        console.log(`❌ Failed to generate report for ${member.name}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${member.name}:`, error.message);
      failureCount++;
    }
  }

  console.log(`\n📊 Weekly Report Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📧 Total Processed: ${members.length}\n`);
}

async function manualTrigger() {
  console.log('🔧 Manual trigger initiated...');
  await processWeeklyIntegration();
}

const runCron = () => {
  const job = cron.schedule('0 5 * * 0', async () => {
    console.log('⏰ Cron triggered: Sunday 5 AM');
    await processWeeklyIntegration();
  }, {
    timezone: process.env.TIMEZONE || 'America/New_York'
  });

  console.log('✅ Cron job scheduled: Every Sunday at 5 AM');
  return job;
};


function generateNatalChartSVG(natalChart) {
  const planets = [];
  
  console.log("🌌 Generating 13-Sign Sidereal Natal Chart (with Ophiuchus)");
  
  Object.entries(natalChart).forEach(([planetId, data]) => {
      if (!data.position || !data.position.equatorial) {
          console.warn(`⚠️ Missing position data for ${planetId}`);
          return;
      }

      const raHours = data.position.equatorial.rightAscension;
      const decDegrees = data.position.equatorial.declination;
      const siderealLongitude = calculateTropicalLongitude(raHours, decDegrees);
      const zodiacInfo = getZodiacSignFromLongitude(siderealLongitude);
      
      planets.push({
          name: data.name,
          longitude: siderealLongitude,
          symbol: getPlanetSymbol(data.name),
          planetId: planetId,
          zodiacSign: zodiacInfo.name,
          zodiacSymbol: zodiacInfo.symbol,
          degreeInSign: zodiacInfo.degree.toFixed(2)
      });
      
      console.log(`✅ ${data.name}: ${zodiacInfo.name} ${zodiacInfo.symbol} ${zodiacInfo.degree.toFixed(2)}° (Sidereal: ${siderealLongitude.toFixed(2)}°)`);
  });

  if (planets.length === 0) {
      return '<svg width="700" height="700"><text x="350" y="350" text-anchor="middle">No chart data</text></svg>';
  }

  const size = 700;
  const center = size / 2;
  const outerRadius = 320;
  const middleRadius = 260;
  const innerRadius = 200;
  const planetRadius = 140;

  // Draw 13 zodiac signs with variable widths
  let zodiacWheel = '';
  for (const sign of ZODIAC_13_SIGNS) {
    const startAngle = (sign.start - 90) * Math.PI / 180;
    const endAngle = (sign.end - 90) * Math.PI / 180;
    
    const x1 = center + outerRadius * Math.cos(startAngle);
    const y1 = center + outerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(endAngle);
    const y2 = center + outerRadius * Math.sin(endAngle);
    const x3 = center + middleRadius * Math.cos(endAngle);
    const y3 = center + middleRadius * Math.sin(endAngle);
    const x4 = center + middleRadius * Math.cos(startAngle);
    const y4 = center + middleRadius * Math.sin(startAngle);

    const largeArc = (sign.end - sign.start) > 180 ? 1 : 0;

    zodiacWheel += `
      <path d="M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${middleRadius} ${middleRadius} 0 ${largeArc} 0 ${x4} ${y4} Z" 
            fill="${sign.color}" 
            fill-opacity="0.2" 
            stroke="${sign.color}" 
            stroke-width="2"/>
    `;

    const labelAngle = ((sign.start + sign.end) / 2 - 90) * Math.PI / 180;
    const labelRadius = (outerRadius + middleRadius) / 2;
    const labelX = center + labelRadius * Math.cos(labelAngle);
    const labelY = center + labelRadius * Math.sin(labelAngle);

    zodiacWheel += `
      <text x="${labelX}" y="${labelY}" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-size="${sign.name === 'Ophiuchus' ? '24' : '28'}" 
            font-weight="bold" 
            fill="${sign.color}">
        ${sign.symbol}
      </text>
    `;
  }

  // Planet markers
  let planetMarkers = '';
  const usedPositions = [];
  
  planets.forEach((planet) => {
    let adjustedRadius = planetRadius;
    let positionFound = false;
    
    for (let radiusOffset = 0; radiusOffset < 60 && !positionFound; radiusOffset += 20) {
      adjustedRadius = planetRadius + radiusOffset;
      const angle = (planet.longitude - 90) * Math.PI / 180;
      const x = center + adjustedRadius * Math.cos(angle);
      const y = center + adjustedRadius * Math.sin(angle);
      
      const tooClose = usedPositions.some(pos => {
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        return distance < 35;
      });
      
      if (!tooClose) {
        positionFound = true;
        usedPositions.push({ x, y });
        
        const zodiacInfo = getZodiacSignFromLongitude(planet.longitude);
        const signColor = ZODIAC_13_SIGNS.find(s => s.name === zodiacInfo.name)?.color || '#666';

        planetMarkers += `
          <g class="planet-marker">
            <circle cx="${x}" cy="${y}" r="15" 
                    fill="${signColor}" 
                    stroke="white" 
                    stroke-width="3"/>
            <text x="${x}" y="${y}" 
                  text-anchor="middle" 
                  dominant-baseline="middle" 
                  font-size="18" 
                  fill="white" 
                  font-weight="bold">
              ${planet.symbol}
            </text>
            <text x="${x}" y="${y + 28}" 
                  text-anchor="middle" 
                  font-size="11" 
                  fill="#2c3e50"
                  font-weight="bold">
              ${planet.degreeInSign}°
            </text>
          </g>
        `;
      }
    }
  });

  // Aspect lines
  let aspectLines = '';
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;

      let aspectColor = null;
      if (Math.abs(diff - 0) < 8) aspectColor = '#fbbf24';
      else if (Math.abs(diff - 60) < 6) aspectColor = '#3b82f6';
      else if (Math.abs(diff - 90) < 7) aspectColor = '#f97316';
      else if (Math.abs(diff - 120) < 8) aspectColor = '#10b981';
      else if (Math.abs(diff - 180) < 8) aspectColor = '#ef4444';

      if (aspectColor) {
        const angle1 = (planets[i].longitude - 90) * Math.PI / 180;
        const angle2 = (planets[j].longitude - 90) * Math.PI / 180;
        const lineRadius = planetRadius - 30;
        const x1 = center + lineRadius * Math.cos(angle1);
        const y1 = center + lineRadius * Math.sin(angle1);
        const x2 = center + lineRadius * Math.cos(angle2);
        const y2 = center + lineRadius * Math.sin(angle2);

        aspectLines += `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                stroke="${aspectColor}" 
                stroke-width="1.5" 
                opacity="0.4"/>
        `;
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGradient">
          <stop offset="0%" stop-color="#1a1147" />
          <stop offset="100%" stop-color="#0a0e27" />
        </radialGradient>
      </defs>
      
      <circle cx="${center}" cy="${center}" r="${outerRadius + 20}" fill="url(#bgGradient)"/>
      <circle cx="${center}" cy="${center}" r="${outerRadius}" fill="none" stroke="rgba(168, 139, 250, 0.4)" stroke-width="3"/>
      
      ${zodiacWheel}
      
      <circle cx="${center}" cy="${center}" r="${middleRadius}" fill="none" stroke="rgba(168, 139, 250, 0.3)" stroke-width="2"/>
      <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="rgba(138, 101, 255, 0.05)" stroke="rgba(199, 181, 255, 0.5)" stroke-width="2"/>
      
      ${aspectLines}
      ${planetMarkers}
      
      <circle cx="${center}" cy="${center}" r="60" fill="rgba(138, 101, 255, 0.1)" stroke="rgba(168, 139, 250, 0.6)" stroke-width="2"/>
      
      <text x="${center}" y="${center - 10}" text-anchor="middle" font-size="16" font-weight="bold" fill="#a78bfa">13-SIGN</text>
      <text x="${center}" y="${center + 10}" text-anchor="middle" font-size="16" font-weight="bold" fill="#ec4899">SIDEREAL</text>
    </svg>
  `;
}

function calculateTropicalLongitude(raHours, decDegrees) {
  const raDegrees = raHours * 15;
  const epsilon = 23.43928;
  const raRad = raDegrees * Math.PI / 180;
  const decRad = decDegrees * Math.PI / 180;
  const epsRad = epsilon * Math.PI / 180;
  const tanLambda = (Math.sin(raRad) * Math.cos(epsRad) + Math.tan(decRad) * Math.sin(epsRad)) / Math.cos(raRad);
  let lambda = Math.atan(tanLambda) * 180 / Math.PI;
  if (raDegrees >= 90 && raDegrees < 270) {
      lambda += 180;
  } else if (lambda < 0) {
      lambda += 360;
  }
  lambda = ((lambda % 360) + 360) % 360;
  
  // Convert to sidereal for 13-sign system
  let siderealLambda = lambda - AYANAMSA_2025;
  if (siderealLambda < 0) siderealLambda += 360;
  return siderealLambda;
}

function getZodiacSignFromLongitude(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  
  for (const sign of ZODIAC_13_SIGNS) {
      if (sign.name === 'Pisces') {
          if (normalized >= sign.start || normalized < 0) {
              const degree = normalized >= sign.start ? normalized - sign.start : normalized + (360 - sign.start);
              return { name: sign.name, symbol: sign.symbol, degree };
          }
      } else {
          if (normalized >= sign.start && normalized < sign.end) {
              return { name: sign.name, symbol: sign.symbol, degree: normalized - sign.start };
          }
      }
  }
  return { name: 'Aries', symbol: '♈', degree: 0 }; // fallback
}

function getPlanetSymbol(planetName) {
    const symbols = {
        'Sun': '☉',
        'Moon': '☽',
        'Mercury': '☿',
        'Venus': '♀',
        'Mars': '♂',
        'Jupiter': '♃',
        'Saturn': '♄',
        'Uranus': '♅',
        'Neptune': '♆',
        'Pluto': '♇'
    };
    return symbols[planetName] || '●';
}

function generateVerificationTable(planetData) {
    let table = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">✅ Natal Chart Verification</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #667eea; color: white;">
                        <th style="padding: 10px; text-align: left;">Planet</th>
                        <th style="padding: 10px; text-align: left;">Tropical Zodiac</th>
                        <th style="padding: 10px; text-align: left;">Position</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    planetData.forEach(planet => {
        table += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;"><strong>${planet.symbol} ${planet.name}</strong></td>
                <td style="padding: 10px;">${planet.sign} ${getZodiacSymbol(planet.sign)}</td>
                <td style="padding: 10px;">${planet.degree}°</td>
            </tr>
        `;
    });
    
    table += `
                </tbody>
            </table>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">
                <strong>Note:</strong> This chart uses <strong>Tropical Zodiac</strong> (Western astrology). 
                The constellations shown in astronomical data are different due to precession (~24° offset).
            </p>
        </div>
    `;
    
    return table;
}

function getZodiacSymbol(signName) {
  const symbols = {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Ophiuchus': '⛎', 
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
  };
  return symbols[signName] || '';
}

function getPlanetSymbol(planetName) {
    const symbols = {
        'Sun': '☉',
        'Moon': '☽',
        'Mercury': '☿',
        'Venus': '♀',
        'Mars': '♂',
        'Jupiter': '♃',
        'Saturn': '♄',
        'Uranus': '♅',
        'Neptune': '♆',
        'Pluto': '♇'
    };
    return symbols[planetName] || '●';
}

function getPlanetSymbol(planetName) {
  const symbols = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
  };
  return symbols[planetName] || '●';
}


function raDecToEclipticLongitude(ra, dec, planetName) {
 
  const mockLongitudes = {
    'Sun': 128.83,    
    'Moon': 139.04,     
    'Mercury': 109.97, 
    'Venus': 142.80,  
    'Mars': 119.84,   
    'Jupiter': 65.93,  
    'Saturn': 59.34,   
    'Uranus': 319.24,  
    'Neptune': 305.05, 
    'Pluto': 250.20    
  };
  
  return mockLongitudes[planetName] || (Math.random() * 360);
}
  
  function getPlanetSymbol(planetName) {
    const symbols = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Uranus': '♅',
      'Neptune': '♆',
      'Pluto': '♇'
    };
    return symbols[planetName] || planetName.charAt(0);
  }
  
 
  function raDecToEclipticLongitude(raHours, declination, planetName = '') {
    try {
      console.log(`   🌍 Converting ${planetName}: RA=${raHours.toFixed(4)} hours, Dec=${declination.toFixed(4)}°`);
      
      const raDegrees = raHours * 15;
      const epsilon = 23.43928;
      
      console.log(`      RA in degrees: ${raDegrees.toFixed(2)}°`);
      
      const raRad = raDegrees * Math.PI / 180;
      const decRad = declination * Math.PI / 180;
      const epsRad = epsilon * Math.PI / 180;
      
      const sinDec = Math.sin(decRad);
      const cosDec = Math.cos(decRad);
      const sinRa = Math.sin(raRad);
      const cosRa = Math.cos(raRad);
      const sinEps = Math.sin(epsRad);
      const cosEps = Math.cos(epsRad);
      
      const numerator = sinRa * cosEps + Math.tan(decRad) * sinEps;
      const denominator = cosRa;
      
      let lambdaRad = Math.atan2(numerator, denominator);
      let eclipticLong = lambdaRad * 180 / Math.PI;
      
      if (eclipticLong < 0) eclipticLong += 360;
      
      console.log(`      🌟 Ecliptic Longitude: ${eclipticLong.toFixed(2)}°`);
      return eclipticLong;
    } catch (error) {
      console.error('Error in ecliptic conversion:', error);
      return 0;
    }
  }

  function getPlanetSymbol(planetName) {
    const symbols = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Uranus': '♅',
      'Neptune': '♆',
      'Pluto': '♇'
    };
    return symbols[planetName] || planetName.charAt(0);
  }


module.exports = {
  sendDynamicWeeklyReport,
  manualTrigger,
  runCron,
  processWeeklyIntegration,
  getMembers,
  generateWeeklyTransitReport,
  getPlanetaryPositions,
  getAPIPlanetaryPositions,
  getWeeklyPlanetaryPositions,
  getBirthChartPositions,
  compareTransitsWithNatal,
  getWeekDates
};





