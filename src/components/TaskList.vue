<template>
    <ul class="task-list">
        <slot />
    </ul>
    <p v-if="empty" class="empty">No tasks yet.</p>
</template>

<script setup lang="ts">
defineProps<{ empty: boolean }>()
</script>

<style scoped>
.task-list {
    margin: 0;
    padding: 0;
    list-style: none;
    /*border: 1px solid #ddd;*/
    border-radius: 10px;

}
.empty {
    text-align: center;
    color: #777;
    margin: 0.75rem 0;
}
</style>
