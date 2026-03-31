const express = require('express');
const app = express();
const cors = require('cors');
const server = require('http').createServer(app);
require('dotenv').config();
const connection = require('./connection/connection');
const {runCron,manualTrigger}=require('./util/weeklyemail')
const {newsletterEmailManualTrigger,newsletterEmailRunCron}=require('./util/dailyemail')


app.use(cors());


const webhookRoute = require('./routes/webhook');
app.use('/api',webhookRoute);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connection;

const authRoutes = require('./routes/auth');
const calculatorRoutes = require('./routes/calculator');
const astrologySettingsRoutes = require('./routes/astrologySettings');
const messagesRoutes = require('./routes/messages');
const subscriptionRoutes = require('./routes/subscription');
const chartRoutes=require('./routes/chart')
const accountRoutes=require('./routes/account')
const contactRoutes=require('./routes/contact')


app.use('/api',authRoutes);
app.use('/api',calculatorRoutes);
app.use('/api',astrologySettingsRoutes);
app.use('/api',messagesRoutes);
app.use('/api',subscriptionRoutes);
app.use('/api',chartRoutes)
app.use('/api',accountRoutes)
app.use('/api',contactRoutes)

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on("messageSend", (data) => {
    console.log('messageSend');
    console.log(data);
    io.emit("messageSend", data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


runCron();


newsletterEmailRunCron()

// manualTrigger();
//newsletterEmailManualTrigger()


const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to PORT ${PORT}`);
});
