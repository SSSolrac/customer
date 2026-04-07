function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const assetModules = import.meta.glob("../assets/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}", {
  eager: true,
  import: "default",
});

const assetEntries = Object.entries(assetModules)
  .map(([path, url]) => {
    const filename = String(path).split("/").pop() || "";
    const base = filename.replace(/\.[^.]+$/, "");
    const key = normalizeKey(base);
    return key ? { key, url } : null;
  })
  .filter(Boolean);

const urlByKey = new Map(assetEntries.map((entry) => [entry.key, entry.url]));

function bestContainsMatch(nameKey) {
  if (!nameKey) return null;

  let best = null;
  for (const entry of assetEntries) {
    if (!entry.key.includes(nameKey)) continue;
    if (!best || entry.key.length < best.key.length) best = entry;
  }
  return best?.url || null;
}

export function resolveMenuItemImage(itemName, categoryName = "") {
  const nameKey = normalizeKey(itemName);
  if (!nameKey) return null;

  const categoryKey = normalizeKey(categoryName);
  const variant = categoryKey.includes("iced") ? "iced" : categoryKey.includes("hot") ? "hot" : "";

  const candidates = [];
  if (variant) candidates.push(normalizeKey(`${itemName} ${variant}`));
  candidates.push(nameKey);

  for (const candidate of candidates) {
    const url = urlByKey.get(candidate);
    if (url) return url;
  }

  return bestContainsMatch(nameKey);
}
