import Skill from "../models/skillsSchema.js";
import User from "../models/userSchema.js";

export const getSkills = async (req, res) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, result) {
      if (err) {
        console.log(err);
      }
      if (result && result.isAdmin === false) {
        res.status(404).json({ message: "You are not an admin" });
      }
    });
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Add Skills
export const addSkill = async (req, res) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, result) {
      if (err) {
        console.log(err);
      }
      if (result && result.isAdmin === false) {
        res.status(404).json({ message: "You are not an admin" });
      }
    });
    let skillsJSON = await Skill.find().select({ skill: 1, _id: 0 });
    let skills = [];
    skillsJSON.forEach((skill) => {
      skills.push(skill.skill);
    });
    let reqSkill = req.body.skills;
    reqSkill.map(async (el) => {
      if (!skills.includes(el)) {
        const skill = new Skill({ skill: el });
        skills.push(el);
        await skill.save();
      }
    });
    console.log("Done");
    return res.status(200).json({ message: "Skills added successfully" });
    console.log("Done");
  } catch (err) {
    res.status(404).json({ message: error.message });
  }
};
