<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { listTasks, createTask, deleteTask, patchTask } from './api/tasks'

const newTask = ref('')
const tasks = ref([])


async function removeTask(id) {
  if (!window.confirm('Delete this task?')) return
  try {
    await deleteTask(id)
    tasks.value = tasks.value.filter(task => task.id !== id)
  } catch (err) {
    console.error('Failed to delete task', err)
    alert('Could not delete task. Please try again.') // or a fancier toast later
  }
}

async function addTask() {
  const text = newTask.value.trim()
  if (!text) return
  const created = await createTask({ text, done: false })
  tasks.value.unshift(created) // or push(), your call
  newTask.value = ''
}

async function toggleDone(task, event) {
  const prev = task.done
  const next = !!event.target.checked
  task.done = next // optimistic UI

  try {
    const updated = await patchTask(task.id, { done: next })
    // Optionally merge server truth (timestamps, etc.)
    Object.assign(task, updated)
  } catch (err) {
    console.error('Failed to toggle done', err)
    task.done = prev // revert on failure
    alert('Could not update task. Please try again.')
  }
}

const editingId = ref(null)
const draftText = ref('')

function startEdit(task) {
  editingId.value = task.id
  draftText.value = task.text
}

function cancelEdit() {
  editingId.value = null
  draftText.value = ''
}

async function saveEdit(task) {
  const text = draftText.value.trim()
  if (!text || text === task.text) { cancelEdit(); return }
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
  try {
    tasks.value = await listTasks()
  } catch (e) {
    console.error('API load failed; falling back to localStorage', e)

  }
})


</script>


<template>
  <main class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">To Do</h1>

    <form @submit.prevent="addTask" class="flex mb-4">
      <input
        v-model="newTask"
        type="text"
        placeholder="Add a new task"
        class="flex-1 border rounded-l px-2 py-1"
      />
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-1 rounded-r"
      >
        Add
      </button>
    </form>

    <ul>
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <input type="checkbox" v-model="task.done" @change="toggleDone(task, $event)" style="margin-right: 1em"/>

        <template v-if="editingId === task.id">
          <input
            v-model="draftText"
            class="edit-input"
            @keydown.enter.prevent="saveEdit(task)"
            @keydown.esc.prevent="cancelEdit()"
            @blur="saveEdit(task)"
            autofocus
          />

        </template>
        <template v-else>
        <span
          class="task-text"
          :style="{ textDecoration: task.done ? 'line-through' : '' }"
          @click="startEdit(task)"
        >
    {{ task.text }}
  </span>
        </template>

        <button class="delete-btn" @click="removeTask(task.id)">✕</button>
      </li>
    </ul>
  </main>
</template>
<style>
main {
  margin: auto;
  max-width: 600px;
}
.edit-input { width: 100%; }
.task-text { cursor: pointer; }

</style>
