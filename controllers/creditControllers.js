import Coupon from "../models/couponSchema.js";
import CreditCategory from "../models/creditCategorySchema.js"
import CreditConverter from "../models/creditConverterSchema.js";
import userCredit_info from "../models/userCreditSchema.js";


export const ListCreditCategory =async (request ,response)=>{
    try {
        await CreditCategory.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        }) 
    } catch (error) {
        
    }
  
}
export const updateCreditCategory =async(request ,response)=>{
    try {
        // console.log(request.body)
        let user1 = await CreditCategory.findOneAndUpdate(
            { _id: request.body.id },
            request.body.updates,
            
          );
          await CreditCategory.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        }) 
    } catch (error) {
        
    }
   
}
export const addCreditCategory =async(request ,response)=>{
    try {
        console.log(request.body)
       let category ={
        category : request.body.category,
       
        amount : request.body.amount,
       }

       const user = new CreditCategory(category);
       await user.save();
       return response.status(200).json({Message:"Success"});
    } catch (error) {
        return response.status(400).json({Message:"Error"});
        
    }
   
}




export const addCreditConverter =async(request ,response)=>{
    try {
        console.log(request.body)
       let currency ={
        currency : request.body.currency,
     
        amount : request.body.amount,
       }

       const user = new CreditConverter(currency);
       console.log(user)
       await user.save();
       console.log("hi")
       return response.status(200).json(user);
       
    } catch (error) {
        console.log(error.message)
        
        return response.status(400).json(error);
        
    }
   
}
export const ListCreditConverter =async (request ,response)=>{
    try {
        await CreditConverter.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        }) 
    } catch (error) {
        
    }
  
}
export const updateCreditConverter =async(request ,response)=>{
    try {
        // console.log(request.body)
        let user1 = await CreditConverter.findOneAndUpdate(
            { _id: request.body.id },
            request.body.updates,
            
          );
          await CreditConverter.find({isDeleted:false},function(err,res){
            if(err){
                console.log(err)
            }else{
                return response.status(200).json({category:res});
            }
        }) 
    } catch (error) {
        
    }
   
}
export const updateUserCreditInfo =async(request ,response)=>{
    try {
        // console.log(request.body)
        let user1 = await userCredit_info.findOneAndUpdate(
            { _id: request.body.id },
            request.body.updates,
            
          );
          return response.send().status(200);
        //   await CreditConverter.find({isDeleted:false},function(err,res){
        //     if(err){
        //         console.log(err)
        //     }else{
        //         return response.status(200).json({category:res});
        //     }
        // }) 
    } catch (error) {
        
    }
   
}


export const getCreditInfoList =async (request ,response)=>{
    try {console.log(request.body)
        const data = await  userCredit_info.aggregate([
            { $match: { user_type:"Company"} },
         
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            
          ]);
          // console.log(data);
        return  response.send(data)
       
    } catch (error) {
        
    }

   
        
  
}



export const addCoupon =async(req ,res)=>{
    try {
        console.log(req.body)
        const data ={

            discount: req.body.discount,
          

        }

        let coupon = new Coupon(data);
        await coupon.save();
        return res.send({message:"Coupon Added"}).status(200);
    } catch (error) {
        
    }
}
