<template>
    <li class="task-item">
        <label class="task-label">
            <input
                type="checkbox"
                :checked="task.done"
                @change="onChange"
            />
        </label>

        <span
            class="task-text"
            :class="{ done: task.done }"
            @click.stop="$emit('request-edit', task)"
        >
            {{ task.text }}
        </span>

        <button
            class="delete-btn"
            aria-label="Delete task"
            title="Delete"
            @click="$emit('request-delete', task)"
        >
            ×
        </button>
    </li>
</template>

<script setup lang="ts">
import type { Task } from '@/api/tasks'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{
    (e: 'toggle', task: Task, next: boolean): void
    (e: 'request-delete', task: Task): void
    (e: 'request-edit', task: Task): void
}>()

function onChange(e: Event) {
    const next = (e.target as HTMLInputElement).checked
    emit('toggle', props.task, next)
}
</script>

<style scoped>
.task-item {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .5rem .75rem;
    border-top: 1px solid #eee;
}
.task-item:first-child { border-top: 0; }
.task-label { display: inline-flex; align-items: center; }
.task-text { flex: 1; word-break: break-word; cursor: pointer; }
.task-text.done { text-decoration: line-through; color: #888; }
.delete-btn {
    appearance: none;
    border: 0;
    background: #c62828;
    color: #fff;
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.delete-btn:hover {
    background: #b71c1c;
}
.delete-btn:focus-visible {
    outline: 2px solid #7f1d1d;
    outline-offset: 2px;
}
</style>
