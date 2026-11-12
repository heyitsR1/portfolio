// Serves the static site like Vercel did: exact paths (/projects.html stays /projects.html),
// directory indexes (/ and /stuff/), the bare domain redirected to www, and http to https.
const APEX = "aarohanniraula.com.np";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Bare domain -> www, and http -> https (Vercel did both; the zone doesn't force HTTPS).
    const local = url.hostname.endsWith(".workers.dev") || url.hostname === "localhost";
    if (url.hostname === APEX || (url.protocol === "http:" && !local)) {
      url.hostname = url.hostname === APEX ? `www.${APEX}` : url.hostname;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 308);
    }
    // /stuff -> /stuff/ (so relative links inside the page resolve), then directory -> index.html
    if (!url.pathname.endsWith("/") && !url.pathname.split("/").pop().includes(".")) {
      const dir = await env.ASSETS.fetch(new URL(`${url.pathname}/index.html`, url), request);
      if (dir.ok) {
        url.pathname += "/";
        return Response.redirect(url.toString(), 308);
      }
    }
    if (url.pathname.endsWith("/")) {
      return env.ASSETS.fetch(new Request(new URL(`${url.pathname}index.html${url.search}`, url), request));
    }
    return env.ASSETS.fetch(request);
  },
};
