import { url2config } from "@/lib/config-to-url";
import legadoConfig from "@/lib/legado";
import PostHogClient from "@/lib/posthog-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = url2config(url);
  if (result.success) {
    const posthog = PostHogClient();
    posthog?.capture({
      event: "remote profile generated",
      distinctId: request.headers.get("x-forwarded-for") ?? "unknown",
      properties: {
        type: "azure",
        app: "legado",
        ua: request.headers.get("user-agent") ?? "unknown",
      },
    });
    posthog?.shutdown();
    return new Response(legadoConfig(result.data.api, result.data.voice), {
      headers: {
        "content-type": "application/json",
      },
    });
  } else {
    return new Response("Bad Request", {
      status: 400,
    });
  }
}
