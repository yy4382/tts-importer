<template>
    <NavBar />
    <div class="mb-auto py-4">
        <Placement class="mb-4">
            <h2 class="text-4xl font-extrabold dark:text-white mb-4">输入 key</h2>
            <div class="mb-5">
                <label for="email" class="label-general">API Region</label>
                <input type="text" id="email" v-model="api.region"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="eastasia" required>
            </div>
            <div class="mb-5">
                <label for="password" class="label-general">Your API
                    Key</label>
                <input type="password" id="password" v-model="api.key"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required>
            </div>
            <Button @click="getVoiceList" :disabled="!api.key || !api.region">获取声音列表</button>
        </Placement>
        <Placement v-if="voiceList" class="mb-4">
            <h2 class="text-4xl font-extrabold dark:text-white mb-4">语音选择</h2>
            <div class="mb-8">
                <label for="voiceSelect" class="label-general">声音
                    (voice)：</label>
                <select id="voiceSelect" v-model="vconfig.voice"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option v-for="item in voiceList" :key="item.ShortName" :value="item">
                        {{ item.LocalName + " " + item.ShortName }}
                    </option>
                </select>
            </div>
            <div class="mb-8">
                <div class="flex items-center mb-4">
                    <input type="checkbox" id="useVoiceStyle" v-model="vconfig.useStyle" :disabled="!hasStyle"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label for="useVoiceStyle" v-if="hasStyle"
                        class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">使用声音风格</label>
                    <label for="useVoiceStyle" v-else
                        class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">使用声音风格（禁用，该声音没有风格）</label>
                </div>
                <div v-if="vconfig.useStyle && hasStyle">
                    <label style="align-items: self-start;" for="voiceStyleSelect" class="label-general">声音风格
                        (voiceStyle)：</label>
                    <select id="voiceStyleSelect" v-model="vconfig.style"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option v-for="style in vconfig.voice?.VoiceStyleNames" :key="style" :value="style">{{ style }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="mb-8">
                <label for="rateRange" class="label-general">语速
                    (rate)：</label>
                <select name="sudo" id="rateRange" v-model="vconfig.rate"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="default">默认 (default)</option>
                    <option value="x-slow">极低 (x-slow)</option>
                    <option value="slow">低 (slow)</option>
                    <option value="medium">中 (medium)</option>
                    <option value="fast">高 (fast)</option>
                    <option value="x-fast">极高 (x-fast)</option>
                </select>
            </div>
            <div>
                <label for="pitchRange" class="label-general">音调(pitch)：</label>
                <select name="sudo" id="pitchRange" v-model="vconfig.pitch"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="default">默认 (default)</option>
                    <option value="x-low">极低 (x-low)</option>
                    <option value="low">低 (low)</option>
                    <option value="medium">中 (medium)</option>
                    <option value="high">高 (high)</option>
                    <option value="x-high">极高 (x-high)</option>
                </select>
            </div>
        </Placement>
        <Placement v-if="voiceList && vconfig.voice" class="mb-4">
            <h2 class="text-4xl font-extrabold dark:text-white">试听
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="useTest" class="sr-only peer" @click="useTest = !useTest">
                    <div
                        class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                    </div>
                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-white">{{ useTest ? "隐藏" : "显示" }}</span>
                </label>
            </h2>
            <div v-if="useTest">
                <textarea id="message" rows="4" v-model="testText"
                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
                    placeholder="试听文字"></textarea>
                <Button @click="getTestAudio()">试听</Button>
                <audio controls v-if="audioBlobUrl !== ''" :src="audioBlobUrl" class="mt-8"></audio>
            </div>

        </Placement>
        <Placement v-if="voiceList && vconfig.voice">
            <h2 class="text-4xl font-extrabold dark:text-white mb-4">导出</h2>
            <div class="mb-4">
                <label for="legadoButton" class="label-general">阅读
                    (legado)：</label>
                <div id="legadoButton" class="inline-flex rounded-md shadow-sm" role="group">
                    <Button @click="copyLegadoConfig" class="mr-1"> 复制配置 </Button>
                    <Button @click="copyLegadoLink" class="mr-1"> 复制网络导入链接 </Button>
                    <Button @click="import2Legado" class="mr-1"> 一键导入 </Button>
                </div>
            </div>
            <div class="mb-4">
                <label for="AiyueButton" class="label-general">爱阅记：</label>
                <div id="AiyueButton">
                    <Button @click="copyAiyueConfig">复制配置</Button>
                </div>
            </div>
            <div>
                <label for="souceReaderButton" class="label-general">源阅读：</label>
                <div id="souceReaderButton">
                    <Button @click="copySourceReaderLink">复制网络导入链接</Button>
                </div>
            </div>
        </Placement>
    </div>
    <Footer />
</template>

<script setup lang="ts">
import genAiyue from '~/utils/genAiyue';
import genLegado from '~/utils/genLegado';


export interface Api {
    key: string,
    region: string
}

export interface VoiceAttr {
    LocalName: string,
    ShortName: string,
    VoiceStyleNames: Array<string> | null
}
export interface VoiceConfig {
    voice: VoiceAttr | null,
    useStyle: boolean,
    style: string[] | null,
    rate: string,
    pitch: string
}

const initApi: Api = {
    key: '',
    region: 'eastasia'
}

const initConfig: VoiceConfig = {
    voice: null,
    useStyle: false,
    style: null,
    rate: 'default',
    pitch: 'default'
}

const api = ref(initApi)
const voiceList = ref()
const vconfig: Ref<VoiceConfig> = ref(initConfig)

const useTest = ref(false)
const testText = ref("")
const audioPlayer = ref(null);
const audioBlobUrl = ref('');

const hasStyle = computed(() =>
    vconfig.value.voice !== null && vconfig.value.voice.VoiceStyleNames !== null
)
onMounted(() => {
    console.log(vconfig.value)
    api.value = {
        key: localStorage.getItem('apiKey') || '',
        region: localStorage.getItem('apiRegion') || ''
    }
    if (api.value.key && api.value.region) {
        try {
            voiceList.value = JSON.parse(localStorage.getItem('voiceList') || '')
        }
        catch (err) {
            console.log(err)
        }
    }
})
watch(api, (newVal) => {
    localStorage.setItem('apiKey', newVal.key)
    localStorage.setItem('apiRegion', newVal.region)
}, { deep: true })
watch(voiceList, (newVal) => {
    localStorage.setItem('voiceList', JSON.stringify(newVal))
}, { deep: true })


/**
 * Retrieves the list of available voices.
 */
function getVoiceList() {
    console.log(api.value.key, api.value.region)
    $fetch(`https://eastasia.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
        headers: {
            'Ocp-Apim-Subscription-Key': api.value.key,
        }
    }).then(res => {
        if (!Array.isArray(res)) {
            console.log("fetch list", res)
            alert("获取声音列表失败，请检查 API Key 和 API Region 是否正确")
            return
        }
        const zhVoices = res.filter(voice =>
            voice.Locale.startsWith("zh")
        ).map(voice => {
            const styles: Array<string> | null = voice.StyleList || null;
            return {
                LocalName: voice.LocalName,
                ShortName: voice.ShortName,
                VoiceStyleNames: styles,
            };
        });
        // console.log(zhVoices)
        voiceList.value = zhVoices
    }).catch(err => {
        console.log("fetch list", err)
    })
}
function genSSML(config: VoiceConfig, text: string) {
    if (!vconfig.value.voice)
        return
    let pitch = vconfig.value.pitch === "default" ? null : vconfig.value.pitch;
    let ssml =
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">` +
        `<voice name="${vconfig.value.voice.ShortName}">` +
        `${pitch ? `<prosody pitch="${vconfig.value.pitch}">` : ""}` +
        `${vconfig.value.useStyle ? `<mstts:express-as style="${vconfig.value.style}">` : ""}` +
        `${testText.value ? testText.value : "帮忙点个 Star 吧"}` +
        `${vconfig.value.useStyle ? `</mstts:express-as>` : ""}` +
        `${pitch ? `</prosody>` : ""}` +
        `</voice></speak>`
    console.log(ssml)
    return ssml
}

async function getTestAudio() {
    if (audioPlayer === null || !vconfig.value.voice)
        return
    $fetch(`https://${api.value.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': api.value.key,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'User-Agent': 'TTSForLegado',
        },
        body: genSSML(vconfig.value, testText.value),
        responseType: "blob"
    }).then(response => {
        // 创建一个 Blob URL
        const audioBlob = response;
        if (audioBlobUrl.value !== '') {
            URL.revokeObjectURL(audioBlobUrl.value);
        }
        audioBlobUrl.value = URL.createObjectURL(audioBlob as Blob);
        console.log(audioBlobUrl.value)

        // 绑定 Blob URL 到 <audio> 元素并播放
        if (audioPlayer.value) {
            (audioPlayer.value as HTMLAudioElement).src = audioBlobUrl.value;
        }
    }).catch(err => {
        console.log("fetch audio", err)
    })
}

function copyLegadoConfig() {
    let config = genLegado(api.value, vconfig.value)
    try {
        navigator.clipboard.writeText(config);
    } catch (err) {
        console.log(err)
        alert("复制失败")
    }
}

function copyLegadoLink() {
    let config = genLegado(api.value, vconfig.value)
    let link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    try {
        navigator.clipboard.writeText(link);
    } catch (err) {
        console.log(err)
        alert("复制失败，请手动复制")
    }
}

function import2Legado() {
    let config = genLegado(api.value, vconfig.value)
    let link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    let leagdoLink = `legado://import/httpTTS?src=${encodeURIComponent(link)}`
    window.open(leagdoLink, "_blank")
}


function copyAiyueConfig() {
    let config = genAiyue(api.value, vconfig.value)
    try {
        navigator.clipboard.writeText(config);
    } catch (err) {
        console.log(err)
        alert("复制失败")
    }
}


function copySourceReaderLink() {
    let config = JSON.parse(genLegado(api.value, vconfig.value));
    config = [config]
    config = JSON.stringify(config)
    let link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    try {
        navigator.clipboard.writeText(link);
    } catch (err) {
        console.log(err)
        alert("复制失败，请手动复制")
    }
}
</script> 

<style scoped lang="scss">
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
    .label-general {
        @apply block mb-2 text-sm font-medium text-gray-900 dark:text-white;
    }
}
</style>
