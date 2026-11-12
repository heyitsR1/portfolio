// Serves the static site like Vercel did: exact paths (/projects.html stays /projects.html),
// directory indexes (/ and /stuff/), and the bare domain redirected to www.
const APEX = "aarohanniraula.com.np";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === APEX) {
      url.hostname = `www.${APEX}`;
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
