import genLegado from "~/utils/genLegado";
import { serverSchema } from "~/utils/types";
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!query.config) return { error: "Missing config" };
  const config = serverSchema.parse(JSON.parse(String(query.config)));
  const api = config.api;
  const voiceChoice = config.voiceChoice;
  const artifact = genLegado(api, voiceChoice);
  return [JSON.parse(artifact)];
});
