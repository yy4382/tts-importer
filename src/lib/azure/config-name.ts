export default function generateConfigName(
  localName: string,
  style: string | null
) {
  return `☁️ Azure ${localName}${style ? ` ${style}` : ""}`;
}
