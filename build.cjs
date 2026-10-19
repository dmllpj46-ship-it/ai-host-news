/**
 * build.cjs — AI News Hot build script
 * Reads news-md/*.md files, parses YAML frontmatter, generates news-data.json
 */
const fs = require('fs');
const path = require('path');

const NEWS_DIR = path.join(__dirname, 'news-md');
const OUT_FILE = path.join(__dirname, 'dist', 'news-data.json');

function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) return { data: {}, body: content };
  const fmText = fmMatch[1];
  const body = content.slice(fmMatch[0].length);
  const data = {};
  for (const line of fmText.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (key === 'tags') {
      data[key] = val.replace(/[\[\]"]/g, '').split(',').map(t => t.trim()).filter(Boolean);
    } else {
      data[key] = val;
    }
  }
  return { data, body };
}

function main() {
  if (!fs.existsSync(NEWS_DIR)) {
    console.log(`news-md/ directory not found at ${NEWS_DIR}, skipping build.`);
    return;
  }

  const files = fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'));
  const news = [];

  for (const file of files) {
    const filePath = path.join(NEWS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, body } = parseFrontmatter(content);

    news.push({
      id: file.replace(/\.md$/, ''),
      title: data.title || '',
      date: data.date || new Date().toISOString().split('T')[0],
      tags: data.tags || [],
      summary: data.summary || '',
      content: body.trim(),
    });
  }

  // Sort by date descending (newest first)
  news.sort((a, b) => new Date(b.date) - new Date(a.date));

  const output = {
    news,
    updated: new Date().toISOString(),
    count: news.length,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Build complete: ${news.length} news items written to ${OUT_FILE}`);

  // Copy index.html into dist so Pages serves it at the root
  const srcHtml = path.join(__dirname, 'index.html');
  const outHtml = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(srcHtml)) {
    fs.copyFileSync(srcHtml, outHtml);
    console.log(`Copied index.html -> ${outHtml}`);
  } else {
    console.warn('WARN: index.html not found at project root, skipped copy.');
  }
}

main();