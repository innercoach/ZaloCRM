<template>
  <div class="offline-fallback">
    <v-card class="offline-card" elevation="0" rounded="xl">
      <v-icon class="offline-icon" size="40">mdi-wifi-off</v-icon>
      <h1>Không có kết nối</h1>
      <p>
        ZaloCRM đang chạy ở chế độ offline. Hãy kiểm tra mạng rồi thử lại.
      </p>
      <v-btn color="primary" rounded="lg" @click="retry">
        Thử lại
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
function retry() {
  window.location.reload();
}
</script>

<style scoped>
.offline-fallback {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(214, 168, 79, 0.18), transparent 34rem),
    #070a12;
  color: #f8fafc;
}

.offline-card {
  width: min(100%, 420px);
  padding: 28px;
  text-align: center;
  background: rgba(16, 21, 34, 0.92);
  border: 1px solid rgba(214, 168, 79, 0.22);
}

.offline-icon {
  color: #d6a84f;
  margin-bottom: 12px;
}

h1 {
  font-size: 1.5rem;
  margin: 0 0 8px;
}

p {
  color: #cbd5e1;
  margin: 0 0 20px;
  line-height: 1.6;
}
</style>
