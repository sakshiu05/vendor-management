// 'use strict';
const resultModel = require('../models/interviewResult').interviewResult;
let func = require("../common/commonfunction");

exports.addInterviewResult = async (req,res) => {

      const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
      const tokenInfo = func.decodeToken(usertoken);
      const interviewResult = new resultModel();
      const data = req.body;
     
      if(!data.userId){
        res.status(400).json({"message":"Please enter userId."});
      }  
      if(!data.interviewStatus){
          res.status(400).json({"message":"Please enter interviewStatus."});
      }
      if(!data.rating){
          res.status(400).json({"message":"Please enter rating."});
      }
    //   if(!data.comment){
    //       res.status(400).json({"message":"Please enter comment"});
    //   }
  
     
      try{
        interviewResult.interviewStatus = data.interviewStatus;
        interviewResult.rating  = data.rating;
        // interviewResult.comment = data.comment;
        interviewResult.addedBy = tokenInfo.sub;
        interviewResult.addedTo = data.userId;
  
          let findResponse = await resultModel.find({addedTo:interviewResult.addedTo});
          if(findResponse.length>0){
              return res.status(400).send({ message: "Result already added for this user.", status: false });
          }else{
            let addResponse = await new resultModel(interviewResult).save();
            if(!addResponse){
                return res.status(400).send({ message: "Error in adding interview result", status: false });
            }else{
                return res.status(200).send({ message: "Interview result successfully added", status: true });        
            }
          }
          
      }catch(error){
          console.log(error)
          return res.status(400).send({ message: "Something went wrong", status: false,"error":error });
      }
  }

  exports.getInterviewResult = async (req, res) => {
    try {
        if (req.params.id) {
            let find_response = await resultModel.find({ addedTo : req.params.id });
            if (find_response.length <= 0) {
                return res.status(400).send({ message: "Interview result not found", status: false });
            } else {
                return res.status(200).send({ message: "Interview result Found", status: true, response: find_response });
            }
        } else {
            return res.status(400).send({ message: "Id not found", status: false });
        }

    } catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
    }
}

  