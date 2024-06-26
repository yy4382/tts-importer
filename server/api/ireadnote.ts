import genAiyue from "~/utils/genAiyue";
import { serverSchema } from "~/utils/types";
export default defineEventHandler((event) => {
  const query = getQuery(event);
  if (!query.config) return { error: "Missing config" };
  const config = serverSchema.parse(JSON.parse(String(query.config)));
  const api = config.api;
  const voiceChoice = config.voiceChoice;
  const artifact = genAiyue(api, voiceChoice);
  return JSON.parse(artifact);
});
