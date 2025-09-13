<template>
  <div>
    <h1>Users</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { User } from '../types/index';

const users = ref<User[]>([]);

onMounted(async () => {
  const res = await $fetch<User[]>('/api/test');
  users.value = res;
});
</script>
