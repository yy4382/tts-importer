import { url2config } from "@/lib/config-to-url";
import ifreetimeConfig from "@/lib/ifreetime";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = url2config(url);
  if (result.success) {
    return new Response(ifreetimeConfig(result.data.api, result.data.voice), {
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
