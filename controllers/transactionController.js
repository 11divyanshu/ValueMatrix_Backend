import { response } from "express";
import mongoose from "mongoose";
import holdWallet from "../models/holdWalletSchema.js";
import InterviewApplication from "../models/interviewApplicationSchema.js";
import Transaction from "../models/transactionSchema.js";
import userCredit_info from "../models/userCreditSchema.js";
import user from "../models/userSchema.js";

export const getTransactions = async(req,res)=>{
  try {
    let id = req.query.id;
    let data = await Transaction.find({applicantId:id}).sort({ "_id": -1 });
    return res.status(200).json(data);
  } catch (error) {
    return res.send().status(400);
  }
}


export const updateWallet = async(req,response)=>{

    try {
        let id = req.query.id;
        console.log(id)
        console.log(typeof(id))
        
        let data = await holdWallet.findOneAndUpdate({jobId:mongoose.Types.ObjectId(id)},{
            $inc:{
                amount :-1
            }
        });
        return response.send().status(200)
    } catch (error) {
        console.log(error.message)
        return response.send().status(500)
    }
}

export const userRequestUpdate = async (request ,response)=>{
    try {
        let id = request.query.id;
        let obj ={
            userId: request.query.id,
            user_type:user,
            amount:1,
            XiUpgrade:true,
        }
        const hold = new holdWallet(obj);
        await hold.save();
        let data = await userCredit_info.findOneAndUpdate({userId:id},{
            $inc:{
                credit :-1
            }
        });
        return response.send().status(200)

         
    } catch (error) {
        
    }
}
export const userAcceptUpdate = async (request ,response)=>{
    try {
        let id = request.query.id;
        
        let data = await holdWallet.findOneAndUpdate({userId:id},{
            $inc:{
                credit :-1
            }
        });
       
        return response.send().status(200)

         
    } catch (error) {
        
    }
}