import { XMLParser } from "fast-xml-parser";

import { PublicAuthActions, PublicChatEntry } from "./MainPageClient";

type NewsItem = {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
};

const fallbackNews: NewsItem[] = [
  {
    title: "Biotech financing, FDA strategy, and pharma partnering signals are loading.",
    source: "BBW live feed",
    url: "#",
    publishedAt: "Live",
  },
  {
    title: "Ask BBW to summarize today's biotech funding and startup news.",
    source: "Business agent",
    url: "#",
    publishedAt: "Ready",
  },
];

async function getBiotechNews(): Promise<NewsItem[]> {
  const query = encodeURIComponent(
    "biotech startup funding OR biotech investment OR biopharma partnership",
  );
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      headers: {
        "user-agent": "BBWAgentPrototype/1.0",
      },
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return fallbackNews;
    }

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true,
    });
    const payload = parser.parse(xml) as {
      rss?: {
        channel?: {
          item?: Array<{
            title?: string;
            link?: string;
            pubDate?: string;
            source?: string | { "#text"?: string };
          }>;
        };
      };
    };

    const items = payload.rss?.channel?.item ?? [];
    const articles = items
      .filter((item) => item.title && item.link)
      .slice(0, 5)
      .map((item) => {
        const { title, source } = splitGoogleTitle(item.title ?? "");
        return {
          title,
          source: readSource(item.source) ?? source ?? "Google News",
          url: item.link ?? "#",
          publishedAt: item.pubDate ? formatPublishedDate(item.pubDate) : "Recent",
        };
      });

    return articles.length > 0 ? articles : fallbackNews;
  } catch {
    return fallbackNews;
  }
}

function splitGoogleTitle(title: string) {
  const parts = title.split(" - ");
  if (parts.length < 2) {
    return { title, source: undefined };
  }

  return {
    title: parts.slice(0, -1).join(" - "),
    source: parts.at(-1),
  };
}

function readSource(source: string | { "#text"?: string } | undefined) {
  if (!source) {
    return undefined;
  }

  if (typeof source === "string") {
    return source;
  }

  return source["#text"];
}

function formatPublishedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const suggestions = [
  "How should we prepare for our seed extension?",
  "What business risks will investors ask about?",
  "Summarize biotech funding news relevant to us.",
];

export default async function Home() {
  const news = await getBiotechNews();

  return (
    <main className="clean-main">
      <header className="clean-topbar">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" />
          </span>
          <span>BBW</span>
        </a>
        <PublicAuthActions />
      </header>

      <section className="clean-landing" aria-labelledby="main-title">
        <p className="clean-kicker">AI business agent for biomedical startups</p>
        <h1 id="main-title">How can I help your biotech company today?</h1>

        <PublicChatEntry suggestions={suggestions} />

        <section className="live-news" aria-labelledby="news-title">
          <div className="live-news-header">
            <h2 id="news-title">Live biotech business news</h2>
            <span>Refreshes every few minutes</span>
          </div>
          <div className="feed-list">
            {news.map((item) => (
              <a className="feed-item" href={item.url} key={`${item.title}-${item.source}`}>
                <span>{item.source}</span>
                <p>{item.title}</p>
                <time>{item.publishedAt}</time>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
