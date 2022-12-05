import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({

    applicantId: {
        type: mongoose.Types.ObjectId,
    },

    amount:{
        type:Number
    },
    credit:{
        type:Number
    },

    orderCreationId: {
        type: String
    },

    razorpayPaymentId: {
        type: String
    },

    razorpayOrderId: {
        type: String
    },

    razorpaySignature: {
        type: String
    },
    transactionDate:{
        type:Date
    },
    invoiceDate:{
        type:Date
    },
    invoiceID:{
        type: String
    }



});

const Transaction = mongoose.model(
    "transaction",
    transactionSchema
);
export default Transaction;