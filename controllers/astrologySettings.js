const AstrologySettings = require('../models/astrologySettings')



const getActiveSettings = async (req, res) => {
  try {
    let settings = await AstrologySettings.findOne({ userId: req.user._id});
    
  
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { settingsName } = req.body;

    const existingSettings = await AstrologySettings.findOne({
      userId: userId,
      settingsName: settingsName
    });

    if (existingSettings) {
     
      const updatedSettings = await AstrologySettings.findByIdAndUpdate(
        existingSettings._id,
        {
          $set: {
         
            zodiacSystem: req.body.zodiacSystem,
            houseSystem: req.body.houseSystem,
            coordinateSystem: req.body.coordinateSystem,
            
           
            trueSiderealSettings: req.body.trueSiderealSettings,
            
           
            wheelSettings: req.body.wheelSettings,
            
          
            aspects: req.body.aspects,
            
           
            graphSettings: req.body.graphSettings,
            
          
            graphAspects: req.body.graphAspects,
            
           
            ophiuchusSettings: req.body.ophiuchusSettings,
            
        
            reportSettings: req.body.reportSettings,
            
            
            subscriptionSettings: req.body.subscriptionSettings,
         
            settingsName: req.body.settingsName,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );
      return res.status(200).json({ 
        success: true, 
        data: updatedSettings, 
        message: 'Settings updated successfully' 
      });
    }

    const settingsCount = await AstrologySettings.countDocuments({ userId: userId });
    if (settingsCount >= 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum of 10 settings allowed per user' 
      });
    }

  
    const newSettings = new AstrologySettings({
      userId: userId,
      settingsName: req.body.settingsName,
      
     
      zodiacSystem: req.body.zodiacSystem,
      houseSystem: req.body.houseSystem,
      coordinateSystem: req.body.coordinateSystem,
      
     
      trueSiderealSettings: req.body.trueSiderealSettings,
      
    
      wheelSettings: req.body.wheelSettings,
      
    
      aspects: req.body.aspects,
      
     
      graphSettings: req.body.graphSettings,
      
     
      graphAspects: req.body.graphAspects,
      
      
      ophiuchusSettings: req.body.ophiuchusSettings,
      
     
      reportSettings: req.body.reportSettings,
      
      
      subscriptionSettings: req.body.subscriptionSettings,
      
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newSettings.save();
    res.status(201).json({ 
      success: true, 
      data: newSettings, 
      message: 'Settings created successfully' 
    });
  } catch (error) {
    console.log('Error creating/updating settings:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    
  
    const settings = await AstrologySettings.findOne({ userId: userId })
      .sort({ updatedAt: -1 });

    if (!settings) {
      return res.status(404).json({ 
        success: false, 
        message: 'No settings found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: settings 
    });
  } catch (error) {
    console.log('Error fetching settings:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { settingsId } = req.params;
   
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });
    
    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const activateSettings = async (req, res) => {
  try {
    const { settingsId } = req.params;
    
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    await settings.activate();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteSettings = async (req, res) => {
  try {
    const { settingsId } = req.params;
    
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
   
    const count = await AstrologySettings.countDocuments({ userId: req.user._id });
    if (count === 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete the last settings. Create a new one first.' 
      });
    }
    
    
    if (settings.isActive) {
      const anotherSettings = await AstrologySettings.findOne({ 
        userId: req.user._id, 
        _id: { $ne: settingsId } 
      });
      if (anotherSettings) {
        await anotherSettings.activate();
      }
    }
    
    await AstrologySettings.deleteOne({ _id: settingsId });
    res.status(200).json({ success: true, message: 'Settings deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateWheelPlanets = async (req, res) => {
  try {
    const { settingsId } = req.params;
    
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    settings.wheelPlanets = { ...settings.wheelPlanets, ...req.body };
    await settings.save();
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateWheelAspects = async (req, res) => {
  try {
    const { settingsId } = req.params;
    
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    settings.wheelAspects = { ...settings.wheelAspects, ...req.body };
    await settings.save();
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateGraphPlanets = async (req, res) => {
  try {
    const { settingsId } = req.params;
    
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    settings.graphPlanets = { ...settings.graphPlanets, ...req.body };
    await settings.save();
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateGraphAspects = async (req, res) => {
  try {
    const { settingsId } = req.params;
    
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    settings.graphAspects = { ...settings.graphAspects, ...req.body };
    await settings.save();
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateGraphTypes = async (req, res) => {
  try {
    const { settingsId } = req.params;
    
    const settings = await AstrologySettings.findOne({ 
      _id: settingsId, 
      userId: req.user._id 
    });
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    settings.graphTypes = { ...settings.graphTypes, ...req.body };
    await settings.save();
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserSettings,
  getActiveSettings,
  createSettings,
  updateSettings,
  activateSettings,
  deleteSettings,
  updateWheelPlanets,
  updateWheelAspects,
  updateGraphPlanets,
  updateGraphAspects,
  updateGraphTypes
};