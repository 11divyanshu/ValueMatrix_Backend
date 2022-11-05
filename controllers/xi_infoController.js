import mongoose from "mongoose";
import Level from "../models/levelSchema.js";
import PerformanceMultiplier from "../models/performanceMultiplierSchema.js";
import XICategory from "../models/xiCategorySchema.js";
import Xi_info from "../models/xi_infoSchema.js";
import twilio from "twilio";
const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;
export const addXIInfo = async (request, response) => {
    try {

        const candidateInfo = {
            candidate_id: request.body._id,

        }
        let xi = new Xi_info(candidateInfo);
        await xi.save();

    } catch (error) {

    }
}
export const getXIInfo = async (request, response) => {
    try {
        let user1 = await Xi_info.findOne(
            { candidate_id: request.query.id });
       return response.status(200).json({user:user1});

    } catch (error) {

    }
}

export const getDialerToken = async (request, response) => {
    try {
        const capability = new ClientCapability({
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
          });
          capability.addScope(
            new ClientCapability.OutgoingClientScope({
              applicationSid: process.env.TWILIO_TWIML_APP_SID})
          );
          const token = capability.toJwt();
          response.send({
            token: token,
          });
    } catch (error) {
        response.status(500).send(error);
    }
}

export const getDialerCall = async (request, response) => {
    console.log(request.body);
    let voiceResponse = new VoiceResponse();
    voiceResponse.dial({
      callerId: process.env.TWILIO_NUMBER
    }, request.body.number);
    response.type('text/xml');
    response.send(voiceResponse.toString());  
}

export const updateXIInfo = async (request, response) => {
    try {
        let user1 = await Xi_info.findOneAndUpdate(
            { candidate_id: request.body.id },
            request.body.updates,
            { new: true }

        );


        if (request.body.updates.levelId) {
            await Level.find({
                _id: mongoose.Types.ObjectId(request.body.updates.levelId)
            },  async(err, res) =>{
                console.log(res)
                let user1 = await Xi_info.findOneAndUpdate(
                    { candidate_id: request.body.id },
                    { level: res[0].level },


                );
            })

        }
        if (request.body.updates.categoryId) {
            await XICategory.find({
                _id: mongoose.Types.ObjectId(request.body.updates.categoryId)
            }, async (err, res)=> {
console.log(res)
                let user1 = await Xi_info.findOneAndUpdate(
                    { candidate_id: request.body.id },
                    { category: res[0].category, payout: res[0].payout, limit: res[0].limit, cat: res[0].cat },


                );
            })

        }
        if (request.body.updates.multiplierId) {
            await PerformanceMultiplier.find({
                _id: mongoose.Types.ObjectId(request.body.updates.multiplierId)
            },async(err, res)=> {

                let user1 =await Xi_info.findOneAndUpdate(
                    { candidate_id: request.body.id },
                    { multiplier: res[0].multiplier, },


                );
            })

        }

        return response.status(200).json({ user:user1 });


    } catch (error) {

    }

}