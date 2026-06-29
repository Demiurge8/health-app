const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv/config')
const User = require('./models/userModel')
const ContactModel = require('./models/contactModel');
const HeartRateData = require('./models/heartRateDataModel');
const jwt = require('jsonwebtoken')
const auth = require('./auth')



const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))

const dbOptions = {useNewUrlParser:true, useUnifiedTopology:true}
mongoose.connect(process.env.DB_URI, dbOptions)
.then(() => console.log('DB Connected!'))
.catch(err => console.log(err))

const port = process.env.PORT || 4000
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.use((req, res, next) => {
    res.setHeader("Access-Control_Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow_Headers",
        "Origin, X-Requested-With, Content, Accept, COntent-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
  });
  
  // authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
});

app.post('/register', (request, respons) => {
    bcrypt
        .hash(request.body.password, 10)
        .then((hashedPassword) =>{
            const user = new User({
                email: request.body.email,
                password: hashedPassword
            })

            user
                .save()
                .then((result) => {
                    respons.status(201). send({
                        message: "User created Successfully!",
                        result
                    })
                })

                .catch((error) => {
                    respons.status(500).send({
                        message: "Error creating user",
                        error
                    })
                })
        })

        .catch((e) => {
            respons.status(500).send({
                message: "Password was not hashed successfully",
                e
            })
        })
})

app.post('/login', (request, response) => {
    User.findOne({ email: request.body.email })
        .then((user) => {
            bcrypt
            .compare(request.body.password, user.password)
            .then((passwordCheck) => {
                if(!passwordCheck) {
                    return response.status(400).send({
                        message: "Passwords does not match",
                        error
                    })
                }

                const token = jwt.sign(
                {
                    userId: user._id,
                    userEmail: user.email
                },
                    "RANDOM-TOKEN",
                    { expiresIn: "24h" }
                )

                response.status(200).send({
                    message: "Login successful!",
                    email: user.email,
                    token
                })
            })
            .catch((error) => {
                response.status(400).send({
                    message: "Password does no match",
                    error
                })
            })
        })
        .catch((e) => {
            response.status(404).send({
                message: "Email not found",
                e
            })
        })
})

app.post('/add', async (req, res) => {
    try {
        const { name, email, message } = req.body;
    
        // Create a new document in MongoDB
        const newContact = new ContactModel({
          name,
          email,
          message,
        });
    
        // Save the new document to the database
        await newContact.save();
    
        res.status(201).json({ success: true, message: 'Data added successfully.' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add data to MongoDB.' });
      }
})

app.post('/heart-rate-data-send', async (req, res) => {
    try {
        const { time, date, heartRate, recommendation } = req.body;
        
        const newHeartRateData = new HeartRateData({
            time,
            date: new Date(date).toISOString().split('T')[0],
            heartRate,
            recommendation
        })

        await newHeartRateData.save();

        res.status(201).json({ message: 'Heart rate data added successfully!' });
      } catch (error) {
        console.error('Error adding heart rate data:', error);
        res.status(500).json({ error: 'Failed to add heart rate data to MongoDB.' });
      }
})

app.post('/heart-rate-data-get', (req, res) => {
    HeartRateData.find({})
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((error) => {
            res.json(500).json({ error: 'Failed to fetch heart rate data from MongoDB.'})
        })
})

app.post('/add-heart-rate-data', async (req, res) => {
    try {
      // Generate the heart rate data
      const startDate = new Date('2023-06-25');
      const heartRateData = [];
  
      for (let i = 0; i < 72; i++) {
        const currentTime = new Date(startDate.getTime() + i * 60 * 60 * 1000);
        const time = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = currentTime.toLocaleDateString();
        const heartRate = Math.floor(Math.random() * (200 - 60 + 1)) + 60;
        const recommendation = heartRate > 100 ? 'Pay attention, you have a high heart rate!' : 'The data are within normal limits.';
  
        heartRateData.push({ time, date, heartRate, recommendation });
      }
  
      // Insert the heart rate data into MongoDB
      await HeartRateData.insertMany(heartRateData);
  
      // Send a success response
      res.status(200).json({ message: 'Heart rate data added to MongoDB successfully' });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/heart-rate-data-update/:id', async (req, res) => {
    try {
      const { time, date, heartRate, recommendation } = req.body;
      const id = req.params.id;
      const updatedHeartRateData = await HeartRateData.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        { time, date, heartRate, recommendation },
        { new: true }
      );
      res.status(200).json({ message: 'Record updated successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update record!' });
    }
});
  
app.post('/heart-rate-data-delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await HeartRateData.findByIdAndRemove(id);
      res.status(200).json({ message: 'Record deleted successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete record!' });
    }
});