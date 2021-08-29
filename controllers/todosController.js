var todosModel = require('../models/todos');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class todosController {

    constructor() { }

    async save(req, res) {
        let { tasks } = req.body;
        let { user_id, user_name } = req.headers;
        let todo = await todosModel.findOne({ user_id: user_id });
        if (todo) {
            await todosModel.updateOne({ user_id: user_id }, {
                tasks: tasks,
                updated_at: Date.now()
            })
            saveActivity(user_id, user_name, "To-Dos", "To Do has been updated.", "Updated");
        } else {
            await todosModel.create({
                user_id: user_id,
                tasks: tasks,
                created_at: Date.now()
            })
            saveActivity(user_id, user_name, "To-Dos","New To do has been created.", "Created");
        }

        res.json({ status: true });
    }

    async load(req, res) {
        let { user_id } = req.headers;
        let todos = await todosModel.findOne({ user_id: user_id });
        if (todos) {
            res.json({ status: true, result: todos.tasks });
        } else {
            res.json({ status: true, result: [] });
        }
    }

    async download(req, res) {
        let { user_id } = req.headers;
        let todos = await todosModel.findOne({ user_id: user_id });
        let tasks = [];
        if (todos) tasks = todos.tasks;
        let data = [];
        for (let i = 0; i < tasks.length; i++) {
            data.push({
                id: tasks[i].taskId,
                created_at: tasks[i].createdAt,
                title: tasks[i].title,
                description: tasks[i].description,
                todoDate: tasks[i].todoDate,
                status: tasks[i].status
            })
        }
        const fields = [
            {
                label: 'Id',
                value: 'id'
            },
            {
                label: 'Created Date',
                value: 'created_at'
            },
            {
                label: 'Title',
                value: 'title'
            },
            {
                label: 'Description',
                value: 'description'
            },
            {
                label: 'Task Date',
                value: 'todoDate'
            },
            {
                label: 'Status',
                value: 'status'
            }
        ];
        return downloadResource(res, 'todos-export.csv', fields, data);
    }

}

module.exports = todosController;