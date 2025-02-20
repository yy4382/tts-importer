function buildLegadoUrl(
  apiPath: string,
  options: {
    voiceName: string;
    pitch?: string;
    rate?: string;
    format?: string;
    volume?: string;
    token?: string;
  },
) {
  const { voiceName, pitch, volume, token, format } = options;
  const url = new URL(apiPath);
  url.searchParams.set("voiceName", voiceName);
  if (pitch) url.searchParams.set("pitch", pitch);
  // if (rate) url.searchParams.set("rate", rate);
  if (volume) url.searchParams.set("volume", volume);
  if (token) url.searchParams.set("token", token);
  if (format) url.searchParams.set("format", format);
  return `${url.toString()}&rate={{speakSpeed - 9}}&text={{String(speakText).replace(/&/g, '&amp;').replace(/\\\"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}}`;
}

function getName(options: { voiceName: string }) {
  return `Read Aloud ${options.voiceName}`;
}

export function generateProfile(
  type: "legado" | "ireadnote" | "sourcereader",
  apiUrl: string,
  options: {
    voiceName: string;
    pitch?: string;
    rate?: string;
    format?: string;
    volume?: string;
    token?: string;
  },
) {
  const apiPath = `${new URL(apiUrl).origin}/api/synthesis`;
  const url = buildLegadoUrl(apiPath, options);
  switch (type) {
    case "legado":
      return {
        name: getName(options),
        url,
        loginCheckJs: "",
        loginUi: "",
        loginUrl: "",
        id: Date.now(),
      };
    case "sourcereader":
      return url;
    case "ireadnote": {
      const config = {
        _ClassName: "JxdAdvCustomTTS",
        _TTSConfigID: generateRandomString(16),
        ttsConfigGroup: `☁️ Edge@CF ${new URL(apiPath).hostname}`,
        ttsHandles: [
          {
            forGetMethod: 1,
            processType: 1,
            params: {
              text: "%@",
              ...options,
            },
            url: apiPath,
            parser: {
              playData: "ResponseData",
            },
          },
        ],
        _TTSName: getName(options),
      };
      return config;
    }
  }
}

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
