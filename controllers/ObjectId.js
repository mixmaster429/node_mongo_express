

var mongoose = require('mongoose');



module.exports.ConvertObjectIds = (dataArr) => {
    var idlist = ['location_id','location_room_id','session_id','standard_grade_id','subject_id','syllabus']
    
    idlist.forEach( entity =>{
        if(dataArr.hasOwnProperty(entity)){
            dataArr[entity] = mongoose.mongo.ObjectId(dataArr[entity])
        }
    })
    console.log(data[Arr])
    return dataArr
        
}
