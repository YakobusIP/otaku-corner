export type SitemapUrlsetEntry = {
  loc: string;
  lastModified: Date | string;
  changeFrequency: string;
  priority: number;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatLastMod = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : value;

export const buildUrlsetXml = (entries: SitemapUrlsetEntry[]) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  for (const entry of entries) {
    xml += "<url>";
    xml += `<loc>${escapeXml(entry.loc)}</loc>`;
    xml += `<lastmod>${escapeXml(formatLastMod(entry.lastModified))}</lastmod>`;
    xml += `<changefreq>${entry.changeFrequency}</changefreq>`;
    xml += `<priority>${entry.priority}</priority>`;
    xml += "</url>";
  }
  xml += "</urlset>";
  return xml;
};

export const buildSitemapIndexXml = (locs: string[]) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  for (const loc of locs) {
    xml += "<sitemap>";
    xml += `<loc>${escapeXml(loc)}</loc>`;
    xml += "</sitemap>";
  }
  xml += "</sitemapindex>";
  return xml;
};
