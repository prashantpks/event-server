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

//ROUTE 2: Update event details using PUT: api/event/updateevent/, Require authentication
router.put('/updateevent/:id',fetchuser,async (req,res)=>{
    let success = false;
    
    try{
        const {event_name, description, event_banner, address, latitude, longitude, start_time, end_time} = req.body;
        let event = await Event.findById(req.params.id);

        if(!event){
            return res.status(400).json({success,error:"Event doesn't exist"});
        }

        if(req.user.id !== event.organizer.toString()){
            return res.status(401).json({success,error:"Access denied!"});
        }

        const updatedEvent = {event_name, description, event_banner, address, latitude, longitude, start_time, end_time};
        event = await Event.findByIdAndUpdate(req.params.id,{$set: updatedEvent},{new:true});
        success = true;
        return res.status(200).json({success,event});

    }catch(err){
        return res.status(500).json({success,error:err.message,message:"Internal server error"});
    }
});

//ROUTE 3: Get event details using GET: api/event/showevent , Doesn't require authentication
router.get('/showevent/:id', async (req,res)=>{
    let success = false;

    try{
        const event = await Event.findById(req.params.id);
        if(!event){
            return res.status(400).json({success,error:"Event doesn't exist!"});
        }

        success = true;
        return res.status(200).json({success,event});
    }catch(err){
        return res.status(500).json({success,error:err.message,message:"Internal server error"});
    }
});

//ROUTE 4: Delete event using DELETE: api/event/deleteevent, Require authentication
router.delete('/deleteevent/:id',fetchuser, async (req,res)=>{
    let success = false;

    try{
        const event = await Event.findById(req.params.id);
        if(!event){
            return res.status(400).json({success, error:"Event doesn't exist!"});
        }

        if(event.organizer.toString()!== req.user.id){
            return res.status(400).json({success,error:"Access denied!"});
        }

        let d = await Event.findByIdAndDelete(req.params.id);
        success = true;
        return res.status(200).json({success,d});
    }catch(err){
        return res.status(500).json({success,error:err.message,message:"Internal server error"});
    }
});

//ROUTE 5: Fetch all eventlist using GET: api/event/fetcheventlist Doesn't require authentication
router.get('/fetcheventlist',async (req,res)=>{
    success = false;

    try{
        let start = new Date(req.body.start_time);
        let end;
        if(req.body.end_time){
            end = new Date(req.body.end_time);
        }else{
            end = new Date(req.body.start_time);
        }

        const eventlist = await Event.find({$or : [{start_time:{$gte: start, $lte: end}, end_time:{$gte:start,$lte: end}},
                                                   {start_time:{$lte: start}, end_time:{$gte:start,$lte: end}},
                                                   {start_time:{$gte: start, $lte: end}, end_time:{$gte:end}}]
                                            });
        success = true;
        return res.status(200).json({success,eventlist});
    }catch(err){
        return res.status(500).json({success,error:err.message,message:"Internal server error"});
    }
});


module.exports = router;