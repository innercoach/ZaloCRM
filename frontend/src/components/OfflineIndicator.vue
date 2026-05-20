<template>
  <v-banner
    v-if="!isOnline || pendingCount > 0"
    :color="bannerColor"
    :icon="bannerIcon"
    lines="one"
    density="compact"
    class="offline-indicator"
  >
    <template #text>
      {{ bannerText }}
    </template>
  </v-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMobile } from '@/composables/use-mobile';
import { useOfflineQueue } from '@/composables/use-offline-queue';

const { isOnline } = useMobile();
const { pendingCount, failedCount } = useOfflineQueue();

const bannerColor = computed(() => {
  if (!isOnline.value) return 'warning';
  if (failedCount.value > 0) return 'error';
  return 'info';
});

const bannerIcon = computed(() => {
  if (!isOnline.value) return 'mdi-wifi-off';
  if (failedCount.value > 0) return 'mdi-alert-circle-outline';
  return 'mdi-send-clock-outline';
});

const bannerText = computed(() => {
  if (!isOnline.value && pendingCount.value > 0) {
    return `Mất kết nối — ${pendingCount.value} tin nhắn sẽ tự gửi khi có mạng`;
  }
  if (!isOnline.value) return 'Mất kết nối — tin nhắn sẽ tự gửi khi có mạng';
  if (failedCount.value > 0) return `${failedCount.value} tin nhắn chưa gửi được — sẽ thử lại khi có mạng`;
  return `${pendingCount.value} tin nhắn đang chờ gửi`;
});
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding-top: env(safe-area-inset-top);
}
</style>
