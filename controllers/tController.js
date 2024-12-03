// controllers/taskController.js

const getAllTasks = async (req, res) => {
    const db = req.app.get('db'); 
    const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 tasks per page
    const offset = (page - 1) * limit;

    try {
        const [tasks] = await db.query('SELECT * FROM tasks LIMIT ? OFFSET ?', [Number(limit), offset]);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getTask = async (req, res) => {
    const db = req.app.get('db');
    try {
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        const task = rows[0];
        task ? res.json(task) : res.status(404).send('Task not found');
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createTask = async (req, res) => {
    const db = req.app.get('db');
    const { title, description, due_date } = req.body;

    try {
        // Convert ISO 8601 date string to MySQL DATETIME format
        const formattedDueDate = new Date(due_date).toISOString().slice(0, 19).replace('T', ' ');

        const [result] = await db.query(
            'INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)',
            [title, description, formattedDueDate]
        );

        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const updateTask = async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;
    const { title, description, completed, due_date, notification_id } = req.body;

    try {
        const [existingRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        const existingTask = existingRows[0];

        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updateFields = [];
        const updateValues = [];

        if (title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (completed !== undefined) {
            updateFields.push('completed = ?');
            updateValues.push(completed);
        }
        if (due_date !== undefined) {
            updateFields.push('due_date = ?');
            updateValues.push(due_date);
        }
        if (notification_id !== undefined) {
            updateFields.push('notification_id = ?');
            updateValues.push(notification_id);
        }

        if (updateFields.length === 0) {
            return res.json(existingTask);
        }

        updateValues.push(id);

        await db.query(`UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

        const [updatedRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json(updatedRows[0]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const completeTask = async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;

    try {
        const [existingRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        const existingTask = existingRows[0];

        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await db.query('UPDATE tasks SET completed = 1 WHERE id = ?', [id]);

        const [updatedRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json(updatedRows[0]);
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteTask = async (req, res) => {
    const db = req.app.get('db');
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.send('Task deleted');
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    completeTask
};
