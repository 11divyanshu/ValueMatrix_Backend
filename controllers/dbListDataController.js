import CompanyList from "../models/CompanyListSchema.js";
import UniversityList from "../models/universityListSchema.js";
import CompanyBin from "../models/companyBinSchema.js";
import company from "../models/CompanyListSchema.js";

export const addCompanyList = async (req, res) => {
  try {
    let cList = req.body.list;
    cList.forEach(async (item) => {
      const company = new CompanyList({ name: item });
      await company.save();
    });
    res.status(200).json({ message: "Company List Added Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyList = async (req, res) => {
  try {
    const companyList = await CompanyList.find();
    res.status(200).json(companyList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// University Data
export const addUniversityList = async(req,res)=>{
  try{
    let uList = req.body.list;  
    uList.forEach(async(item)=>{
      console.log(item);
      const university = new UniversityList({name:item.name, country: item.country});
      await university.save();
    })
    return res.status(200).json({message:"University List Added Successfully"});
  }catch(err){
    res.status(500).json({message:err.message})
  }
}

export const getSchoolList = async (req, res) => {
  try {
    const schoolList = await UniversityList.find();
    // console.log(schoolList);
    res.status(200).json(schoolList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const checkCompany = async (req, res) => {
  try {
    console.log(req.body)
    // console.log(schoolList);

    const company = new CompanyBin({name:req.body.name});
    await company.save();
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const listUnapproveCompany =  async(request , res) => {
  try {
    const company = await CompanyBin.find();
    // console.log(company);
    res.status(200).json(company);
  } catch (error) {}
};


export const approveCompany =  async(req , res) => {
  try {
    console.log(req.body)
    const jobData = await CompanyBin.findOne({ _id: req.body.id }).lean();
    delete jobData._id;
    delete jobData.__v;
    res.send(jobData.__v);
    const newJob = new company(jobData);
    await newJob.save();
    await CompanyBin.findOneAndDelete({ _id: req.body.id });
    res.send();
  } catch (err) {
    console.log("Error approveCompany: ", err);
    res.send(err);
  }
};






