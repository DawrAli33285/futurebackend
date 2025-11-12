const compositechart = require("../models/compositechart")
const graph = require("../models/graph")
const mainchart = require("../models/mainchart")
const snyastry = require("../models/snyastry")
const subscription = require("../models/subscription")
const transitchart = require("../models/transitchart")
const multer = require('multer');
const csvParser = require('csv-parser');
const axios=require('axios')
const fs = require('fs');
const path = require('path');

module.exports.saveChart = async (req, res) => {
  let { ...data } = req.body;
  let chart;
  
  try {
      data = {
          ...data,
          userId: req.user._id
      };
      
     
      const [
          mainChartsCount,
          transitChartsCount,
          synastryChartsCount,
          compositeChartsCount,
          graphChartsCount
      ] = await Promise.all([
          mainchart.countDocuments({ userId: req.user._id }),
          transitchart.countDocuments({ userId: req.user._id }),
          snyastry.countDocuments({ userId: req.user._id }),
          compositechart.countDocuments({ userId: req.user._id }),
          graph.countDocuments({ userId: req.user._id })
      ]);
      
   
      const totalChartsSaved = mainChartsCount + 
                               transitChartsCount + 
                               synastryChartsCount + 
                               compositeChartsCount +
                               graphChartsCount;
      
   
      if (totalChartsSaved >= 500) {
          return res.status(400).json({
              error: "Chart limit reached. You can only save up to 500 charts."
          });
      }
      
      if (data.chartname == 'main') {
          chart = await mainchart.create(data);
      } else if (data.chartname == 'synastry') {
          chart = await snyastry.create(data);
      } else if (data.chartname == 'composite') {
          chart = await compositechart.create(data);
      } else if (data.chartname == "graph") {
          chart = await graph.create(data);
      } else {
          chart = await transitchart.create(data);
      }
      
      return res.status(200).json({
          message: "Chart saved successfully",
          chart
      });
  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error while saving Chart"
      });
  }
};

const unflattenObject = (flatObj) => {
  const result = {};
  
  for (let key in flatObj) {
    const keys = key.split('_');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k]) {
        const nextKey = keys[i + 1];
        if (!isNaN(nextKey)) {
          current[k] = [];
        } else {
          current[k] = {};
        }
      }
      current = current[k];
    }
    
    const finalKey = keys[keys.length - 1];
    const value = flatObj[key];
    
    
    if (value === '' || value === null || value === undefined) {
      continue;
    }
    
   
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        const parsed = JSON.parse(value);
        current[finalKey] = parsed;
      } catch (e) {
        current[finalKey] = value;
      }
    } else {
      current[finalKey] = value;
    }
  }
  
  
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      // Keep empty objects in arrays (don't filter them out)
      return obj.map(item => cleanObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const cleaned = {};
      for (let key in obj) {
        const value = cleanObject(obj[key]);
        
        // Keep empty objects, only remove null/undefined
        if (value !== null && value !== undefined) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    }
    return obj;
  };
  
  return cleanObject(result) || {};
};
const cleanupFiles = (files) => {
  if (!files) return;
  
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach(file => {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error('Error deleting file:', error.message);
    }
  });
};

  

  const transformChartData = (chartData, chartType) => {
    const transformed = { ...chartData };
  
    if (chartType === 'graph') {
      if (chartData.form && chartData.form.data) {
        transformed.form_data = {
          startDate: chartData.form.data.startDate,
          endDate: chartData.form.data.endDate,
          startTime: chartData.form.data.startTime,
          endTime: chartData.form.data.endTime,
          timezone: chartData.form.data.timezone,
          chartName: chartData.form.data.chartName,
          location: chartData.form.data.location
        };
        delete transformed.form;
      }
  
      if (chartData.chart && chartData.chart.data) {
        transformed.chart_data = chartData.chart.data;
        delete transformed.chart;
      }
  
      if (chartData.calculation && chartData.calculation.info) {
        const info = chartData.calculation.info;
        transformed.calculation_info = {
          data_points: info.data?.points ? parseInt(info.data.points) : 0,
          time_range_days: info.time?.range?.days ? parseInt(info.time.range.days) : 0,
          time_range: {
            start: info.time?.range?.start,
            end: info.time?.range?.end,
            timezone: info.time?.range?.timezone
          },
          location: {
            name: info.location?.name,
            coordinates: {
              latitude: info.location?.coordinates?.latitude ? 
                parseFloat(info.location.coordinates.latitude) : 0,
              longitude: info.location?.coordinates?.longitude ? 
                parseFloat(info.location.coordinates.longitude) : 0
            },
            fullAddress: info.location?.fullAddress
          },
          generated_at: info.generated?.at,
          planets_tracked: info.planets?.tracked || []
        };
        delete transformed.calculation;
      }
  
      if (!transformed.chart_type) {
        transformed.chart_type = "Transit Graph";
      }
    }
  
    delete transformed._id;
    delete transformed.__v;
    delete transformed.created_at;
    delete transformed.updated_at;
    delete transformed.created;
    delete transformed.updated;
  
    return transformed;
  };
  


  module.exports.importChart = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "No files uploaded"
        });
      }
  
      const [
        mainChartsCount,
        transitChartsCount,
        synastryChartsCount,
        compositeChartsCount,
        graphChartsCount
      ] = await Promise.all([
        mainchart.countDocuments({ userId: req.user._id }),
        transitchart.countDocuments({ userId: req.user._id }),
        snyastry.countDocuments({ userId: req.user._id }),
        compositechart.countDocuments({ userId: req.user._id }),
        graph.countDocuments({ userId: req.user._id })
      ]);
  
      const currentTotalCharts = mainChartsCount + 
                                 transitChartsCount + 
                                 synastryChartsCount + 
                                 compositeChartsCount +
                                 graphChartsCount;
  
      const results = {
        success: 0,
        failed: 0,
        errors: [],
        details: []
      };
  
      for (const file of req.files) {
        const fileResult = {
          filename: file.originalname,
          success: 0,
          failed: 0
        };
  
        try {
          const charts = [];
  
          await new Promise((resolve, reject) => {
            fs.createReadStream(file.path)
              .pipe(csvParser())
              .on('data', (row) => {
                try {
                  const unflattenedRow = unflattenObject(row);
                   
                  if (unflattenedRow.person1?.birth?.info) {
                    unflattenedRow.person1.birth_info = unflattenedRow.person1.birth.info;
                    delete unflattenedRow.person1.birth;
                  }
                  
                  if (unflattenedRow.person2?.birth?.info) {
                    unflattenedRow.person2.birth_info = unflattenedRow.person2.birth.info;
                    delete unflattenedRow.person2.birth;
                  }
          
                
                  if (unflattenedRow.birth?.info) {
                    unflattenedRow.birth_info = unflattenedRow.birth.info;
                    delete unflattenedRow.birth;
                  }
                  
                 
                  if (unflattenedRow.birth?.Info) {
                    unflattenedRow.birthInfo = unflattenedRow.birth.Info;
                    delete unflattenedRow.birth;
                  }
          
                  if (unflattenedRow.aspects) {
                    if (unflattenedRow.aspects.natal?.to || unflattenedRow.aspects.progressed?.to) {
                      unflattenedRow.aspects = {
                        natal_to_progressed: unflattenedRow.aspects.natal?.to?.progressed || [],
                        natal_to_transit: unflattenedRow.aspects.natal?.to?.transit || [],
                        progressed_to_transit: unflattenedRow.aspects.progressed?.to?.transit || []
                      };
                    }
                  }
          
                  charts.push(unflattenedRow);
                } catch (error) {
                  console.error('Error parsing row:', error.message);
                }
              })
              .on('end', resolve)
              .on('error', reject);
          });
  
          for (let i = 0; i < charts.length; i++) {
            try {
              let chartData = charts[i];
  
              if (!chartData || Object.keys(chartData).length === 0) {
                continue;
              }
  
              const totalChartsAfterImport = currentTotalCharts + results.success;
              if (totalChartsAfterImport >= 500) {
                fileResult.failed++;
                results.failed++;
                results.errors.push(`Row ${i + 1}: Chart limit reached. You can only save up to 500 charts.`);
              return res.status(400).json({
                error:"Chart limit reached"
              })
                continue;
              }
  
              const chartType = chartData.chartname ? chartData.chartname.toLowerCase() : null;
  
              if (!chartType) {
                fileResult.failed++;
                results.failed++;
                results.errors.push(`Row ${i + 1}: Missing chartname field`);
                continue;
              }
  
             
              chartData = transformChartData(chartData, chartType);
              if (chartType === 'graph') {
                chartData = transformChartData(chartData, chartType);
              }
              const { chartname, ...cleanData } = chartData;
  
              const data = {
                ...cleanData,
                userId: req.user._id
              };
  
              console.log("DATA TO BE IMPORTED");
              console.log(JSON.stringify(data, null, 2));
  
              if (chartType === 'composite') {
                if (!data.person1 && !data.person2 && !data.composite) {
                  fileResult.failed++;
                  results.failed++;
                  results.errors.push(`Row ${i + 1}: Composite chart missing person1, person2, or composite data`);
                  continue;
                }
  
                if (!data.chart_type) {
                  data.chart_type = "Composite (Two Person)";
                }
              }
  
              let chart;
              if (chartType === 'main') {
                chart = await mainchart.create(data);
              } else if (chartType === 'synastry') {
                chart = await snyastry.create(data);
              } else if (chartType === 'composite') {
                chart = await compositechart.create(data);
              } else if (chartType === 'transit') {
                chart = await transitchart.create(data);
              } else if (chartType === 'graph') {
                chart = await graph.create(data);
              } else {
                fileResult.failed++;
                results.failed++;
                results.errors.push(`Row ${i + 1}: Invalid chart type '${chartType}'`);
                continue;
              }
  
              fileResult.success++;
              results.success++;
            } catch (error) {
              fileResult.failed++;
              results.failed++;
              results.errors.push(`Row ${i + 1}: ${error.message}`);
              console.error(`Error importing chart at row ${i + 1}:`, error.message);
            }
          }
  
          results.details.push(fileResult);
  
        } catch (error) {
          results.errors.push(`Error processing file ${file.originalname}: ${error.message}`);
          console.error('File processing error:', error.message);
        }
      }
  
      cleanupFiles(req.files);
  
      const statusCode = results.success > 0 ? 200 : 400;
  
      return res.status(statusCode).json({
        message: results.success > 0 
          ? `Import completed: ${results.success} successful, ${results.failed} failed`
          : "Import failed",
        results
      });
    } catch (error) {
      if (req.files) {
        cleanupFiles(req.files);
      }
  
      return res.status(500).json({
        error: "Error while importing charts",
        details: error.message
      });
    }
  };

  module.exports.getMainChart=async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const charts = await mainchart.find({userId:req.user._id})
            .skip(skip)
            .limit(limit)
            .sort({createdAt: -1}); 
        
        const totalCharts = await mainchart.countDocuments({userId:req.user._id});
        const hasMore = skip + charts.length < totalCharts;
        
        let subscriptionData = await subscription.findOne({userId:req.user._id,status:{$ne:'canceled'}})
        
        return res.status(200).json({
            charts,
            subscription:subscriptionData,
            hasMore,
            currentPage: page,
            totalPages: Math.ceil(totalCharts / limit)
        })
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error while trying to fetch saved main charts"
        })
    }
}





module.exports.getTransitChart=async(req,res)=>{
    try{
let charts=await transitchart.find({userId:req.user._id})
let subscriptionData=await subscription.findOne({userId:req.user._id,status:{$ne:'canceled'}})
return res.status(200).json({
charts
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error while trying to fetch saved transit charts"
        })
    }
}



module.exports.getCompositeChart=async(req,res)=>{
  try{
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const charts = await compositechart.find({userId:req.user._id})
          .skip(skip)
          .limit(limit)
          .sort({createdAt: -1}); 
      
      const totalCharts = await compositechart.countDocuments({userId:req.user._id});
      const hasMore = skip + charts.length < totalCharts;
      
      let subscriptionData = await subscription.findOne({userId:req.user._id,status:{$ne:'canceled'}})
      
      return res.status(200).json({
          charts,
          subscription: subscriptionData,
          hasMore,
          currentPage: page,
          totalPages: Math.ceil(totalCharts / limit)
      })
  }catch(e){
      console.log(e.message)
      return res.status(400).json({
          error:"Error while trying to fetch saved composite charts"
      })
  }
}



module.exports.getSynastryChart=async(req,res)=>{
  try{
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const charts = await snyastry.find({userId:req.user._id})
          .skip(skip)
          .limit(limit)
          .sort({createdAt: -1}); 
      
      const totalCharts = await snyastry.countDocuments({userId:req.user._id});
      const hasMore = skip + charts.length < totalCharts;
      
      let subscriptionData = await subscription.findOne({userId:req.user._id,status:{$ne:'canceled'}})
      
      return res.status(200).json({
          charts,
          subscription: subscriptionData,
          hasMore,
          currentPage: page,
          totalPages: Math.ceil(totalCharts / limit)
      })
  }catch(e){
      console.log(e.message)
      return res.status(400).json({
          error:"Error while trying to fetch saved synastry charts"
      })
  }
}


module.exports.getTransitGraph=async(req,res)=>{
  try{
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const charts = await graph.find({userId:req.user._id})
          .skip(skip)
          .limit(limit)
          .sort({createdAt: -1}); 
      
      const totalCharts = await graph.countDocuments({userId:req.user._id});
      const hasMore = skip + charts.length < totalCharts;
      
      let subscriptionData = await subscription.findOne({userId:req.user._id,status:{$ne:'canceled'}})
      
      return res.status(200).json({
          charts,
          subscription: subscriptionData,
          hasMore,
          currentPage: page,
          totalPages: Math.ceil(totalCharts / limit)
      })
  }catch(e){
      console.log(e.message)
      return res.status(400).json({
          error:"Error while trying to fetch saved transit graphs"
      })
  }
}

module.exports.deleteAllCharts = async (req, res) => {
  try {
   
      await Promise.all([
          mainchart.deleteMany({ userId: req.user._id }),
          transitchart.deleteMany({ userId: req.user._id }),
          snyastry.deleteMany({ userId: req.user._id }),
          compositechart.deleteMany({ userId: req.user._id }),
          graph.deleteMany({ userId: req.user._id })
      ]);

      return res.status(200).json({
          message: "Charts deleted successfully"
      });
  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error while trying to delete charts"
      });
  }
};






module.exports.deleteMainChart = async (req, res) => {
  let {id}=req.params;
  try {
  
      await Promise.all([
          mainchart.findByIdAndDelete(id),
       
      ]);

      return res.status(200).json({
          message: "Main chart deleted successfully"
      });
  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error while trying to delete chart"
      });
  }
};




module.exports.deleteCompositeChart = async (req, res) => {
  let {id}=req.params;
  try {
  
      await Promise.all([
          compositechart.findByIdAndDelete(id),
       
      ]);

      return res.status(200).json({
          message: "Composite chart deleted successfully"
      });
  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error while trying to delete chart"
      });
  }
};





module.exports.deleteTransitChart = async (req, res) => {
  let {id}=req.params;
  try {
  
      await Promise.all([
          transitchart.findByIdAndDelete(id),
       
      ]);

      return res.status(200).json({
          message: "Transit chart deleted successfully"
      });
  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error while trying to delete chart"
      });
  }
};



module.exports.deleteSynastryChart = async (req, res) => {
  let {id}=req.params;
  try {
  
      await Promise.all([
          snyastry.findByIdAndDelete(id),
       
      ]);

      return res.status(200).json({
          message: "Main synastry deleted successfully"
      });
  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error while trying to delete chart"
      });
  }
};

module.exports.getTimeZone = async (req, res) => {
  try {
    const response = await axios.get('https://worldtimeapi.org/api/timezone');
    
    const timezones = response.data;
    
    return res.status(200).json({
      success: true,
      timezones: timezones
    });
  } catch (e) {
    console.log('Timezone fetch error:', e.message);
    
    // Fallback timezone list
    const fallbackTimezones = [
      'UTC',
      'Asia/Karachi',
      'America/New_York',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Australia/Sydney',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'Europe/Berlin',
      'Europe/Madrid',
      'Asia/Dubai',
      'Asia/Singapore',
      'Asia/Hong_Kong',
      'Australia/Melbourne',
      'Pacific/Auckland',
      'America/Toronto',
      'America/Mexico_City',
      'America/Buenos_Aires'
    ];
    
    return res.status(200).json({
      success: true,
      timezones: fallbackTimezones
    });
  }
};


module.exports.deleteTransitGraph = async (req, res) => {
  let {id}=req.params;
  try {
  
      await Promise.all([
          graph.findByIdAndDelete(id),
       
      ]);

      return res.status(200).json({
          message: "Transit graph deleted successfully"
      });
  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error while trying to delete chart"
      });
  }
};