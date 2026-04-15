import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const NAVY = "#1B2A4A";
const GOLD = "#D4A853";
const TEXT = "#2D2D2D";
const TEXT_LIGHT = "#5A5A5A";
const SAND = "#FEFCF6";
const SAND_DARK = "#F5EFE0";

function generatePDF(menuPath, restaurantPath, outputPath, lang) {
  const menuData = JSON.parse(fs.readFileSync(menuPath, "utf-8"));
  const restaurant = JSON.parse(fs.readFileSync(restaurantPath, "utf-8"));

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 60, bottom: 60, left: 50, right: 50 },
    info: {
      Title: lang === "en" ? `Menu - ${restaurant.name}` : `Menu - ${restaurant.name}`,
      Author: restaurant.name,
    },
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const pageW = doc.page.width;
  const contentW = pageW - 100;

  const labels = lang === "en"
    ? {
        subtitle: "Flavours of the sea from the heart of Calabria",
        allergenNote: "Allergens listed per EU Reg. 1169/2011. Please ask our staff for details.",
        dailyNote: "The menu varies based on the daily catch. Prices include VAT.",
        coverCharge: restaurant.practicalInfo.coverCharge,
        phone: "Phone",
        glutenFree: "GF = Gluten Free",
        vegetarian: "V = Vegetarian",
        raw: "R = Raw",
      }
    : {
        subtitle: "Sapori di mare dal cuore della Calabria",
        allergenNote: "Allergeni indicati secondo Reg. UE 1169/2011. Per info dettagliate, chiedere al personale.",
        dailyNote: "Il menu varia in base alla disponibilita del pescato del giorno. Prezzi IVA inclusa.",
        coverCharge: restaurant.practicalInfo.coverCharge,
        phone: "Tel",
        glutenFree: "SG = Senza Glutine",
        vegetarian: "V = Vegetariano",
        raw: "C = Crudo",
      };

  const dietaryAbbr = lang === "en"
    ? { "gluten-free": "GF", "vegetarian": "V", "raw": "R" }
    : { "senza-glutine": "SG", "vegetariano": "V", "crudo": "C" };

  // --- HEADER ---
  doc.rect(0, 0, pageW, 140).fill(NAVY);
  doc.fontSize(28).fill("#FFFFFF").font("Helvetica-Bold").text(restaurant.name, 50, 45, { width: contentW, align: "center" });
  doc.fontSize(11).fill(GOLD).font("Helvetica").text(labels.subtitle, 50, 82, { width: contentW, align: "center" });
  doc.fontSize(9).fill("#FFFFFF").font("Helvetica").text(
    `${restaurant.address.street}, ${restaurant.address.city} | ${labels.phone}: ${restaurant.phone}`,
    50, 105, { width: contentW, align: "center" }
  );

  let y = 160;

  function checkPage(needed = 80) {
    if (y + needed > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }
  }

  // --- CATEGORIES ---
  for (const cat of menuData.categories) {
    checkPage(100);

    // Category header
    doc.rect(50, y, contentW, 32).fill(NAVY);
    doc.fontSize(14).fill("#FFFFFF").font("Helvetica-Bold").text(cat.name.toUpperCase(), 62, y + 9, { width: contentW - 24 });
    y += 45;

    // Items
    for (let i = 0; i < cat.items.length; i++) {
      const item = cat.items[i];
      checkPage(55);

      // Alternating row background
      if (i % 2 === 1) {
        doc.rect(50, y - 4, contentW, 42).fill(SAND_DARK);
      }

      // Name + price line
      const dietary = (item.tags || [])
        .filter(t => t in dietaryAbbr)
        .map(t => dietaryAbbr[t])
        .join(" ");

      const nameText = dietary ? `${item.name}  ${dietary}` : item.name;

      doc.fontSize(11).fill(NAVY).font("Helvetica-Bold").text(nameText, 62, y, { width: contentW - 90, continued: false });

      const priceText = `\u20AC${item.price.toFixed(2)}`;
      doc.fontSize(11).fill(GOLD).font("Helvetica-Bold").text(priceText, pageW - 50 - 60, y, { width: 60, align: "right" });

      // Description
      doc.fontSize(9).fill(TEXT_LIGHT).font("Helvetica").text(item.description, 62, y + 15, { width: contentW - 90 });

      // Allergens
      if (item.allergens && item.allergens.length > 0) {
        const allergenText = item.allergens.map(a => menuData.allergenLabels[a] || a).join(", ");
        doc.fontSize(7.5).fill(TEXT_LIGHT).font("Helvetica-Oblique").text(allergenText, 62, y + 28, { width: contentW - 90 });
        y += 42;
      } else {
        y += 36;
      }
    }

    y += 12;
  }

  // --- FOOTER ---
  checkPage(80);
  y += 10;
  doc.rect(50, y, contentW, 0.5).fill(GOLD);
  y += 12;

  doc.fontSize(8).fill(TEXT_LIGHT).font("Helvetica");
  doc.text(`${labels.glutenFree}  |  ${labels.vegetarian}  |  ${labels.raw}`, 50, y, { width: contentW, align: "center" });
  y += 14;
  doc.text(labels.allergenNote, 50, y, { width: contentW, align: "center" });
  y += 14;
  doc.text(labels.dailyNote, 50, y, { width: contentW, align: "center" });
  y += 14;
  doc.text(labels.coverCharge, 50, y, { width: contentW, align: "center" });

  doc.end();

  return new Promise((resolve) => stream.on("finish", resolve));
}

// Generate both PDFs
await Promise.all([
  generatePDF(
    path.join(root, "src/data/menu.json"),
    path.join(root, "src/data/restaurant.json"),
    path.join(root, "public/menu.pdf"),
    "it"
  ),
  generatePDF(
    path.join(root, "src/data/en/menu.json"),
    path.join(root, "src/data/en/restaurant.json"),
    path.join(root, "public/menu-en.pdf"),
    "en"
  ),
]);

console.log("Generated: public/menu.pdf (IT) + public/menu-en.pdf (EN)");
