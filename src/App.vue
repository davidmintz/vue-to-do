<script setup>
import { ref, watch, onMounted } from 'vue'

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

// Load tasks from localStorage on app start
onMounted(() => {
  const stored = localStorage.getItem('tasks')
  if (stored) {
    try {
      tasks.value = JSON.parse(stored)
    } catch (e) {
      console.error('Error parsing stored tasks', e)
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
body {
font-family: sans-serif;
}
/* Make every row a flex row */
.task-item {
  display: flex;
  align-items: center;   /* vertical centering */
  border-bottom: 1px solid #ddd;
  padding: 0.5rem 0;
  width: 100%;
}

/* Push the button to the far right and let text wrap */
.task-text {
  flex: 1 1 auto;        /* take remaining space */
  min-width: 0;          /* allow wrapping/ellipsis behavior */
  word-break: break-word;/* long words won't shove the button */
}

/* Button is a fixed-size pill that doesn't shrink */
.delete-btn {
  margin-left: 1rem;
  flex: 0 0 auto;        /* don't grow or shrink */
  background: #ef4444;
  color: #fff;
  border: 0;
  border-radius: 9999px;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color .2s ease;
}

.delete-btn:hover { background: #dc2626; }

</style>
