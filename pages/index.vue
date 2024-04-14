<template>
    <div>
        <NavBar />
        <div class="mb-auto mx-4 py-4 flex flex-col lg:flex-row justify-center">
            <div v-if="voiceList" class="lg:mr-4">
                <IPlacement v-if="voiceList" class="mb-4">
                    <h2 class="text-4xl font-extrabold dark:text-white mb-4">👇 语音选择</h2>
                    <div class="mb-8">
                        <label for="voiceSelect" class="label-general">声音
                            (voice)：</label>
                        <select id="voiceSelect" v-model="vconfig.voice" class="select-general">
                            <option v-for="item in voiceList" :key="item.ShortName" :value="item">
                                {{ item.LocalName + " " + item.ShortName }}
                            </option>
                        </select>
                    </div>
                    <div class="mb-8">
                        <div class="flex items-center mb-4">
                            <input id="useVoiceStyle" v-model="vconfig.useStyle" type="checkbox" :disabled="!selVoiceStyle"
                                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <label v-if="selVoiceStyle" for="useVoiceStyle"
                                class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">使用声音风格</label>
                            <label v-else for="useVoiceStyle"
                                class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">使用声音风格（禁用，该声音没有风格）</label>
                        </div>
                        <div v-if="vconfig.useStyle && selVoiceStyle">
                            <label style="align-items: self-start;" for="voiceStyleSelect" class="label-general">声音风格
                                (voiceStyle)：</label>
                            <select id="voiceStyleSelect" v-model="vconfig.style" class="select-general">
                                <option v-for="style in selVoiceStyle" :key="style" :value="style">{{ style }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <!-- <div class="mb-8">
                        <label for="rateRange" class="label-general">语速
                            (rate)：</label>
                        <select id="rateRange" v-model="vconfig.rate" name="sudo"
                            class="select-general">
                            <option value="default">默认 (default)</option>
                            <option value="x-slow">极低 (x-slow)</option>
                            <option value="slow">低 (slow)</option>
                            <option value="medium">中 (medium)</option>
                            <option value="fast">高 (fast)</option>
                            <option value="x-fast">极高 (x-fast)</option>
                        </select>
                    </div> -->
                    <div class="mb-4">
                        <label for="pitchRange" class="label-general">音调(pitch)：</label>
                        <select id="pitchRange" v-model="vconfig.pitch" name="sudo" class="select-general">
                            <option value="default">默认 (default)</option>
                            <option value="x-low">极低 (x-low)</option>
                            <option value="low">低 (low)</option>
                            <option value="medium">中 (medium)</option>
                            <option value="high">高 (high)</option>
                            <option value="x-high">极高 (x-high)</option>
                        </select>
                    </div>
                    <div class="dark:text-white text-sm">
                        <p>*注：不再提供语速参数选择。</p>
                        <p>各个阅读软件都有自带的语速选择，这里所选的语速会被覆盖。</p>
                    </div>
                </IPlacement>
                <IPlacement v-if="voiceList && vconfig.voice" class="mb-4">
                    <h2 class="text-4xl font-extrabold dark:text-white mb-4">📤 导出</h2>
                    <div class="mb-4">
                        <label for="legadoButton" class="label-general">阅读(legado)</label>
                        <div id="legadoButton" class="inline-flex rounded-md shadow-sm" role="group">
                            <IButton class="mr-1" @click="copyLegadoConfig"> 复制配置 </IButton>
                            <IButton class="mr-1" @click="copyLegadoLink"> 复制网络导入链接 </IButton>
                            <IButton class="mr-1" @click="import2Legado"> 一键导入 </IButton>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label for="AiyueButton" class="label-general">爱阅记</label>
                        <div id="AiyueButton">
                            <IButton class="mr-1" @click="copyAiyueConfig">复制配置</IButton>
                            <IButton @click="import2Aiyue">一键导入</IButton>
                        </div>
                    </div>
                    <div>
                        <label for="souceReaderButton" class="label-general">源阅读</label>
                        <div id="souceReaderButton">
                            <IButton @click="copySourceReaderLink">复制网络导入链接</IButton>
                        </div>
                    </div>
                </IPlacement>
            </div>
            <div>
                <IPlacement v-if="voiceList && vconfig.voice" class="mb-4">
                    <div class="flex justify-between">
                        <h2 class="text-4xl font-extrabold dark:text-white">📢 试听</h2>
                        <div class="inline-flex items-center">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input v-model="useTest" type="checkbox" class="sr-only peer" @click="useTest = !useTest">
                                <div
                                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                </div>
                                <span class="ml-3 text-sm font-medium text-gray-900 dark:text-white">{{ useTest ? "隐藏" :
                                    "显示"
                                }}</span>
                            </label>
                        </div>
                    </div>
                    <div v-if="useTest">
                        <textarea id="message" v-model="testText" rows="4"
                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
                            placeholder="试听文字"></textarea>
                        <IButton @click="getTestAudio()">试听</IButton>
                        <audio v-if="audioBlobUrl !== ''" controls :src="audioBlobUrl" class="mt-8"></audio>
                    </div>
                </IPlacement>

                <IPlacement class="">
                    <h2 class="text-4xl font-extrabold dark:text-white mb-4">🔑 输入 key</h2>
                    <div class="mb-5">
                        <label for="email" class="label-general">API Region</label>
                        <input id="email" v-model="api.region" type="text" class="select-general" required>
                    </div>
                    <div class="mb-5">
                        <label for="password" class="label-general">Your API
                            Key</label>
                        <input id="password" v-model="api.key" type="password" class="select-general" required>
                    </div>
                    <IButton :disabled="!api.key || !api.region" @click="getVoiceList">获取声音列表</IButton>
                </IPlacement>
            </div>
        </div>
        <IPlacement class="max-w-sm mx-auto dark:text-white">
            <p>本站不会储存你的 Key。数据缓存于本地浏览器中。</p>
            <p>具体请见此<a href="https://github.com/yy4382/tts-importer?tab=readme-ov-file#%E9%9A%90%E7%A7%81%E8%AF%B4%E6%98%8E"
                    class=" text-blue-700 dark:text-blue-400">说明</a>。</p>
        </IPlacement>
        <IFooter />
    </div>
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

const selVoiceStyle: ComputedRef<string[]> = computed(() => {
    if (vconfig.value.voice === null) return Array<string>();
    return voiceList.value.find((item: VoiceAttr) => item.ShortName === vconfig.value.voice?.ShortName)?.StyleNames || [];
})

onMounted(() => {
    api.value = {
        key: localStorage.getItem('apiKey') || '',
        region: localStorage.getItem('apiRegion') || 'eastasia'
    }
    if (api.value.key && api.value.region) {
        try {
            voiceList.value = JSON.parse(localStorage.getItem('voiceList') || '')
        }
        catch (err) {
            console.error(err)
        }
    }
    if (voiceList.value) {
        const voice = voiceList.value[0]
        if (voice) {
            vconfig.value.voice = voice
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
    if (!api.value.key || !api.value.region) {
        alert("请输入 API Key 和 API Region")
        return
    }
    $fetch(`https://${api.value.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
        headers: {
            'Ocp-Apim-Subscription-Key': api.value.key,
        }
    }).then(res => {
        if (!Array.isArray(res)) {
            console.error("fetch list", res)
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
                StyleNames: styles,
            };
        });
        // console.log(zhVoices)
        voiceList.value = zhVoices
    }).catch(err => {
        console.error("fetch list", err)
    })
}
function genSSML(config: VoiceConfig, text: string) {
    if (!config.voice)
        return
    const pitch = config.pitch === "default" ? null : config.pitch;
    const ssml =
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
        `<voice name="${config.voice.ShortName}">` +
        `${pitch ? `<prosody pitch="${config.pitch}">` : ""}` +
        `${config.useStyle ? `<mstts:express-as style="${config.style}">` : ""}` +
        `${testText.value ? text : "帮忙点个 Star 吧"}` +
        `${config.useStyle ? `</mstts:express-as>` : ""}` +
        `${pitch ? `</prosody>` : ""}` +
        `</voice></speak>`
    return ssml
}

function getTestAudio() {
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

        // 绑定 Blob URL 到 <audio> 元素并播放
        if (audioPlayer.value) {
            (audioPlayer.value as HTMLAudioElement).src = audioBlobUrl.value;
        }
    }).catch(err => {
        console.error("fetch audio", err)
    })
}

function copyLegadoConfig() {
    const config = genLegado(api.value, vconfig.value)
    try {
        navigator.clipboard.writeText(config);
    } catch (err) {
        console.error(err)
        alert("复制失败")
    }
}

function copyLegadoLink() {
    const config = genLegado(api.value, vconfig.value)
    const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    try {
        navigator.clipboard.writeText(link);
    } catch (err) {
        console.error(err)
        alert("复制失败，请手动复制")
    }
}

function import2Legado() {
    const config = genLegado(api.value, vconfig.value)
    const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    const leagdoLink = `legado://import/httpTTS?src=${encodeURIComponent(link)}`
    window.open(leagdoLink, "_blank")
}


function copyAiyueConfig() {
    const config = genAiyue(api.value, vconfig.value)
    try {
        navigator.clipboard.writeText(config);
    } catch (err) {
        console.error(err)
        alert("复制失败")
    }
}

function import2Aiyue() {
    if (!vconfig.value.voice) {
        alert("请选择声音")
        return {}
    }
    const config = JSON.stringify({ api: api.value, vconfig: vconfig.value });
    const link = `${window.location.protocol}//${window.location.host}/api/ireadnote?config=${encodeURIComponent(config)}`
    const aiyueLink = `iReadNote://import/itts=${link}`
    window.open(aiyueLink, "_blank")
}


function copySourceReaderLink() {
    let config = JSON.parse(genLegado(api.value, vconfig.value));
    config = [config]
    config = JSON.stringify(config)
    const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    try {
        navigator.clipboard.writeText(link);
    } catch (err) {
        console.error(err)
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

    .select-general {
        @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
    }
}
</style>
