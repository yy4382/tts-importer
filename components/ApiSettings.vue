<template>
  <UCard class="max-w-xl">
    <template #header>
      <h2>🔑 输入 key</h2>
    </template>
    <div class="mb-5">
      <UFormGroup label="API Region" required>
        <UInput
          id="email"
          v-model="settings.region"
          type="text"
          class="select-general"
          required
        />
      </UFormGroup>
    </div>
    <div class="mb-5">
      <UFormGroup label="API Key" required>
        <template #help>
          <p>本站不会储存你的 Key。 数据缓存于本地浏览器中。</p>
          <p>
            具体请见此<a
              href="https://github.com/yy4382/tts-importer?tab=readme-ov-file#%E9%9A%90%E7%A7%81%E8%AF%B4%E6%98%8E"
              class="text-blue-700 dark:text-blue-400"
              >说明</a
            >。
          </p>
        </template>
        <UInput
          id="password"
          v-model="settings.key"
          type="password"
          class="select-general"
          required
        />
      </UFormGroup>
    </div>
    <UButton
      :loading="isLoading"
      class="mr-2"
      @click="
        settings.valid(
          () => {
            toast.add({ title: 'API 有效' });
          },
          (error: FetchError) => {
            toast.add({
              title: '测试失败',
              description: error.message,
            });
          },
        )
      "
    >
      测试
    </UButton>
    <UButton
      @click="
        voiceList.updateVoiceList(
          ({ listLength }) => {
            toast.add({
              title: '成功刷新语音列表',
              description: `共 ${listLength} 个语音`,
            });
          },
          (err) => {
            toast.add({ title: err.toString() });
          },
        )
      "
    >
      {{ voiceList.voiceList.length > 0 ? "更新" : "获取" }}语音列表
    </UButton>
    <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      不知道从那里获得 Key？请看
      <ULink to="/help/reg" inactive-class="text-primary">帮助：创建资源</ULink>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type { FetchError } from "ofetch";
const settings = useSettingsStore();
const voiceList = useVoiceListStore();
const isLoading = ref(false);
const toast = useToast();
</script>
