const HomeWorkGradeModel = require('../models/homeworkGrade');



class homeworkGradeController {
    async getHomeWorkGrades(req, res) {

       // await HomeWorkGradeModel.create({name:"dsfsdf"})
        let homeworkGrades = await HomeWorkGradeModel.find({});
        res.json({ status: true, result: homeworkGrades });
    }

}
module.exports = homeworkGradeController;