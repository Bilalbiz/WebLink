const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const productsPath = path.join(rootDir, 'data', 'products.json');
const backlogPath = path.join(rootDir, 'data', 'backlog.json');

const MAX_PROMOTE = 3;

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

const productsData = readJson(productsPath);
const backlogData = readJson(backlogPath);

if (!Array.isArray(productsData.products)) {
  throw new Error('products.json must include a products array.');
}

if (!Array.isArray(backlogData.products)) {
  throw new Error('backlog.json must include a products array.');
}

const toPromote = backlogData.products.splice(0, MAX_PROMOTE);

if (toPromote.length === 0) {
  console.log('No products to promote.');
  process.exit(0);
}

let nextId = Number(productsData.nextId);
if (!Number.isFinite(nextId) || nextId < 1) {
  nextId = productsData.products.length + 1;
}

const promoted = toPromote.map((item) => {
  const id = `product-${nextId++}`;
  return {
    id,
    category: item.category,
    title: item.title,
    description: item.description,
    image: item.image,
    url: item.url
  };
});

productsData.nextId = nextId;
productsData.products.push(...promoted);

writeJson(productsPath, productsData);
writeJson(backlogPath, backlogData);

console.log(`Promoted ${promoted.length} products.`);
