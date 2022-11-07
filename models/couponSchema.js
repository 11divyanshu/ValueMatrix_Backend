import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
discount:{
    type:Number,
    default:20
},
validFrom:{
    type:Date,
    default:new Date()
},
validTill:{
    type:Date,
    default:new Date()
}
 
});

const Coupon = mongoose.model(
  "coupon",
  couponSchema
);
export default Coupon;
