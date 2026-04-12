'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface BlogContentFrameProps {
  html: string;
  className?: string;
}

const safeHtml = (value: string): string => {
  if (!value) {
    return '';
  }

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, '$1="#"');
};

const buildDocument = (rawHtml: string) => {
  const html = safeHtml(rawHtml).trim() || '<p>Start writing to preview your post.</p>';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Spectral", "Source Serif 4", Georgia, Cambria, "Times New Roman", Times, serif;
        color: #1f2937;
        background: #ffffff;
        line-height: 1.72;
        font-size: clamp(1rem, 0.94rem + 0.24vw, 1.08rem);
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      main {
        width: min(100%, 900px);
        margin: 0 auto;
        padding: clamp(1rem, 2.5vw, 2rem);
      }

      h1, h2, h3, h4, h5, h6 {
        line-height: 1.2;
        margin: 1.6rem 0 0.9rem;
        color: #0f172a;
        font-family: "Sora", "Avenir Next", "Segoe UI", sans-serif;
      }

      h1 {
        font-size: clamp(1.8rem, 1.6rem + 1.4vw, 2.8rem);
      }

      h2 {
        font-size: clamp(1.4rem, 1.3rem + 0.8vw, 2rem);
      }

      p, ul, ol, blockquote, pre, table {
        margin: 0.95rem 0;
      }

      ul, ol {
        padding-left: 1.3rem;
      }

      blockquote {
        border-left: 4px solid #0284c7;
        background: #f0f9ff;
        padding: 0.8rem 1rem;
        border-radius: 0.5rem;
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: 0.8rem;
        display: block;
      }

      a {
        color: #0369a1;
      }

      pre, code {
        font-family: "JetBrains Mono", "Cascadia Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }

      pre {
        background: #0f172a;
        color: #e2e8f0;
        padding: 0.9rem 1rem;
        border-radius: 0.75rem;
        overflow: auto;
      }

      figure {
        margin: 1.3rem auto;
        display: block;
      }

      figure[data-layout="compact"] { width: min(100%, 380px); }
      figure[data-layout="regular"] { width: min(100%, 620px); }
      figure[data-layout="wide"] { width: min(100%, 820px); }
      figure[data-layout="full"] { width: 100%; }

      figcaption {
        margin-top: 0.45rem;
        color: #475569;
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        body {
          font-size: 1rem;
        }

        main {
          padding: 1rem;
        }
      }
    </style>
  </head>
  <body>
    <main>
      ${html}
    </main>
  </body>
</html>`;
};

export default function BlogContentFrame({ html, className }: BlogContentFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(380);

  const srcDoc = useMemo(() => buildDocument(html), [html]);

  useEffect(() => {
    const syncHeight = () => {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument?.body) {
        return;
      }

      const bodyHeight = iframe.contentDocument.body.scrollHeight;
      setHeight(Math.max(320, bodyHeight + 8));
    };

    syncHeight();
    const timer = window.setInterval(syncHeight, 300);

    return () => {
      window.clearInterval(timer);
    };
  }, [srcDoc]);

  return (
    <iframe
      ref={iframeRef}
      title="Blog content"
      sandbox="allow-same-origin"
      className={className ?? 'w-full rounded-xl border border-border bg-white'}
      height={height}
      srcDoc={srcDoc}
    />
  );
}
