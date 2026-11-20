/* eslint-disable no-undef */
/**
 * Generates the production manifest (manifest.xml, GitHub Pages URLs) from manifest.dev.xml.
 * Dev and prod use different add-in IDs and display names so both can be installed side by side.
 */
const fs = require("fs");
const path = require("path");
const { PROD_URL, DEV_URL, DEV_ID, PROD_ID } = require("./site-config");

const root = path.resolve(__dirname, "..");
const dev = fs.readFileSync(path.join(root, "manifest.dev.xml"), "utf8");

function toProd(xml) {
  let out = xml;
  out = out.replace(/<!--[\s\S]*?-->\s*/, "<!-- GENERATED from manifest.dev.xml by scripts/gen-manifest.js - do not edit. -->\n");
  out = out.split(DEV_URL).join(PROD_URL);
  out = out.split(DEV_URL.replace(/\/$/, "")).join(PROD_URL.replace(/\/[^/]+\/$/, ""));
  out = out.replace(DEV_ID, PROD_ID);
  out = out.replace('DefaultValue="Folienbibliothek (Dev)"', 'DefaultValue="Folienbibliothek"');
  return out;
}

const prod = toProd(dev);
if (prod.includes("localhost")) {
  throw new Error("Prod manifest still contains localhost URLs.");
}
fs.writeFileSync(path.join(root, "manifest.xml"), prod, "utf8");
if (require.main === module) {
  console.log("manifest.xml generated for " + PROD_URL);
}
module.exports = { toProd };
