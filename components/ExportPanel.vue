<script setup lang="ts">
const toast = useToast();
const voiceChoice = useVoiceChoiceStore();

function copyText(text: string) {
  try {
    navigator.clipboard.writeText(text);
  } catch (err) {
    console.error(err);
    toast.add({
      title: "复制失败",
      description: "请使用更现代的浏览器",
    });
    return;
  }
  toast.add({
    title: "复制成功",
    description: "已复制配置到剪贴板",
  });
}

function copyLegadoConfig() {
  const config = voiceChoice.legadoCfg;
  if (config) copyText(config);
}

function copyLegadoLink() {
  const config = voiceChoice.legadoCfg;
  if (!config) return;
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  copyText(link);
}

function import2Legado() {
  const config = voiceChoice.legadoCfg;
  if (!config) return;
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  const legadoLink = `legado://import/httpTTS?src=${encodeURIComponent(link)}`;
  window.open(legadoLink, "_blank");
}

function copySourceReaderLink() {
  const config = voiceChoice.sourceReaderCfg;
  if (!config) return;
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  copyText(link);
}
function downloadSourceReaderFile() {
  const config = voiceChoice.sourceReaderCfg;
  if (!config) return;
  const title = `Azure ${voiceChoice.voice!.LocalName}${voiceChoice.style || ""}${voiceChoice.pitch === "default" ? "" : " - " + voiceChoice.pitch}`;
  const blob = new Blob([config], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = url;
  downloadAnchor.download = title + ".json"; // 指定下载文件的名称
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}
// function copyIFreeTimeSSML() {
//   const config = getConfig(ConfigType.AiYue);
//   if (!config) return;
//   const configObj = JSON.parse(config) as any;
//   const ssml = configObj.ttsHandles[0].params.text;
//   if (ssml) copyText(ssml);
// }
</script>

<template>
  <UCard class="mb-4 max-w-xl">
    <template #header>
      <h2>📤 导出</h2>
    </template>
    <div class="mb-4">
      <label for="legadoButton" class="label-general">阅读(legado)</label>
      <div
        id="legadoButton"
        class="inline-flex rounded-md shadow-sm"
        role="group"
      >
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copyLegadoConfig"
        >
          复制配置
        </UButton>
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copyLegadoLink"
        >
          复制网络导入链接
        </UButton>
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="import2Legado"
        >
          一键导入
        </UButton>
      </div>
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        同样对服务器版阅读 (<a href="https://github.com/hectorqin/reader"
          >hectorqin/reader</a
        >) 有效，只需复制配置之后粘贴到服务器版阅读的配置框即可。
      </div>
    </div>
    <div class="mb-4">
      <label for="AiyueButton" class="label-general">爱阅记</label>
      <div id="AiyueButton" class="*:align-middle">
        <ClientOnly> <ExportIReadNote /></ClientOnly>
      </div>
    </div>
    <div class="mb-4">
      <label for="sourceReaderButton" class="label-general">源阅</label>
      <div id="sourceReaderButton">
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copySourceReaderLink"
        >
          复制网络导入链接
        </UButton>
        <UButton color="gray" variant="solid" @click="downloadSourceReaderFile">
          下载导入文件
        </UButton>
      </div>
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        网络导入因为未知原因对于源阅读无效（对源阅有效），如果使用源阅读，请下载导入文件。
      </div>
    </div>
    <div>
      <label for="ifreetimeButton" class="label-general">爱阅书香</label>
      <div id="ifreetimeButton">
        <!-- <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copyIFreeTimeSSML"
        >
          复制 SSML
        </UButton> -->
        <UButton
          color="gray"
          variant="solid"
          to="/help/ifreetime"
          icon="i-mingcute-book-2-line"
        >
          教程
          <template #trailing>
            <UIcon
              name="i-mingcute-arrow-right-up-line"
              class="-ml-1 h-4 w-4"
            />
          </template>
        </UButton>
      </div>
    </div>
  </UCard>
</template>
