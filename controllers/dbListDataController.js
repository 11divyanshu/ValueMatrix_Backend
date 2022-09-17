import CompanyList from "../models/CompanyListSchema.js";
import UniversityList from "../models/universityListSchema.js";

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