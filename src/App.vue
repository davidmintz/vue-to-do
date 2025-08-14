<script setup>
import { ref, watch, onMounted } from 'vue'
import { listTasks } from './api/tasks'

const newTask = ref('')
const tasks = ref([])


function addTask() {
  if (!newTask.value.trim()) return
  tasks.value.push({
    id: Date.now(),
    text: newTask.value.trim(),
    done: false
  })
  newTask.value = ''
}

function removeTask(id) {
  tasks.value = tasks.value.filter(task => task.id !== id)
}

onMounted(async () => {
  try {
    tasks.value = await listTasks()
  } catch (e) {
    console.error('API load failed; falling back to localStorage', e)
    const stored = localStorage.getItem('tasks')
    if (stored) {
      try { tasks.value = JSON.parse(stored) } catch { /* empty */ }
    }
  }
})

// Save whenever tasks change
watch(
  tasks,
  (newTasks) => {
    localStorage.setItem('tasks', JSON.stringify(newTasks))
  },
  { deep: true }
)
</script>


<template>
  <main class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">My To-Do List</h1>

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
        <input type="checkbox" v-model="task.done" style="margin-right: 1em"/><span class="task-text" :style="{ textDecoration : task.done ? 'line-through' : ''}">{{ task.text }}
          <span v-if="! task.done">(pending)</span>
        </span>
        <button class="delete-btn" @click="removeTask(task.id)">✕</button>
      </li>
    </ul>
  </main>
</template>
<style>
</style>
