<script setup lang="ts">
defineOptions({ name: 'BadExample' });

const level = 2;
</script>

<template>
  <p>{{ level > 1 ? level > 2 ? 'high' : 'mid' : 'low' }}</p>
</template>
