export function isValidXML(xmlString: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    const parseError = doc.querySelector("parsererror");
    return parseError === null;
  } catch {
    return false;
  }
}
