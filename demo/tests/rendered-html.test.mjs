import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the BBW public landing page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>BBW<\/title>/i);
  assert.match(html, /AI business agent for biomedical startups/);
  assert.match(html, /How can I help your biotech company today/);
  assert.match(html, /Live biotech business news/);
  assert.match(html, /Ask about fundraising, FDA strategy, IP, market access, hiring/);
  assert.doesNotMatch(html, /action="\/workspace\/working-sessions"/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/);
});

test("server-renders the logged-in workspace routes", async () => {
  const routes = [
    ["/workspace", "Company Info"],
    ["/workspace/working-sessions", "Working Session"],
    ["/workspace/working-sessions/history", "Session History"],
    ["/workspace/working-sessions/plan-execution", "Plan Execution"],
    ["/workspace/project-board", "Plan Execution"],
    ["/workspace/project-management", "Plan Execution"],
    ["/workspace/community", "My Communities"],
    ["/workspace/community/explore", "Explore Communities"],
    ["/workspace/community/request", "Request a Community"],
  ];

  for (const [path, heading] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, new RegExp(heading));
    assert.match(html, /Demo Biotech Company/);
    assert.match(html, /Working Session/);
    assert.match(html, /Company Info/);
    assert.match(html, /Community/);
  }
});

test("keeps chat interaction inside Working Sessions", async () => {
  const workingSessions = await render("/workspace/working-sessions");
  const workingHtml = await workingSessions.text();
  assert.match(workingHtml, /What business decision are you working on/);
  assert.match(workingHtml, /Prepare our seed extension investor narrative/);
  assert.match(workingHtml, /session-chatbar/);
  assert.doesNotMatch(workingHtml, /Historical sessions/);
  assert.doesNotMatch(workingHtml, /Current chat window|Preview state|Example/);

  const history = await render("/workspace/working-sessions/history");
  const historyHtml = await history.text();
  assert.match(historyHtml, /Historical topics/);

  const overview = await render("/workspace");
  const overviewHtml = await overview.text();
  assert.doesNotMatch(overviewHtml, /session-chatbar|What business decision are you working on/);
});

test("removes disposable starter UI from source", async () => {
  const [
    page,
    layout,
    packageJson,
    workingSessionsClient,
    mainPageClient,
    reusableChat,
    formattedMessage,
  ] =
    await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(
      new URL("../app/workspace/working-sessions/WorkingSessionsClient.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/MainPageClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ReusableChatWindow.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FormattedMessage.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.match(layout, /title:\s*"BBW"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(workingSessionsClient, /ReusableChatWindow/);
  assert.match(workingSessionsClient, /URLSearchParams\(window\.location\.search\)/);
  assert.match(mainPageClient, /role="dialog"/);
  assert.match(mainPageClient, /bbw-company-session/);
  assert.match(mainPageClient, /window\.location\.assign\("\/workspace"\)/);
  assert.match(mainPageClient, /sessionId/);
  assert.match(mainPageClient, /setActiveChat/);
  assert.match(workingSessionsClient, /sessionId/);
  assert.match(workingSessionsClient, /createChatSessionId/);
  assert.match(reusableChat, /Export as project/);
  assert.match(reusableChat, /session-id-label/);
  assert.match(reusableChat, /FormattedMessage/);
  assert.match(formattedMessage, /renderTable/);
});
