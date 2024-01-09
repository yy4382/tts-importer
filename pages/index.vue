<template>
    <NavBar />
    <div class="mb-auto py-4">
        <Placement class="mb-4">
            <h2 class="text-4xl font-extrabold dark:text-white mb-4">输入 key：</h2>
            <div class="mb-5">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">API Region</label>
                <input type="text" id="email" v-model="api.region"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="eastasia" required>
            </div>
            <div class="mb-5">
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your API
                    Key</label>
                <input type="password" id="password" v-model="api.key"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required>
            </div>
            <button type="submit" @click="getVoiceList" :disabled="!api.key || !api.region"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-500 disabled:hover:bg-gray-500">Submit</button>
        </Placement>
        <Placement v-if="voiceList" class="mb-4">
            <h2 class="text-4xl font-extrabold dark:text-white mb-4">选择声音：</h2>
            <div class="mb-8">
                <label for="voiceSelect" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">声音
                    (voice)：</label>
                <select id="voiceSelect" v-model="selAttr.voice"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option v-for="item in voiceList" :key="item.ShortName" :value="item">
                        {{ item.LocalName + " " + item.ShortName }}
                    </option>
                </select>
            </div>
            <div class="mb-8">
                <div class="flex items-center mb-4">
                    <input type="checkbox" id="useVoiceStyle" v-model="selAttr.useStyle" :disabled="!hasStyle"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label for="useVoiceStyle" v-if="hasStyle"
                        class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">使用声音风格</label>
                    <label for="useVoiceStyle" v-else
                        class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">使用声音风格（禁用，该声音没有风格）</label>
                </div>
                <div v-if="selAttr.useStyle && hasStyle">
                    <label style="align-items: self-start;" for="voiceStyleSelect"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">声音风格 (voiceStyle)：</label>
                    <select id="voiceStyleSelect" v-model="selAttr.style"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option v-for="style in selAttr.voice?.VoiceStyleNames" :key="style" :value="style">{{ style }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="mb-8">
                <label for="rateRange" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">语速
                    (rate)：</label>
                <select name="sudo" id="rateRange" v-model="selAttr.rate"
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
                <label for="pitchRange"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">音调(pitch)：</label>
                <select name="sudo" id="pitchRange" v-model="selAttr.pitch"
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
        <Placement v-if="voiceList">
            <h2 class="text-4xl font-extrabold dark:text-white mb-4">导出：</h2>
            <div class="mb-4">
                <label for="legadoButton" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">阅读
                    (legado)：</label>
                <div id="legadoButton" class="inline-flex rounded-md shadow-sm" role="group">
                    <button type="button" @click="copyLegadoConfig"
                        class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                        复制配置
                    </button>
                    <button type="button" @click="copyLegadoLink"
                        class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                        复制网络导入链接
                    </button>
                    <button type="button" @click="import2Legado"
                        class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                        一键导入
                    </button>
                </div>
            </div>
            <div class="mb-4">
                <label for="AiyueButton" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">爱阅记：</label>
                <div id="AiyueButton">
                    <Button @click="copyAiyueConfig">复制配置</button>
                </div>
            </div>
            <div>
                <label for="souceReaderButton"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">源阅读：</label>
                <div id="souceReaderButton">
                    <Button @click="copySourceReaderLink">复制网络导入链接</Button>
                </div>
            </div>
        </Placement>
    </div>
    <Footer />
</template>

<script setup lang="ts">
import { defineComponent, ref, watch, type Ref } from 'vue'
const api = ref({ key: '', region: 'eastasia' })
const voiceList = ref()
interface Voice {
    LocalName: string,
    ShortName: string,
    VoiceStyleNames: Array<string> | null
}
interface SelAttr {
    voice: Voice | null,
    useStyle: boolean,
    style: string[] | null,
    rate: string,
    pitch: string
}
const initAttr: SelAttr = {
    voice: null,
    useStyle: false,
    style: null,
    rate: 'default',
    pitch: 'default'
}
const selAttr: Ref<SelAttr> = ref(initAttr)

const hasStyle = computed(() => {
    console.log(selAttr.value.voice)
    console.log(selAttr.value.voice !== null && 'VoiceStyleNames' in selAttr.value.voice)
    return selAttr.value.voice !== null && selAttr.value.voice.VoiceStyleNames !== null
})
onMounted(() => {
    console.log(selAttr.value)
    api.value = {
        key: localStorage.getItem('apiKey') || '',
        region: localStorage.getItem('apiRegion') || ''
    }
    if (api.value.key && api.value.region) {
        try{
            voiceList.value = JSON.parse(localStorage.getItem('voiceList')||'')
        }
        catch(err){
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
 * Generates a random string of the specified length.
 * 
 * @param {number} length - The length of the random string to generate.
 * @returns {string} The randomly generated string.
 */
function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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
/**
 * Generates the Aiyue configuration.
 * 
 * @returns {string} The Aiyue configuration.
 */
function generateAiyueConfig(): string {
    if (!selAttr.value.voice) {
        alert("请选择声音")
        return ""
    }
    let pitch = selAttr.value.pitch === "default" ? null : selAttr.value.pitch;
    let ssml = `<speak version="1.0" xml:lang="zh-CN"><voice name="${selAttr.value.voice.ShortName}">${pitch ? `<prosody pitch="${selAttr.value.pitch}">` : ""}${selAttr.value.useStyle ? `<mstts:express-as style="${selAttr.value.style}">` : ""}%@${selAttr.value.useStyle ? `</mstts:express-as>` : ""}${pitch ? `</prosody>` : ""}</voice></speak>`
    let config = {
        "loginUrl": "",
        "maxWordCount": "",
        "ttsConfigGroup": "Azure",
        "_ClassName": "JxdAdvCustomTTS",
        "_TTSConfigID": generateRandomString(32),
        "httpConfigs":
        {
            "useCookies": 1,
            "headers": {}
        },
        "ttsHandles":
            [
                {
                    "processType": 1,
                    "maxPageCount": 1,
                    "nextPageForGetMedthod": 1,
                    "forGetMethod": 0,
                    "requestByWebView": 0,
                    "nextPageParams":
                        {},
                    "parser":
                    {
                        "playData": "ResponseData"
                    },
                    "url": `https://${api.value.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
                    "params":
                    {
                        "text": ssml
                    },
                    "httpConfigs":
                    {
                        "useCookies": 1,
                        "customFormatParams": "params[text]",
                        "headers":
                        {
                            "Content-Type": "application/ssml+xml",
                            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
                            "ocp-apim-subscription-key": `${api.value.key}`
                        }
                    }
                }
            ],
        "_TTSName": `Azure ${selAttr.value.voice.LocalName}${selAttr.value.style || ""}${pitch ? pitch : ""}`,
    }
    return JSON.stringify(config)
}
function copyAiyueConfig() {
    let config = generateAiyueConfig()
    try {
        navigator.clipboard.writeText(config);
    } catch (err) {
        console.log(err)
        alert("复制失败")
    }
}
function generateLegadoConfig() {
    if (!selAttr.value.voice) {
        alert("请选择声音")
        return ""
    }
    let header = {
        "Ocp-Apim-Subscription-Key": api.value.key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        "User-Agent": "legado"
    }
    let ssml = `<speak version="1.0" xml:lang="zh-CN">` +
        `<voice name="${selAttr.value.voice.ShortName}">` +
        `<prosody rate="{{speakSpeed*4}}%" pitch="${selAttr.value.pitch}">` +
        `${selAttr.value.useStyle ? `<mstts:express-as style="${selAttr.value.style}">` : ""}` +
        `{{speakText}}` +
        `${selAttr.value.useStyle ? `</mstts:express-as>` : ""}` +
        `</prosody>` +
        `</voice>` +
        `</speak>`
    let urlConfig = {
        method: "POST",
        body: ssml
    }
    let config = {
        "concurrentRate": "0",
        "contentType": "audio/mpeg",
        "header": JSON.stringify(header),
        "id": parseInt(Date.now() + "", 10),
        "loginCheckJs": "",
        "loginUi": "",
        "loginUrl": "",
        "name": `Azure ${selAttr.value.voice.LocalName}${selAttr.value.style || ""}${selAttr.value.pitch === "default" ? "" : " - " + selAttr.value.pitch}`,
        "url": `https://${api.value.region}.tts.speech.microsoft.com/cognitiveservices/v1,${JSON.stringify(urlConfig)}`
    }

    return JSON.stringify(config)

}
function copyLegadoConfig() {
    let config = generateLegadoConfig()
    try {
        navigator.clipboard.writeText(config);
    } catch (err) {
        console.log(err)
        alert("复制失败")
    }
}
function copyLegadoLink() {
    let config = generateLegadoConfig()
    let link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    try {
        navigator.clipboard.writeText(link);
    } catch (err) {
        console.log(err)
        alert("复制失败，请手动复制")
    }
}
function copySourceReaderLink() {
    let config = JSON.parse(generateLegadoConfig());
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
function import2Legado() {
    let config = generateLegadoConfig()
    let link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`
    let leagdoLink = `legado://import/httpTTS?src=${encodeURIComponent(link)}`
    window.open(leagdoLink, "_blank")
}
</script> 