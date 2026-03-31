const cron = require('node-cron');
const nodemailer = require('nodemailer');
const axios = require('axios');
const newsletterModel = require('../models/newsletter');


const zodiacConstellations = [
  { name: 'Aries', startDegree: 25.95, endDegree: 53.48, symbol: '♈', dates: 'Mar 21 - Apr 20' },
  { name: 'Taurus', startDegree: 53.48, endDegree: 90.44, symbol: '♉', dates: 'Apr 21 - May 21' },
  { name: 'Gemini', startDegree: 90.44, endDegree: 118.21, symbol: '♊', dates: 'May 22 - Jun 21' },
  { name: 'Cancer', startDegree: 118.21, endDegree: 138.14, symbol: '♋', dates: 'Jun 22 - Jul 22' },
  { name: 'Leo', startDegree: 138.14, endDegree: 174.17, symbol: '♌', dates: 'Jul 23 - Aug 22' },
  { name: 'Virgo', startDegree: 174.17, endDegree: 217.81, symbol: '♍', dates: 'Aug 23 - Sep 22' },
  { name: 'Libra', startDegree: 217.81, endDegree: 241.08, symbol: '♎', dates: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', startDegree: 241.08, endDegree: 247.99, symbol: '♏', dates: 'Oct 23 - Nov 21' },
  { name: 'Ophiuchus', startDegree: 247.99, endDegree: 266.62, symbol: '⛎', dates: 'Nov 22 - Dec 21' },
  { name: 'Sagittarius', startDegree: 266.62, endDegree: 299.69, symbol: '♐', dates: 'Dec 22 - Jan 19' },
  { name: 'Capricorn', startDegree: 299.69, endDegree: 327.84, symbol: '♑', dates: 'Jan 20 - Feb 16' },
  { name: 'Aquarius', startDegree: 327.84, endDegree: 351.59, symbol: '♒', dates: 'Feb 17 - Mar 11' },
  { name: 'Pisces', startDegree: 351.59, endDegree: 360.00, symbol: '♓', dates: 'Mar 12 - Mar 20' }
];

const moodEnhancements = {
  'Relaxed': { energy: 'Calm', advice: 'Take time to unwind and recharge' },
  'Happy': { energy: 'Joyful', advice: 'Share your positivity with others' },
  'Energetic': { energy: 'Dynamic', advice: 'Channel your energy into productive projects' },
  'Thoughtful': { energy: 'Reflective', advice: 'Trust your inner wisdom' },
  'Adventurous': { energy: 'Exploratory', advice: 'Embrace new experiences' },
  'Romantic': { energy: 'Loving', advice: 'Connect deeply with loved ones' },
  'Focused': { energy: 'Determined', advice: 'Stay committed to your goals' },
  'Creative': { energy: 'Inspired', advice: 'Express your unique vision' }
};

const compatibilityDetails = {
  'Aries': { match: 'Libra', reason: 'Balancing energies create harmony' },
  'Taurus': { match: 'Scorpio', reason: 'Deep emotional connection' },
  'Gemini': { match: 'Sagittarius', reason: 'Intellectual and adventurous bond' },
  'Cancer': { match: 'Capricorn', reason: 'Emotional and practical balance' },
  'Leo': { match: 'Aquarius', reason: 'Creative and innovative partnership' },
  'Virgo': { match: 'Pisces', reason: 'Practical and spiritual alignment' },
  'Libra': { match: 'Aries', reason: 'Dynamic and complementary energies' },
  'Scorpio': { match: 'Taurus', reason: 'Intense and transformative connection' },
  'Ophiuchus': { match: 'Gemini', reason: 'Mystical and communicative bond' },
  'Sagittarius': { match: 'Gemini', reason: 'Adventurous and intellectual synergy' },
  'Capricorn': { match: 'Cancer', reason: 'Ambitious and nurturing partnership' },
  'Aquarius': { match: 'Leo', reason: 'Visionary and expressive union' },
  'Pisces': { match: 'Virgo', reason: 'Dreamy and grounded combination' }
};


async function getAztroHoroscope(constellation, day = 'today') {
  try {
    const response = await axios.post(`https://aztro.sameerkumar.website/?sign=${constellation.toLowerCase()}&day=${day}`);
    
    if (response.data) {
      return {
        success: true,
        data: {
          ...response.data,
          constellation: constellation,
          symbol: getConstellationDetails(constellation).symbol,
          date_range: getConstellationDetails(constellation).dates
        }
      };
    }
  } catch (error) {
    console.error(`Aztro API error for ${constellation}:`, error.message);
    return {
      success: false,
      error: error.message,
      data: await generateFallbackHoroscope(constellation)
    };
  }
}

/**
 * Generate fallback horoscope if API fails
 */
async function generateFallbackHoroscope(constellation) {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const seed = dayOfYear + constellation.charCodeAt(0);
  
  const pseudoRandom = (index) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const moods = Object.keys(moodEnhancements);
  const colors = ['Spring Green', 'Royal Blue', 'Sunset Orange', 'Mystic Purple', 'Crystal White', 'Golden Yellow', 'Silver Gray', 'Ruby Red'];
  const times = ['7am', '2pm', '10am', '6pm', '12pm', '3pm', '8am', '11pm'];

  return {
    current_date: today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    compatibility: Object.keys(compatibilityDetails)[Math.floor(pseudoRandom(1) * 13)],
    lucky_time: times[Math.floor(pseudoRandom(2) * times.length)],
    lucky_number: Math.floor(pseudoRandom(3) * 100).toString(),
    color: colors[Math.floor(pseudoRandom(4) * colors.length)],
    date_range: getConstellationDetails(constellation).dates,
    mood: moods[Math.floor(pseudoRandom(5) * moods.length)],
    description: generateHoroscopeDescription(constellation, moods[Math.floor(pseudoRandom(5) * moods.length)]),
    constellation: constellation,
    symbol: getConstellationDetails(constellation).symbol
  };
}

/**
 * Generate horoscope description based on constellation and mood
 */
function generateHoroscopeDescription(constellation, mood) {
  const descriptions = {
    Aries: [
      "Your fiery energy is perfect for taking the lead today. Don't hesitate to start new projects or express your innovative ideas.",
      "Channel your natural courage into overcoming obstacles. Your determination will inspire those around you.",
      "This is a day for action and initiative. Trust your instincts and move forward with confidence."
    ],
    Taurus: [
      "Your practical nature brings stability to any situation. Focus on creating beauty and comfort in your surroundings.",
      "Patience is your superpower today. Good things come to those who wait and work steadily toward their goals.",
      "Indulge your senses and appreciate life's simple pleasures. Your grounded energy is a gift to others."
    ],
    Gemini: [
      "Your curiosity opens new doors today. Engage in stimulating conversations and explore different perspectives.",
      "Communication flows easily for you now. Share your ideas and connect with interesting people.",
      "Your adaptable nature helps you navigate changing circumstances with grace and intelligence."
    ],
    Cancer: [
      "Your emotional intelligence is heightened today. Nurture your relationships and create a cozy home environment.",
      "Trust your intuition—it's guiding you in the right direction. Your caring nature makes others feel safe.",
      "Focus on emotional security and meaningful connections. Your sensitivity is your strength."
    ],
    Leo: [
      "Your creative energy shines brightly today. Express yourself boldly and share your unique talents.",
      "Leadership comes naturally to you now. Inspire others with your confidence and generosity.",
      "This is your time to shine! Don't hide your light—your enthusiasm is contagious and uplifting."
    ],
    Virgo: [
      "Your attention to detail helps you excel in everything you do. Organize and improve your environment.",
      "Service to others brings you fulfillment today. Your practical help is deeply appreciated.",
      "Focus on health and wellness. Your analytical mind finds solutions that others might miss."
    ],
    Libra: [
      "Harmony and balance are your priorities today. Create beauty and foster peaceful relationships.",
      "Your diplomatic skills smooth over any conflicts. You see all sides of every situation clearly.",
      "Partnerships flourish under your caring attention. Your sense of fairness guides you well."
    ],
    Scorpio: [
      "Your intensity reveals hidden truths today. Trust your ability to see beneath the surface.",
      "Transformation is your theme. Let go of what no longer serves you and embrace positive change.",
      "Your magnetic energy draws people to you. Use your insight to help others understand themselves."
    ],
    Ophiuchus: [
      "Your healing energy brings comfort to those around you. Share your wisdom and compassion.",
      "Mystery and discovery await you. Explore spiritual topics and uncover hidden knowledge.",
      "Your unique perspective helps solve complex problems. Embrace your role as a guide and healer."
    ],
    Sagittarius: [
      "Adventure calls you today. Expand your horizons through learning or travel.",
      "Your optimism lifts everyone's spirits. Share your philosophical insights and big ideas.",
      "Freedom is essential for your happiness. Explore new possibilities with an open mind."
    ],
    Capricorn: [
      "Your ambition drives you toward success. Practical steps today build a solid foundation for tomorrow.",
      "Discipline and responsibility pay off now. Your hard work is noticed and appreciated.",
      "Long-term goals come into focus. Your steady progress inspires confidence in others."
    ],
    Aquarius: [
      "Your innovative ideas could change the world today. Think outside the box and share your vision.",
      "Friendship and community are highlighted. Your unique perspective brings people together.",
      "Humanitarian causes resonate with you. Use your intellect to solve social problems."
    ],
    Pisces: [
      "Your imagination knows no bounds today. Creative and spiritual pursuits fulfill you deeply.",
      "Compassion flows through you. Your empathetic nature comforts those in need.",
      "Dreams and intuition guide you accurately. Trust the messages from your subconscious."
    ]
  };

  const constellationDescs = descriptions[constellation] || descriptions.Aries;
  return constellationDescs[Math.floor(Math.random() * constellationDescs.length)];
}

/**
 * Enhance Aztro data with additional insights
 */
function enhanceHoroscopeData(aztroData) {
  const moodData = moodEnhancements[aztroData.mood] || moodEnhancements.Relaxed;
  const compatibilityData = compatibilityDetails[aztroData.compatibility.trim()] || compatibilityDetails.Aries;
  
  return {
    ...aztroData,
    enhanced: {
      energy: moodData.energy,
      advice: moodData.advice,
      compatibility_match: compatibilityData.match,
      compatibility_reason: compatibilityData.reason,
      intensity: calculateIntensity(aztroData.mood),
      lucky_element: getLuckyElement(aztroData.color)
    }
  };
}

/**
 * Calculate daily intensity based on mood
 */
function calculateIntensity(mood) {
  const intensityMap = {
    'Energetic': 85,
    'Adventurous': 80,
    'Happy': 75,
    'Focused': 70,
    'Creative': 65,
    'Romantic': 60,
    'Thoughtful': 55,
    'Relaxed': 45
  };
  return intensityMap[mood] || 60;
}

/**
 * Get lucky element based on color
 */
function getLuckyElement(color) {
  const elementMap = {
    'Spring Green': 'Earth',
    'Royal Blue': 'Water',
    'Sunset Orange': 'Fire',
    'Mystic Purple': 'Air',
    'Crystal White': 'Spirit',
    'Golden Yellow': 'Fire',
    'Silver Gray': 'Metal',
    'Ruby Red': 'Fire'
  };
  return elementMap[color] || 'Spirit';
}

/**
 * Generate beautiful HTML horoscope email
 */
async function newsletterEmailGenerateHoroscopeHTML(constellation, date) {
  const horoscopeResponse = await getAztroHoroscope(constellation);
  const horoscopeData = enhanceHoroscopeData(horoscopeResponse.data);
  const constellationDetails = getConstellationDetails(constellation);
  
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Georgia', serif; 
          line-height: 1.8; 
          color: #333; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .constellation-name {
          font-size: 2.5em;
          font-weight: bold;
          margin: 10px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .symbol {
          font-size: 2em;
          margin-right: 10px;
        }
        .date {
          font-size: 0.9em;
          opacity: 0.9;
        }
        .date-range {
          font-size: 0.85em;
          opacity: 0.8;
          margin-top: 5px;
        }
        .energy-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 8px 15px;
          border-radius: 20px;
          margin-top: 10px;
          font-size: 0.9em;
        }
        .content {
          padding: 30px;
        }
        .horoscope-message {
          font-size: 1em;
          line-height: 1.8;
          margin: 20px 0;
          color: #555;
          text-align: justify;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .insights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .insight-card {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .insight-label {
          font-size: 0.8em;
          color: #666;
          margin-bottom: 5px;
        }
        .insight-value {
          font-size: 1.1em;
          font-weight: bold;
          color: #333;
        }
        .compatibility-section {
          background: #fff0f5;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 2px solid #ff69b4;
        }
        .lucky-section {
          background: #fff9e6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 2px solid #ffd700;
        }
        .lucky-title {
          font-weight: bold;
          color: #ff8c00;
          margin-bottom: 10px;
          font-size: 1.1em;
        }
        .lucky-items {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
        }
        .lucky-item {
          text-align: center;
          margin: 10px;
        }
        .lucky-item-value {
          font-size: 1.2em;
          font-weight: bold;
          color: #333;
        }
        .lucky-item-label {
          font-size: 0.8em;
          color: #666;
        }
        .advice-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .intensity-meter {
          height: 8px;
          background: #eee;
          border-radius: 4px;
          margin: 10px 0;
          overflow: hidden;
        }
        .intensity-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #FFC107, #F44336);
        }
        .footer {
          background: #f5f5f5;
          padding: 15px;
          text-align: center;
          font-size: 0.85em;
          color: #999;
          border-top: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="date">${dateStr}</div>
          <div class="constellation-name">
            <span class="symbol">${constellationDetails.symbol}</span> ${constellation}
          </div>
          <div class="date-range">${horoscopeData.date_range}</div>
          <div class="energy-badge">
            🌟 ${horoscopeData.enhanced.energy} Energy • ${horoscopeData.mood}
          </div>
        </div>
        
        <div class="content">
          <div class="horoscope-message">
            ${horoscopeData.description}
          </div>

          <div class="insights-grid">
            <div class="insight-card">
              <div class="insight-label">Current Date</div>
              <div class="insight-value">${horoscopeData.current_date}</div>
            </div>
            <div class="insight-card">
              <div class="insight-label">Lucky Element</div>
              <div class="insight-value">${horoscopeData.enhanced.lucky_element}</div>
            </div>
          </div>

          <div class="intensity-meter">
            <div class="intensity-fill" style="width: ${horoscopeData.enhanced.intensity}%"></div>
          </div>
          <div style="text-align: center; font-size: 0.9em; color: #666;">
            Daily Energy Intensity: ${horoscopeData.enhanced.intensity}%
          </div>

          <div class="compatibility-section">
            <div class="lucky-title">💞 Cosmic Compatibility</div>
            <div style="text-align: center;">
              <strong>${horoscopeData.compatibility}</strong> - ${horoscopeData.enhanced.compatibility_reason}
            </div>
            <div style="text-align: center; margin-top: 10px; font-size: 0.9em;">
              Best Match: ${horoscopeData.enhanced.compatibility_match}
            </div>
          </div>

          <div class="lucky-section">
            <div class="lucky-title">✨ Lucky Elements Today</div>
            <div class="lucky-items">
              <div class="lucky-item">
                <div class="lucky-item-value" style="color: ${horoscopeData.color};">●</div>
                <div class="lucky-item-label">Color</div>
                <div class="lucky-item-value">${horoscopeData.color}</div>
              </div>
              <div class="lucky-item">
                <div class="lucky-item-value">🔢</div>
                <div class="lucky-item-label">Number</div>
                <div class="lucky-item-value">${horoscopeData.lucky_number}</div>
              </div>
              <div class="lucky-item">
                <div class="lucky-item-value">⏰</div>
                <div class="lucky-item-label">Time</div>
                <div class="lucky-item-value">${horoscopeData.lucky_time}</div>
              </div>
            </div>
          </div>

          <div class="advice-section">
            <strong>💫 Cosmic Advice:</strong><br>
            ${horoscopeData.enhanced.advice}
          </div>
        </div>

        <div class="footer">
          <strong>Authentic Daily Horoscope</strong><br>
          Powered by Aztro API • Accurate Constellation Dates<br>
          <small>Your personal celestial guidance for ${dateStr}</small>
        </div>
      </div>
    </body>
    </html>
  `;
}


function getConstellationDetails(constellation) {
  return zodiacConstellations.find(c => c.name.toLowerCase() === constellation.toLowerCase()) || zodiacConstellations[0];
}


async function newsletterEmailSendHoroscope(member) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'lemightyeagle@gmail.com',
        pass: process.env.EMAIL_PASS || 'uhrkgdguezzjduul'
      }
    });

    const constellations = zodiacConstellations.map(z => z.name);
    const constellation = member.constellation || constellations[Math.floor(Math.random() * constellations.length)];
    
    const horoscopeHTML = await newsletterEmailGenerateHoroscopeHTML(constellation, new Date());

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: member.email,
      subject: `🌙 Your ${constellation} Daily Horoscope - ${new Date().toLocaleDateString()}`,
      html: horoscopeHTML
    });

    await newsletterModel.findByIdAndUpdate(member._id, { 
      emailSentOn: new Date(),
      lastConstellation: constellation
    }, { new: true });

    return true;
  } catch (error) {
    console.error('Error sending horoscope email:', error);
    return false;
  }
}

/**
 * Send daily horoscopes to all subscribed members
 */
async function newsletterEmailSendDaily() {
  try {
    const members = await newsletterModel.find({});
    console.log(`Sending daily horoscopes to ${members.length} members...`);
    
    const results = await Promise.allSettled(
      members.map(member => newsletterEmailSendHoroscope(member))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - successful;
    
    console.log(`Horoscope emails sent: ${successful} successful, ${failed} failed`);
    return { successful, failed, total: results.length };
  } catch (error) {
    console.error('Error in newsletterEmailSendDaily:', error);
    throw error;
  }
}

/**
 * Manual trigger for sending horoscopes
 */
async function newsletterEmailManualTrigger() {
  console.log('Manual horoscope email trigger initiated...');
  return await newsletterEmailSendDaily();
}


function newsletterEmailRunCron() {
 
  cron.schedule('0 8 * * *', async () => {
    console.log('Running scheduled horoscope email job...');
    try {
      await newsletterEmailSendDaily();
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
  
  console.log('Horoscope email cron job scheduled for 8:00 AM daily');
}


module.exports = {
  newsletterEmailSendDaily,
  newsletterEmailManualTrigger,
  newsletterEmailRunCron,
  newsletterEmailSendHoroscope,
  newsletterEmailGenerateHoroscopeHTML,
  getAztroHoroscope,
  zodiacConstellations
};