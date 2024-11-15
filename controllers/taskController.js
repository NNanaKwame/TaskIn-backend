// controllers/taskController.js
const getAllTasks = async (req, res) => {
    const db = req.app.get('db');
    const tasks = await db.all('SELECT * FROM tasks');
    res.json(tasks);
};

const getTask = async (req, res) => {
    const db = req.app.get('db');
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', req.params.id);
    task ? res.json(task) : res.status(404).send("Task not found");
};

const createTask = async (req, res) => {
    const db = req.app.get('db');
    const { title, description, due_date } = req.body;
    const result = await db.run(
        `INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)`,
        [title, description, due_date]
    );
    res.status(201).json({ id: result.lastID });
};

const updateTask = async (req, res) => {
    const db = req.app.get('db');  // Add this line to get the database connection
    const { id } = req.params;
    const { title, description, completed, due_date, notification_id } = req.body;

    try {
        // First, fetch the existing task
        const existingTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);

        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Prepare the update query and parameters
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

        // If no fields to update, return the existing task
        if (updateFields.length === 0) {
            return res.json(existingTask);
        }

        // Construct and execute the update query
        const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id);

        await db.run(query, updateValues);

        // Fetch and return the updated task
        const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const completeTask = async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;

    try {
        // Check if task exists
        const existingTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
        
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task's completed status
        await db.run('UPDATE tasks SET completed = 1 WHERE id = ?', id);

        // Fetch and return the updated task
        const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
        res.json(updatedTask);
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteTask = async (req, res) => {
    const db = req.app.get('db');
    await db.run('DELETE FROM tasks WHERE id = ?', req.params.id);
    res.send("Task deleted");
};

module.exports = { 
    getAllTasks, 
    getTask, 
    createTask, 
    updateTask, 
    deleteTask,
    completeTask 
};
