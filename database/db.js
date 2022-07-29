import mongoose from 'mongoose';
import ServerApiVersion from "mongodb";

const Connection = async () => {
    try{
        mongoose.connect('mongodb+srv://sandeshjain:mongotdpintern@cluster0.pnc1g1y.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true,  serverApi: ServerApiVersion.v1});
        // mongoose.connect('mongodb://vm_dbaccess:ParseDev%401631@clustervm-shard-00-01.s3eom.mongodb.net:27017/?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true,  serverApi: ServerApiVersion.v1});
        console.log('Database Connected Succesfully');
    }   
    catch(error){
        console.log("Error: ", error.message)
    }
};

export default Connection;