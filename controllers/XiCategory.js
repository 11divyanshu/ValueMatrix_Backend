import XICategory from "../models/xiCategorySchema.js";
import XIPanels from "../models/xiPanelsSchema.js";
import PerformanceMultiplier from "../models/performanceMultiplierSchema.js";
import Level from "../models/levelSchema.js";
import CreditCategory from "../models/creditCategorySchema.js"

export const ListXIPanels =async (request ,response)=>{
    try {
        await XIPanels.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({panels:res});
            }
        }) 
    } catch (error) {
        
    }
  
}
export const updateXIPanels =async(request ,response)=>{
    try {
        // console.log(request.body)
        let user1 = await XIPanels.findOneAndUpdate(
            { _id: request.body.id },
            request.body.updates,
            
          );
          await XIPanels.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({panels:res});
            }
        }) 
    } catch (error) {
        
    }
   
}
export const addXIPanels =async(request ,response)=>{
    try {
        console.log(request.body)
       let panel ={
        panel : request.body.panel,
        permissions : request.body.permissions,
       }

       const user = new XIPanels(panel);
       await user.save();
       return response.status(200).json({Message:"Success"});
    } catch (error) {
        return response.status(400).json({Message:"Error"});
        
    }
   
}

export const ListXICategory =async (request ,response)=>{
    try {
        await XICategory.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        }) 
    } catch (error) {
        
    }
  
}
export const updateXICategory =async(request ,response)=>{
    try {
        // console.log(request.body)
        let user1 = await XICategory.findOneAndUpdate(
            { _id: request.body.id },
            request.body.updates,
            
          );
          await XICategory.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        }) 
    } catch (error) {
        
    }
   
}
export const addXICategory =async(request ,response)=>{
    try {
        console.log(request.body)
       let category ={
        category : request.body.category,
        cat : request.body.cat,
        limit : request.body.limit,
        payout : request.body.payout,
       }

       const user = new XICategory(category);
       await user.save();
       return response.status(200).json({Message:"Success"});
    } catch (error) {
        return response.status(400).json({Message:"Error"});
        
    }
   
}

export const addXIMultiplier =async(request ,response)=>{
    try {
        console.log(request.body)
       let category ={
        multiplier : request.body.multiplier,
        min : request.body.min,
        max : request.body.max,
       }

       const user = new PerformanceMultiplier(category);
       await user.save();
       return response.status(200).json({Message:"Success"});
    } catch (error) {
        return response.status(400).json({Message:"Error"});
        
    }
   
}



export const ListXIMultiplier =async(request ,response)=>{
    try {
       await PerformanceMultiplier.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        })
    } catch (error) {
        
    }
  
}
export const updateXIMultiplier =async(request ,response)=>{
    try {
        let user1 = await PerformanceMultiplier.findOneAndUpdate(
            { _id: request.body.id },
            request.body.updates,
            { new: true }
          );
          await PerformanceMultiplier.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }})
    } catch (error) {
        
    }
   
 
}

export const addXILevel =async(request ,response)=>{
    try {
        console.log(request.body)
       let category ={
        level : request.body.level,
        min : request.body.min,
        max : request.body.max,
       }

       const user = new Level(category);
       await user.save();
       return response.status(200).json({Message:"Success"});
    } catch (error) {
        return response.status(400).json({Message:"Error"});
        
    }
   
}



export const ListXILevel =async(request ,response)=>{
    try {
       await Level.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        })
    } catch (error) {
        
    }
 
}
export const updateXILevel =async(request ,response)=>{
    try {
        let user1 = await Level.findOneAndUpdate(
            { _id: request.body.id },
            request.body.updates,
            { new: true }
          );
          await Level.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }})
    } catch (error) {
        
    }
   
   
}