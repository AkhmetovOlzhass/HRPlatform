// import puppeteer, { Browser, Page } from "puppeteer";
// import * as dotenv from "dotenv";
// import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// interface Candidate {
//   name: string;
//   position: string;
//   link?: string;
// }

// function bufferToGenerativePart(buffer: Buffer, mimeType: string): Part {
//   return {
//     inlineData: {
//       data: buffer.toString("base64"),
//       mimeType,
//     },
//   };
// }

// export async function analyzeCandidates(
//   candidates: Candidate[],
//   vacancy: string
// ): Promise<string> {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   const prompt = `
//     Вот описание вакансии:
//     ${vacancy}

//     Вот список кандидатов:
//     ${candidates
//       .map((c, i) => `${i + 1}. ${c.name} — ${c.position}`)
//       .join("\n")}

//     Выбери 3 лучших, кто точно подходит под вакансию. Объясни почему.
//   `;

//   const result = await model.generateContent(prompt);
//   return result.response.text();
// }

// import fs from "fs/promises";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";

// // ...

// async function solveCaptchaAndDelete(imageBuffer: Buffer): Promise<string> {
//   const tempPath = path.join(__dirname, `captcha-${uuidv4()}.png`);

//   // 1. Сохраняем во временный файл
//   await fs.writeFile(tempPath, imageBuffer);

//   // 2. Создаем модель и читаем base64 из файла
//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//   const fileBuffer = await fs.readFile(tempPath);
//   const base64 = fileBuffer.toString("base64");

//   // 3. Отправляем в Gemini
//   const result = await model.generateContent([
//     {
//       inlineData: {
//         data: base64,
//         mimeType: "image/png",
//       },
//     },
//     {
//       text: "На изображении капча. Напиши только текст, который нужно ввести. Без лишних слов.",
//     },
//   ]);

//   // 4. Удаляем временный файл
//   await fs.unlink(tempPath);

//   return result.response.text().trim();
// }


// export async function runVacancyProcess(
//   vacancyTitle: string,
//   keywords: string,
//   description: string
// ): Promise<void> {
//   const browser: Browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     args: ["--start-maximized"],
//   });

//   const page: Page = await browser.newPage();

//   await page.goto(
//     "https://hh.kz/account/login?backurl=%2F&authMethod=by_password&role=employer"
//   );

//   await page.type(
//     'input[data-qa="login-input-username"]',
//     process.env.HH_EMAIL || ""
//   );
//   await page.waitForSelector('input[data-qa="login-input-password"]', {
//     timeout: 100000,
//   });
//   await page.type(
//     'input[data-qa="login-input-password"]',
//     process.env.HH_PASSWORD || ""
//   );

//   await page.click('button[data-qa="account-login-submit"]');

//   await page.waitForSelector('img[data-qa="account-captcha-picture"]');
//   const captchaImage = await page.$('img[data-qa="account-captcha-picture"]');

//   if (!captchaImage) {
//     throw new Error("Картинка капчи не найдена");
//   }

//   await captchaImage.evaluate((el) => el.scrollIntoView());
//   await page.waitForFunction(
//     (el) => {
//       const rect = el.getBoundingClientRect();
//       return rect.width > 0 && rect.height > 0;
//     },
//     {},
//     captchaImage
//   );
//   await new Promise(resolve => setTimeout(resolve, 3000)); 
//   const captchaBuffer = await captchaImage.screenshot({ type: "png" });
//   const captchaText = await solveCaptchaAndDelete(Buffer.from(captchaBuffer));  

//   console.log("CAPTCHA TEXT:", captchaText);
//   await page.type('input[data-qa="account-captcha-input"]', captchaText);

//   await page.click('button[data-qa="account-login-submit"]');

//   await page.waitForNavigation();
//   await page.goto(
//     `https://hh.kz/search/resume?text=${encodeURIComponent(
//       keywords
//     )}&from=suggest_post&area=40&isDefaultArea=true&currency_code=KZT&ored_clusters=true&order_by=relevance&search_period=0&logic=normal&pos=full_text&exp_period=all_time&hhtmFrom=resume_search_catalog&hhtmFromLabel=resume_search_line`
//   );

//   await new Promise(resolve => setTimeout(resolve, 100000)); 
//   await page.waitForSelector('[data-qa="resume-serp__resume"]');

//   const candidates: Candidate[] = await page.evaluate(() => {
//     const items = Array.from(
//       document.querySelectorAll('[data-qa="resume-serp__resume"]')
//     );
//     return items.slice(0, 5).map((el) => ({
//       name:
//         el.querySelector('[data-qa="resume-serp__resume-name"]')
//           ?.textContent?.trim() || "—",
//       position:
//         el.querySelector('[data-qa="resume-serp__resume-profession"]')
//           ?.textContent?.trim() || "—",
//       link:
//         (
//           el.querySelector(
//             '[data-qa="resume-serp__resume-title"] a'
//           ) as HTMLAnchorElement
//         )?.href || "",
//     }));
//   });

//   const result = await analyzeCandidates(candidates, description);
//   console.log(`🎯 AI Analysis for "${vacancyTitle}":\n\n${result}`);

//   await browser.close();
// }
