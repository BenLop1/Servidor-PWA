const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Conexión con MongoDB utilizando Mongoose
mongoose.connect("mongodb+srv://PWA:shotingstar123@cluster0.murmd.mongodb.net/kiwi?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Definir un modelo de actividad de usuario utilizando Mongoose
const SyslogSchema = new mongoose.Schema({
  MsgDate: Date,
  MsgTime: Date,
  MsgPriority: String,
  MsgHostname:String,
  MsgText:String,
  MsgUser:String
});

const DispositivosSchema = new mongoose.Schema({
  pc_name: String,
  mouse_connected: Boolean,
  keyboard_connected: Boolean,
  speakers_connected:Boolean,
  monitor_connected:Boolean,
  
});

const Syslog = mongoose.model('Syslog', SyslogSchema, 'Syslog');
const Dispositivos = mongoose.model('Dispositivos', DispositivosSchema, 'Dispositivos');

// Configurar body-parser para manejar solicitudes POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Obtener una lista de actividades de usuario
app.get('/activities', async (req, res) => {
  try {
    const activities = await Syslog.find();
    console.log('Actividades:', activities);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener actividades de un usuario específico
app.get('/activities/:MsgPriority', async (req, res) => {
  try {
    const activities = await Syslog.find({ MsgPriority: req.params.MsgPriority }).sort({ _id: -1 }).limit(30).lean();
    const formattedActivities = activities.map(activity => {
      return {
        ...activity,
        Date: activity.Date?.toLocaleString()
      }
    });
    res.json(formattedActivities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get('/users', async (req, res) => {
  try {
    const users = await Syslog.distinct('MsgPriority');
    console.log('Equipos:', users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agregar una actividad de usuario
app.post('/activities', async (req, res) => {
  const Syslog = new Syslog({
    MsgDate: Date,
  MsgTime: Date,
  MsgPriority: String,
  MsgHostname:String,
  MsgText:String,
  MsgUser:String
  });

  try {
    const newSyslog = await Syslog.save();
    res.status(201).json(newSyslog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/devices/:pc_name', async (req, res) => {
  try {
    const devices = await Dispositivos.find({ pc_name: req.params.pc_name });
    console.log('Dispositivos:', devices);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Iniciar el servidor
app.listen(3000, () => console.log('Server started'));
