import mongoose from "mongoose";
import Level from "../models/LevelSchema.js";
import PerformanceMultiplier from "../models/PerformanceMultiplierSchema.js";
import XICategory from "../models/xiCategorySchema.js";
import Xi_info from "../models/xi_infoSchema.js";

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
        console.log(request.query)
        let user1 = await Xi_info.findOne(
            { candidate_id: request.query.id });
       return response.status(200).json({user:user1});

    } catch (error) {

    }
}

export const updateXIInfo = async (request, response) => {
    try {
        console.log(request.body.updates)
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