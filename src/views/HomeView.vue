<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { listTasks, createTask, deleteTask, patchTask, type Task } from '@/api/tasks'
import TaskList from '@/components/TaskList.vue'
import TaskItem from '@/components/TaskItem.vue'

const newTask = ref('')
const tasks = ref<Task[]>([])

async function removeTask(task: Task) {
    if (!window.confirm('Delete this task?\n\n' + task.text)) return
    try {
        await deleteTask(task.id)
        tasks.value = tasks.value.filter(t => t.id !== task.id)
    } catch (err) {
        console.error('Failed to delete task', err)
        alert('Could not delete task. Please try again.')
    }
}

async function addTask() {
    const text = newTask.value.trim()
    if (!text) return
    const created = await createTask({ text, done: false })
    tasks.value.unshift(created)
    newTask.value = ''
}

async function toggleTask(task: Task, next: boolean) {
    const prev = task.done
    task.done = next // optimistic
    try {
        const updated = await patchTask(task.id, { done: next })
        Object.assign(task, updated)
    } catch (err) {
        console.error('Failed to toggle done', err)
        task.done = prev
        alert('Could not update task. Please try again.')
    }
}

const editingId = ref<string | null>(null)
const draftText = ref('')

function startEdit(task: Task) {
    editingId.value = task.id //.toString()
    draftText.value = task.text
}
function cancelEdit() {
    editingId.value = null
    draftText.value = ''
}
async function saveEdit(task: Task) {
    const text = draftText.value.trim()
    if (!text || text === task.text) return cancelEdit()
    const prev = task.text
    task.text = text // optimistic
    try {
        const updated = await patchTask(task.id, { text })
        Object.assign(task, updated)
    } catch (e) {
        console.error(e)
        task.text = prev
        alert('Could not save changes.')
    } finally {
        cancelEdit()
    }
}

onMounted(async () => {
    tasks.value = await listTasks()
})
</script>

<template>
    <main class="page">
        <h1 class="title">To Do</h1>

        <form @submit.prevent="addTask" class="add-form">
            <input
                v-model="newTask"
                type="text"
                placeholder="Add a new task"
                class="add-input"
                aria-label="New task"
            />
            <button type="submit" class="add-button">Add</button>
        </form>

        <TaskList :empty="!tasks.length">
            <template v-for="task in tasks" :key="task.id">
                <TaskItem
                    v-if="editingId !== task.id"
                    :task="task"
                    @toggle="toggleTask"
                    @request-delete="removeTask"
                    @dblclick="startEdit(task)"
                />
                <li v-else class="task-item editor-row">
                    <input
                        v-model="draftText"
                        class="edit-input"
                        @keydown.enter.prevent="saveEdit(task)"
                        @keydown.esc.prevent="cancelEdit()"
                        @blur="saveEdit(task)"
                        autofocus
                    />
                    <button class="cancel-btn" @click="cancelEdit()">Cancel</button>
                </li>
            </template>
        </TaskList>
    </main>
</template>

<style scoped>
.page {
    margin: 2rem auto;
    max-width: 640px;
    padding: 0 1rem;
}
.title {
    margin: 0 0 1rem 0;
    font-size: 1.75rem;
    font-weight: 700;
}
.add-form {
    display: flex;
    gap: .5rem;
    margin-bottom: 1rem;
}
.add-input {
    flex: 1;
    min-width: 0;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: .5rem .6rem;
}
.add-button {
    border: 1px solid #2a66f2;
    background: #2a66f2;
    color: #fff;
    border-radius: 8px;
    padding: .5rem .9rem;
    cursor: pointer;
}
.add-button:hover {
    filter: brightness(0.95);
}
.editor-row {
    align-items: center;
    gap: .5rem;
}
.edit-input {
    flex: 1;
    min-width: 0;
    border: 1px solid #bbb;
    border-radius: 8px;
    padding: .4rem .6rem;
}
.cancel-btn {
    border: 1px solid #e0e0e0;
    background: #fff;
    border-radius: 8px;
    padding: .35rem .6rem;
    cursor: pointer;
}
.cancel-btn:hover {
    background: #f6f6f6;
}
</style>
