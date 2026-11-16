<script setup lang="ts">
defineOptions({ name: 'BadI18n' });
</script>

<template>
  <div>
    <p>Hello there</p>
    <p>{{ $t('missing.key') }}</p>
  </div>
</template>
