const express = require('express');
const router = express.Router();
const fetchuser = require('../middlewares/fetchuser');
const Event = require('../models/Event');
const User = require('../models/User');

//ROUTE 1: Add an event using POST: api/event/addevent Require authentication
router.post('/addevent',fetchuser,async (req,res)=>{
    let success = false;
    
    try{
        let {event_name, description, event_banner, address, latitude,longitude, start_time, end_time} = req.body;
        let organizer = req.user.id;
        start_time = new Date(start_time);
        end_time = new Date(end_time);

        const event = await Event.create({
            event_name,
            description,
            event_banner,
            address,
            latitude,
            longitude,
            start_time,
            end_time,
            organizer
        });

        const addEventToUser = (userid,event)=>{
            User.findByIdAndUpdate(
                userid,
                { "$push" : { "my_events" : event._id } },
                {"new": true},
                function(err,user){
                    if(err){ 
                        return res.status(400).json({success,error:err});
                    }
                }
            );
        }

        addEventToUser(organizer,event);
        success = true;
        return res.status(200).json({success,event});

    }catch(err){
        return res.status(500).json({success,error:err.message,message:"Internal server error"});
    }

});

module.exports = router;