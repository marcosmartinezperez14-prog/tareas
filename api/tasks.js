import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    // Para asegurar que Vercel KV funcione necesitamos una key, usaremos 'tasks-list'
    const KV_KEY = 'tasks-list';

    try {
        if (request.method === 'GET') {
            const tasks = await kv.get(KV_KEY) || [];
            return response.status(200).json(tasks);
        }

        if (request.method === 'POST') {
            const newTask = request.body;
            const tasks = await kv.get(KV_KEY) || [];
            tasks.push(newTask);
            await kv.set(KV_KEY, tasks);
            return response.status(201).json(newTask);
        }

        if (request.method === 'PUT') {
            // El ID vendrá en el query string: /api/tasks?id=123
            const { id } = request.query;
            const tasks = await kv.get(KV_KEY) || [];
            const taskIndex = tasks.findIndex(t => t.id === id);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                await kv.set(KV_KEY, tasks);
                return response.status(200).json(tasks[taskIndex]);
            } else {
                return response.status(404).json({ error: 'Task not found' });
            }
        }

        if (request.method === 'DELETE') {
            const { id } = request.query;
            let tasks = await kv.get(KV_KEY) || [];
            tasks = tasks.filter(t => t.id !== id);
            await kv.set(KV_KEY, tasks);
            return response.status(204).end();
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error("Error KV:", error);
        return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
