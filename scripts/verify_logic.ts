
import { db } from '../src/lib/db';
import { getTasks, createTask, updateTaskProgress } from '../src/actions/tasks';

// Mock auth
jest.mock('../src/auth', () => ({
    auth: () => Promise.resolve({ user: { id: 'test-user-id' } })
}));

async function verifyLogic() {
    const userId = 'test-user-id';

    // Clean up
    await db.spiritualTask.deleteMany({ where: { userId } });

    console.log('1. Creating non-daily task...');
    const task = await createTask({
        text: 'Test Non-Daily Task',
        type: 'sutra',
        target: 1,
        step: 1,
        isDaily: false
    });

    console.log(`Task created. ID: ${task.id}, isDaily: ${task.isDaily}`);

    if (task.isDaily) {
        console.error('ERROR: Task created as daily but requested non-daily!');
        return;
    }

    console.log('2. Completing task...');
    await updateTaskProgress(task.id, 1);

    const completedTask = await db.spiritualTask.findUnique({ where: { id: task.id } });
    console.log(`Task status: Completed=${completedTask?.completed}, Current=${completedTask?.current}`);

    if (!completedTask?.completed) {
        console.error('ERROR: Task should be completed!');
        return;
    }

    console.log('3. Simulating "Next Day" logic...');
    // Manually update updatedAt to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await db.spiritualTask.update({
        where: { id: task.id },
        data: { updatedAt: yesterday }
    });

    console.log('Running getTasks (which triggers reset/cleanup)...');
    const tasks = await getTasks();

    const found = tasks.find(t => t.id === task.id);
    if (found) {
        console.error('ERROR: Task still exists in the list!');
        console.log('Task state:', found);
        if (!found.completed) {
            console.error('...and it was RESET (uncompleted)! This confirms the bug.');
        }
    } else {
        console.log('SUCCESS: Task was deleted correctly.');
    }

    // Cleanup
    await db.spiritualTask.deleteMany({ where: { userId } });
}

// Need to run this in a context where we can mock auth or pass userId,
// but since we are running via ts-node, we might need to modify actions temporarily or use a different approach.
// For now, let's just inspect the code logic as running this requires Next.js context mocking.
// Instead, I will assume the code logic is what I'm testing.
