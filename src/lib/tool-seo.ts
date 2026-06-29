// Per-tool SEO content: visible "How to use" steps, "Why Bluebird" angles,
// and FAQ pairs that are ALSO emitted as FAQPage JSON-LD.
// FAQ visible text must match JSON-LD verbatim — keep them in sync here.

export type ToolSEO = {
  slug: string;
  primaryKeyword: string;
  category: string;
  howTo: string[];
  faqs: { q: string; a: string }[];
  longTail?: string[];
  useCases?: string[];
};



const PRIVACY = "Files never leave your device — every step runs in your browser, so we never see your image or its contents.";

export const TOOL_SEO: Record<string, ToolSEO> = {
  "image-compressor": {
    slug: "image-compressor",
    primaryKeyword: "compress images online free",
    category: "Image",
    howTo: [
      "Drop a JPG, PNG or WEBP photo into the upload box.",
      "Pick a goal — Email, Web, Chat — or set your own target size.",
      "Click Compress image and download the smaller file.",
    ],
    faqs: [
      { q: "Is it safe to compress images online?", a: "Yes — Bluebird compresses photos entirely inside your browser using a Web Worker. Nothing is uploaded to a server, so the file stays on your device the whole time." },
      { q: "How small can I make a JPG without losing quality?", a: "For most photos you can cut file size by 50–80% with no visible change. Pick the Web preset for a good balance, or a custom KB target for precise control." },
      { q: "Will compressing remove EXIF and GPS data?", a: "Leave the 'Also remove hidden info' option on and we strip camera, date and GPS metadata from JPG photos during compression." },
      { q: "What image formats does the compressor support?", a: "JPG, PNG and WEBP up to 20 MB. Transparent PNGs stay PNG; other formats are re-encoded for the best size." },
    ],
  },
  "image-resizer": {
    slug: "image-resizer",
    primaryKeyword: "resize image online",
    category: "Image",
    howTo: [
      "Upload the photo you want to resize.",
      "Type a new width or height, or pick a social-media preset.",
      "Click Resize and download your new image.",
    ],
    faqs: [
      { q: "Does resizing keep the aspect ratio?", a: "Yes by default — change the width and the height updates automatically. Turn off the lock if you need to stretch to an exact box." },
      { q: "Will resizing reduce image quality?", a: "Making an image smaller is loss-free in practice — you'll barely see a difference. Enlarging beyond the original size is limited by the source pixels." },
      { q: "What sizes are best for Instagram, YouTube and Twitter?", a: "Use the built-in presets — Instagram square 1080×1080, YouTube thumbnail 1280×720, Twitter header 1500×500, and more." },
      { q: "Can I resize lots of photos at once?", a: "This tool resizes one photo at a time. For bulk work, combine with the Watermark tool which accepts batches." },
    ],
  },
  "image-cropper": {
    slug: "image-cropper",
    primaryKeyword: "crop image online",
    category: "Image",
    howTo: [
      "Upload your image.",
      "Drag the handles, or pick a fixed ratio like 1:1 or 16:9.",
      "Click Crop and download the new image.",
    ],
    faqs: [
      { q: "Can I crop to a perfect square?", a: "Yes — choose the 1:1 ratio button and the crop box locks to a square you can drag anywhere on the image." },
      { q: "What file formats can I crop?", a: "JPG, PNG and WEBP up to 20 MB. The output keeps the original format, so transparent PNGs stay transparent." },
      { q: "Is my photo uploaded anywhere?", a: PRIVACY },
    ],
  },
  "rotate-flip": {
    slug: "rotate-flip",
    primaryKeyword: "rotate image online",
    category: "Image",
    howTo: [
      "Upload a photo.",
      "Tap 90° left/right, flip horizontally or vertically, or fine-tune with the angle slider.",
      "Download the corrected image.",
    ],
    faqs: [
      { q: "Can I rotate a photo by an exact angle?", a: "Yes — use the angle slider for any value from −180° to 180°, or the quick buttons for 90° steps." },
      { q: "Does rotating reduce quality?", a: "Quarter-turn rotations (90°, 180°, 270°) are loss-free. Other angles are re-encoded once, with a small quality cost." },
    ],
  },
  "image-format-converter": {
    slug: "image-format-converter",
    primaryKeyword: "convert png to webp jpg to png",
    category: "Image",
    howTo: [
      "Upload an image in any common format.",
      "Choose the output — PNG, JPG, WEBP or BMP.",
      "Download the converted file.",
    ],
    faqs: [
      { q: "Should I convert PNG to WEBP?", a: "WEBP is usually 25–35% smaller than PNG at the same quality and is supported by every modern browser. Great for websites; keep PNG if you need wider compatibility." },
      { q: "Will converting to JPG lose transparency?", a: "JPG does not support transparency, so transparent areas become white. Convert to WEBP or PNG to keep transparency." },
      { q: "What's the difference between JPG and JPEG?", a: "None — they're the same format. The .jpg extension is just shorter than .jpeg." },
    ],
  },
  "watermark": {
    slug: "watermark",
    primaryKeyword: "add watermark to image",
    category: "Image",
    howTo: [
      "Upload one or many photos.",
      "Type your watermark text or pick a logo, and choose position, size and opacity.",
      "Click Apply and download the watermarked images.",
    ],
    faqs: [
      { q: "Can I watermark many photos at once?", a: "Yes — drop a batch and Bluebird applies the same watermark to every image, then lets you download them all together." },
      { q: "Can I use my own logo as a watermark?", a: "Yes — upload a PNG with transparency, choose corner or tiled placement, and adjust opacity to taste." },
    ],
  },
  "color-picker": {
    slug: "color-picker",
    primaryKeyword: "extract colors from image",
    category: "Image",
    howTo: [
      "Upload a photo or design.",
      "Tap any pixel to read its color — or auto-extract a palette.",
      "Copy HEX, RGB or HSL values for your work.",
    ],
    faqs: [
      { q: "How do I get the dominant colors of an image?", a: "Click Extract palette and Bluebird returns the most common colors in the photo, ready to copy as HEX." },
      { q: "Can I zoom in to pick an exact pixel?", a: "Yes — hold the eyedropper to see a zoom loupe and pick a single pixel accurately." },
    ],
  },
  "exif-viewer": {
    slug: "exif-viewer",
    primaryKeyword: "remove exif data from photo",
    category: "Image",
    howTo: [
      "Upload a JPG photo.",
      "Review the hidden info — camera model, date, GPS location.",
      "Click Clean privacy data to save a stripped copy.",
    ],
    faqs: [
      { q: "What is EXIF data and why should I remove it?", a: "EXIF is hidden info stored inside JPG photos — camera model, date, and often the exact GPS coordinates where the photo was taken. Removing it before sharing protects your privacy." },
      { q: "Does Bluebird really delete the GPS location?", a: "Yes — the cleaned copy you download has no EXIF block at all, so no camera, no date, no GPS." },
      { q: "Why does my photo from a phone include my home address?", a: "Most phones tag photos with GPS by default. Run them through this tool — or turn off location tagging in your camera settings — before posting online." },
    ],
  },
  "favicon-generator": {
    slug: "favicon-generator",
    primaryKeyword: "favicon generator",
    category: "Image",
    howTo: [
      "Upload a square image — your logo works great.",
      "Bluebird builds 16×16, 32×32, 180×180 and a multi-size .ico.",
      "Download the zipped pack and drop the files into your site.",
    ],
    faqs: [
      { q: "What sizes does a website favicon need in 2026?", a: "A safe set is 16×16, 32×32, 48×48, 180×180 (Apple touch icon) and a multi-size favicon.ico. Bluebird creates all of them from one upload." },
      { q: "What's the best source image for a favicon?", a: "A square PNG with a transparent background at 512×512 or larger gives the sharpest result at every size." },
    ],
  },
  "images-to-pdf": {
    slug: "images-to-pdf",
    primaryKeyword: "convert images to pdf",
    category: "Documents",
    howTo: [
      "Drop in one or many photos — JPG, PNG or WEBP.",
      "Drag to reorder, pick page size (A4, Letter) and orientation.",
      "Click Build PDF and download the file.",
    ],
    faqs: [
      { q: "Can I make one PDF from many photos?", a: "Yes — upload as many photos as you like, drag to reorder, and download a single PDF with one image per page." },
      { q: "What page sizes does the PDF builder support?", a: "A4, US Letter and Fit-to-image. Each can be portrait or landscape." },
      { q: "Is my data uploaded anywhere?", a: PRIVACY },
    ],
  },
  "pdf-to-images": {
    slug: "pdf-to-images",
    primaryKeyword: "pdf to jpg converter",
    category: "Documents",
    howTo: [
      "Upload a PDF.",
      "Pick the pages you want and the output format (PNG, JPG, WEBP).",
      "Choose DPI for sharpness, then download a zip of the images.",
    ],
    faqs: [
      { q: "How do I turn each page of a PDF into a JPG?", a: "Drop the PDF in, pick JPG and 150 DPI, and Bluebird returns one image per page in a single zip." },
      { q: "What DPI should I use for printing?", a: "300 DPI is the printing standard. For screens, 96–150 DPI is plenty and produces much smaller files." },
      { q: "Can I extract only certain pages?", a: "Yes — type a range like 1-3,7 or use the All / Odd / Even chips." },
    ],
  },
  "qr-generator": {
    slug: "qr-generator",
    primaryKeyword: "qr code generator",
    category: "Generators",
    howTo: [
      "Pick a type — Link, Wi-Fi, vCard or plain text.",
      "Fill in the details and pick your colors.",
      "Download as PNG, SVG or JPG, or copy to clipboard.",
    ],
    faqs: [
      { q: "Are these QR codes free for commercial use?", a: "Yes — Bluebird generates standard QR codes you own outright. No watermark, no expiry, no account needed." },
      { q: "Can I make a QR code for my Wi-Fi network?", a: "Yes — choose Wi-Fi, type the SSID and password, and anyone who scans the code joins your network automatically." },
      { q: "Will the QR code work if I change colors?", a: "Yes, as long as there's strong contrast between foreground and background. The built-in contrast guard warns you if the code might not scan." },
    ],
  },
  "password-generator": {
    slug: "password-generator",
    primaryKeyword: "strong password generator",
    category: "Generators",
    howTo: [
      "Choose length and which character types to include — or switch to passphrase mode.",
      "Watch the live strength meter as you tweak settings.",
      "Click Copy or pick a password from the history.",
    ],
    faqs: [
      { q: "How does Bluebird generate secure passwords?", a: "We use the browser's built-in crypto.getRandomValues — the same secure random source modern browsers use for cryptography. Nothing is sent anywhere." },
      { q: "How long should my password be?", a: "16 characters with mixed letters, numbers and symbols is strong for most accounts. For very sensitive logins, use 20+ or a passphrase of 5+ words." },
      { q: "Are passphrases really safer than random passwords?", a: "A 5-word passphrase like 'orange-pilot-river-clay-sound' has more entropy than most 12-character random strings — and is far easier to remember." },
    ],
  },
  "json-formatter": {
    slug: "json-formatter",
    primaryKeyword: "json formatter validator",
    category: "Developer",
    howTo: [
      "Paste JSON, drop a file, or click Sample.",
      "Choose indentation (2 spaces, 4 spaces or Tab), sort keys, or minify.",
      "Copy or download the result, or export to YAML.",
    ],
    faqs: [
      { q: "Why is my JSON invalid?", a: "Bluebird points to the exact line and column of the error — usually a stray comma, single quotes instead of double, or a missing closing brace." },
      { q: "What's the difference between pretty-print and minify?", a: "Pretty-print adds indentation so JSON is easy to read. Minify strips all whitespace, producing the smallest possible payload — useful for sending over the network." },
      { q: "Can I convert JSON to YAML?", a: "Yes — click Export as YAML to download a clean .yaml version of any valid JSON." },
    ],
  },
  "base64": {
    slug: "base64",
    primaryKeyword: "base64 encoder decoder",
    category: "Developer",
    howTo: [
      "Paste text or drop a file into the input.",
      "Pick Encode or Decode — turn on URL-safe if you need it for query strings.",
      "Copy the result or download it.",
    ],
    faqs: [
      { q: "What is Base64 encoding used for?", a: "Base64 turns binary data into plain ASCII text so it can travel safely through systems that only handle text — like email headers, JSON payloads or data URLs." },
      { q: "What's URL-safe Base64?", a: "Standard Base64 uses + and / which break inside URLs. URL-safe Base64 swaps them for - and _, so the string is safe to drop into query strings." },
      { q: "Can I turn a file into a data URL?", a: "Yes — use the file-to-data-URL helper. The result is a single string that embeds the file content directly in HTML or CSS." },
    ],
  },
  "text-case-converter": {
    slug: "text-case-converter",
    primaryKeyword: "text case converter",
    category: "Developer",
    howTo: [
      "Paste your text.",
      "Pick a case — UPPER, lower, Title, camel, snake, kebab and more.",
      "Copy the result, or download it as a .txt file.",
    ],
    faqs: [
      { q: "What is camelCase vs snake_case vs kebab-case?", a: "camelCase joins words with capital letters (myVariableName), snake_case uses underscores (my_variable_name), kebab-case uses hyphens (my-variable-name). Different languages and frameworks prefer different styles." },
      { q: "Can I convert a long document?", a: "Yes — paste any length of text. Bluebird also shows live word, character and line counts." },
    ],
  },
  "jwt-decoder": {
    slug: "jwt-decoder",
    primaryKeyword: "jwt decoder online",
    category: "Developer",
    howTo: [
      "Paste your JWT into the box on the left.",
      "Bluebird splits it into header, payload and signature instantly.",
      "Copy any section, or check the expiry badge for token validity.",
    ],
    faqs: [
      { q: "Is it safe to paste a real JWT here?", a: "Yes. Decoding happens entirely in your browser using the built-in atob and JSON.parse functions. The token never leaves your tab and is never sent to a server — unlike jwt.io, which is hosted by an identity provider." },
      { q: "Can I verify the signature?", a: "Bluebird decodes the token so you can inspect its contents. Verifying a signature requires the original secret or public key, which is best done in your own backend rather than any web tool." },
      { q: "What is a JWT?", a: "A JSON Web Token is a compact, URL-safe way to carry claims between two parties. It has three Base64-url encoded parts — header, payload and signature — separated by dots." },
    ],
  },
  "regex-tester": {
    slug: "regex-tester",
    primaryKeyword: "regex tester online",
    category: "Developer",
    howTo: [
      "Type or paste your regular expression.",
      "Toggle flags like g, i, m, s, u, y to match your needs.",
      "Edit the test text and watch matches highlight in real time, with every capture group listed.",
    ],
    faqs: [
      { q: "Which regex flavor does this use?", a: "Bluebird uses the browser's native JavaScript RegExp engine, which is the same engine used by Node.js, React Native and every modern web app." },
      { q: "Will my pattern or test text leave my browser?", a: "Never. Everything runs locally — no requests are made to any server." },
      { q: "Can I see capture groups?", a: "Yes. Each match shows its position and every numbered capture group ($1, $2, …) underneath." },
    ],
  },
  "diff-checker": {
    slug: "diff-checker",
    primaryKeyword: "diff checker online",
    category: "Developer",
    howTo: [
      "Paste the original text on the left and the changed version on the right.",
      "Switch between line and word mode for the level of detail you need.",
      "Read added lines in green and removed lines in red — copy or screenshot the result.",
    ],
    faqs: [
      { q: "How is this different from diffchecker.com?", a: "Diffchecker.com sends both texts to its servers and requires a paid plan for offline use. Bluebird runs the comparison entirely in your browser — nothing is uploaded, ever." },
      { q: "Does it work for code?", a: "Yes. The comparison is character-aware, so it handles code, JSON, configuration files and prose equally well." },
      { q: "What's the difference between line and word mode?", a: "Line mode highlights whole lines that differ — best for code review. Word mode highlights only the changed words — best for editing prose." },
    ],
  },
  "heic-to-jpg": {
    slug: "heic-to-jpg",
    primaryKeyword: "heic to jpg converter",
    category: "Image",
    howTo: [
      "Drop in one or many .heic photos straight from your iPhone.",
      "Pick JPG (smaller) or PNG (lossless), and a quality if you want.",
      "Click Convert and download each photo — or all of them as a ZIP.",
    ],
    faqs: [
      { q: "Why won't my iPhone photos open on Windows?", a: "iPhones save photos in Apple's HEIC format, which Windows and many apps don't open natively. Converting to JPG or PNG makes them readable everywhere." },
      { q: "Are my photos uploaded anywhere?", a: PRIVACY },
      { q: "Can I convert lots of HEIC files at once?", a: "Yes — drop in a whole album. Bluebird converts every file one after another and offers a single ZIP download when done." },
      { q: "Does converting reduce photo quality?", a: "PNG is lossless — no quality is lost. JPG re-encodes the photo; the default 90% quality keeps it visually identical at roughly half the size." },
    ],
  },
  "pdf-merge": {
    slug: "pdf-merge",
    primaryKeyword: "merge pdf online free",
    category: "Documents",
    howTo: [
      "Drop in two or more PDFs.",
      "Drag with the up/down arrows to set the order pages will appear.",
      "Click Merge &amp; download to get the combined PDF.",
    ],
    faqs: [
      { q: "Is there a page or file-size limit?", a: "Each PDF can be up to 100 MB, and there's no limit on how many you combine — the merge happens in your browser, so it's only bounded by your device's memory." },
      { q: "Will Bluebird add a watermark?", a: "Never. Tools like iLovePDF and Smallpdf often add a watermark or cap free use; Bluebird is free, watermark-free, and 100% client-side." },
      { q: "Does merging change the page quality?", a: "No — pages are copied byte-for-byte from the originals, so text stays selectable and images keep their original resolution." },
    ],
  },
  "pdf-split": {
    slug: "pdf-split",
    primaryKeyword: "split pdf online free",
    category: "Documents",
    howTo: [
      "Upload the PDF you want to split.",
      "Choose Every page to get one PDF per page, or Page range to pull a custom set.",
      "Click Split — Bluebird returns a ZIP or a single extracted PDF.",
    ],
    faqs: [
      { q: "How do I write a page range?", a: "Use commas and dashes — for example 1-3,7,10-12 grabs pages 1, 2, 3, 7, 10, 11 and 12 into a single new PDF." },
      { q: "Will it work on a password-protected PDF?", a: "Bluebird tries to read encrypted PDFs but cannot bypass an owner password. If the file requires a password to open, remove it first." },
      { q: "Is my PDF uploaded?", a: PRIVACY },
    ],
  },
  "word-counter": {
    slug: "word-counter",
    primaryKeyword: "word counter online",
    category: "Developer",
    howTo: [
      "Type or paste your text into the box.",
      "Watch words, characters, sentences, paragraphs and reading time update live.",
      "Copy the stats or keep writing — nothing leaves your device.",
    ],
    faqs: [
      { q: "How is reading time calculated?", a: "Bluebird uses 225 words per minute for reading and 130 for speaking — the averages used by Medium, Forbes and most writing tools." },
      { q: "Is my text uploaded anywhere?", a: "No — every count runs in your browser. Your draft stays on your device." },
      { q: "Does it count words inside hyphens or contractions?", a: "Yes — hyphenated words (well-known) and contractions (don't) each count as one word, matching Microsoft Word." },
    ],
  },
  "hash-generator": {
    slug: "hash-generator",
    primaryKeyword: "sha256 hash generator online",
    category: "Developer",
    howTo: [
      "Choose Text or File and add your input.",
      "Bluebird computes SHA-1, SHA-256, SHA-384 and SHA-512 in your browser.",
      "Paste an expected hash to verify a download — a green match means the file is intact.",
    ],
    faqs: [
      { q: "Which hash algorithms are supported?", a: "SHA-1, SHA-256, SHA-384 and SHA-512 — all delivered by the browser's Web Crypto API for production-grade speed and safety." },
      { q: "Why no MD5?", a: "MD5 is cryptographically broken and the Web Crypto standard doesn't expose it. For checksums prefer SHA-256." },
      { q: "Are my files uploaded?", a: PRIVACY },
      { q: "How big a file can I hash?", a: "Up to 100 MB. The whole file is read into memory in your browser, so very large files depend on your device." },
    ],
  },
  "uuid-generator": {
    slug: "uuid-generator",
    primaryKeyword: "uuid generator online",
    category: "Generators",
    howTo: [
      "Pick how many UUIDs you need (1 to 1,000).",
      "Toggle uppercase, hyphens or {braces} to match your target format.",
      "Copy them all, copy one row, or download as a .txt file.",
    ],
    faqs: [
      { q: "Are these UUIDs random and secure?", a: "Yes — Bluebird uses crypto.randomUUID() and crypto.getRandomValues, the browser's cryptographically secure random source, producing standard RFC 4122 / RFC 9562 UUIDs." },
      { q: "What's the difference between UUID v4 and v7?", a: "v4 is fully random — great when ordering doesn't matter. v7 prefixes a millisecond timestamp so the IDs sort naturally over time, which is ideal for database primary keys." },
      { q: "What's the difference between UUID and GUID?", a: "None in practice — GUID is Microsoft's name for the same UUID standard. Bluebird's output works for both." },
      { q: "Can I generate thousands at a time?", a: "Up to 1,000 per click to keep the page snappy. Click Generate again for more — there's no daily limit." },
    ],
  },
  "url-encoder": {
    slug: "url-encoder",
    primaryKeyword: "url encoder decoder online",
    category: "Developer",
    howTo: [
      "Paste your text or URL on the left.",
      "Pick Encode or Decode, and choose Component (safer) or Whole URL.",
      "Copy the result, or hit Swap to round-trip it back.",
    ],
    faqs: [
      { q: "What's the difference between encodeURI and encodeURIComponent?", a: "encodeURI keeps URL structure characters like :/?#&= intact, so it's safe for a whole address. encodeURIComponent escapes every reserved character — use it for query values and path segments." },
      { q: "Why does my decoded string show URIError?", a: "That means the input isn't valid percent-encoding — usually a stray % or a % not followed by two hex digits. Fix or remove it and try again." },
      { q: "Is my input sent anywhere?", a: "No — encoding and decoding both happen inside your browser. Nothing is uploaded, ever." },
    ],
  },
  "lorem-ipsum": {
    slug: "lorem-ipsum",
    primaryKeyword: "lorem ipsum generator",
    category: "Generators",
    howTo: [
      "Pick paragraphs, sentences or words and how many you need.",
      "Toggle the classic opener or HTML <p> output to match your needs.",
      "Copy the result or download as a .txt or .html file.",
    ],
    faqs: [
      { q: "What is Lorem Ipsum and why is it used?", a: "Lorem Ipsum is scrambled Latin-looking text designers and developers use as placeholder content so layout decisions aren't distracted by real copy." },
      { q: "Can I get the text wrapped in <p> tags?", a: "Yes — switch on 'Output as <p> HTML' (paragraph mode) and the output becomes ready-to-paste HTML." },
      { q: "Is the text identical every time?", a: "No — click Regenerate for a fresh randomized batch. The classic opener is optional via a toggle." },
    ],
  },
  "timestamp-converter": {
    slug: "timestamp-converter",
    primaryKeyword: "unix timestamp converter",
    category: "Developer",
    howTo: [
      "Paste a Unix timestamp on the left to see the date in your timezone, UTC and ISO format.",
      "Pick a date on the right to get the timestamp in seconds or milliseconds.",
      "Toggle Seconds / Milliseconds — switching converts the current value automatically.",
    ],
    faqs: [
      { q: "What is a Unix timestamp?", a: "It's the number of seconds (or milliseconds) since January 1, 1970 UTC — a standard way computers store points in time independent of timezones." },
      { q: "How do I tell seconds from milliseconds?", a: "Roughly: 10-digit numbers are seconds, 13-digit numbers are milliseconds. Bluebird converts the current value automatically when you flip the toggle." },
      { q: "Does the tool handle my timezone?", a: "Yes — the local-time row uses your device's timezone. Bluebird also shows UTC and ISO 8601 side-by-side." },
    ],
  },
  "markdown-preview": {
    slug: "markdown-preview",
    primaryKeyword: "markdown preview online",
    category: "Developer",
    howTo: [
      "Type or paste Markdown into the editor on the left.",
      "Watch the live preview render on the right — tables, task lists, code blocks and all.",
      "Copy the rendered HTML, or download a .md or .html file.",
    ],
    faqs: [
      { q: "What flavor of Markdown is supported?", a: "GitHub-flavored Markdown — tables, task lists, fenced code blocks, strike-through and autolinks all work." },
      { q: "Is my writing saved if I close the tab?", a: "Yes — your draft is auto-saved to this device's local storage, never uploaded. Clear the editor to wipe it." },
      { q: "Is the rendered HTML safe to paste into a website?", a: "Yes — the preview is sanitized with DOMPurify before display, so script tags and dangerous attributes are stripped out." },
    ],
  },
  "csv-json": {
    slug: "csv-json",
    primaryKeyword: "csv to json converter",
    category: "Developer",
    howTo: [
      "Pick CSV → JSON or JSON → CSV and paste the data, or open a file from your device.",
      "Choose the delimiter (Auto handles comma, semicolon, tab or pipe) and whether the first row is a header.",
      "Copy the result, hit Swap to round-trip it, or download as a .json or .csv file.",
    ],
    faqs: [
      { q: "Is my data uploaded anywhere?", a: "No — parsing happens entirely in your browser. Files never leave your device." },
      { q: "What delimiters are supported?", a: "Comma, semicolon, tab and pipe. Pick Auto and Bluebird detects the right one from your CSV." },
      { q: "What shape of JSON works for JSON → CSV?", a: "An array of objects (each row becomes one record) or an array of arrays (each inner array becomes one row)." },
    ],
  },
  "color-converter": {
    slug: "color-converter",
    primaryKeyword: "color converter hex rgb hsl",
    category: "Image",
    howTo: [
      "Type a color in any format — HEX, RGB, HSL, HSV or OKLCH — or use the color picker.",
      "See every other format calculated instantly with a live swatch.",
      "Tap Copy next to the format you need for CSS, design tools or a brand kit.",
    ],
    faqs: [
      { q: "Which color formats are supported?", a: "HEX (with optional alpha), RGB/RGBA, HSL/HSLA, HSV and OKLCH — both modern space-separated and classic comma syntax are accepted." },
      { q: "Does it handle transparency?", a: "Yes — pass an alpha value in HEX (#rrggbbaa), rgb(... / 50%) or hsl(... / 50%) and every output format will include it." },
      { q: "Why use OKLCH?", a: "OKLCH is a modern perceptually uniform color space — it makes lightness and chroma feel more even when you tweak values, perfect for design systems." },
    ],
  },
  "slug-generator": {
    slug: "slug-generator",
    primaryKeyword: "slug generator online",
    category: "Developer",
    howTo: [
      "Type or paste a title on the left.",
      "Pick a separator (-, _ or .) and toggle ASCII-only or a max length.",
      "Copy the slug — or paste multiple lines to batch-convert them.",
    ],
    faqs: [
      { q: "What is a URL slug?", a: "A slug is the human-readable part of a URL — usually a short, lowercase string with hyphens that describes the page, like 'how-to-bake-bread'." },
      { q: "Does it remove accents and emoji?", a: "Yes — accents (é, ñ, ü) are stripped to their base letters and any non-ASCII characters, including emoji, are removed when ASCII-only is on." },
      { q: "Can I make slugs for many titles at once?", a: "Paste one title per line and Bluebird converts each line into its own slug. Great for blog migrations or bulk imports." },
      { q: "Is my text uploaded anywhere?", a: "No — slugify runs entirely in your browser. Nothing is sent to a server." },
    ],
  },
  "number-base-converter": {
    slug: "number-base-converter",
    primaryKeyword: "binary to hex decimal octal converter",
    category: "Developer",
    howTo: [
      "Pick the base of the number you have (binary, octal, decimal or hex).",
      "Type the number — every other base updates instantly.",
      "Tap Copy next to the format you need.",
    ],
    faqs: [
      { q: "Does it work with very large numbers?", a: "Yes — Bluebird uses arbitrary-precision integers (BigInt), so 100-digit numbers convert without overflow or rounding." },
      { q: "Can I convert negative numbers?", a: "Yes — prefix the value with a minus sign. The same sign is kept in every output base." },
      { q: "Why is my input rejected?", a: "Each base only accepts its own digits — binary needs 0–1, octal 0–7, decimal 0–9, hex 0–9 and a–f. Anything else is flagged." },
    ],
  },
  "html-entities": {
    slug: "html-entities",
    primaryKeyword: "html entity encoder decoder",
    category: "Developer",
    howTo: [
      "Paste your text or HTML on the left.",
      "Pick Encode (Named, Numeric or All non-ASCII) or Decode.",
      "Copy the result — or tap Swap to round-trip it back.",
    ],
    faqs: [
      { q: "What's the difference between named and numeric entities?", a: "Named entities are short aliases like &amp;copy; or &amp;nbsp;. Numeric entities use the character's code point (&amp;#169; or &amp;#xA9;) and work in any context, including XML." },
      { q: "Will it decode &amp;#x2014; and &amp;mdash; the same way?", a: "Yes — Bluebird decodes named, decimal and hex entities together, so mixed input is no problem." },
      { q: "Is it safe to encode HTML before pasting into a webpage?", a: "Yes — encoding the five dangerous characters (& &lt; &gt; \" ') is the standard way to prevent your text from being parsed as HTML or scripts." },
    ],
  },
  "text-to-pdf": {
    slug: "text-to-pdf",
    primaryKeyword: "text to pdf converter online",
    category: "Documents",
    howTo: [
      "Type or paste your text into the editor.",
      "Pick a page size (A4, Letter or Legal), font size and margin.",
      "Click Make PDF and download the file.",
    ],
    faqs: [
      { q: "Is my text uploaded anywhere?", a: "No — the PDF is built inside your browser with the PDF-lib library. Nothing is sent to a server." },
      { q: "Does it support long documents?", a: "Yes — text is automatically wrapped and paginated. Up to roughly 1.5 million characters per document." },
      { q: "Can I print the result?", a: "Of course — the PDF is standard A4/Letter/Legal with selectable text, ready for any printer or e-reader." },
      { q: "Why is non-Latin text replaced with question marks?", a: "The built-in PDF font covers Latin characters. For other scripts, use a tool that lets you embed custom fonts." },
    ],
  },
  "pdf-page-numbers": {
    slug: "pdf-page-numbers",
    primaryKeyword: "add page numbers to pdf online",
    category: "Documents",
    howTo: [
      "Choose your PDF file (up to 50 MB).",
      "Pick where the numbers should sit and which format you want.",
      "Press Add page numbers and download the result.",
    ],
    faqs: [
      { q: "Will my PDF be uploaded?", a: "No — the file is opened and edited locally with PDF-lib. It never leaves your browser." },
      { q: "Can I start counting from a different number?", a: "Yes — set 'Start at' to any value. Useful for chapters or merging numbered sections." },
      { q: "Does it work with scanned PDFs and images inside the PDF?", a: "Yes — page numbers are drawn on top of every existing page, regardless of its content." },
      { q: "Will it add a watermark?", a: "Never. Bluebird is free and watermark-free, and it stays that way." },
    ],
  },
  "random-number": {
    slug: "random-number",
    primaryKeyword: "random number generator online",
    category: "Generators",
    howTo: [
      "Pick integer or decimal, then set the smallest and largest allowed value.",
      "Choose how many numbers you want — up to 10,000 at once.",
      "Press Generate. Copy or download the list.",
    ],
    faqs: [
      { q: "Are the numbers truly random?", a: "We use the browser's Web Crypto API (crypto.getRandomValues), the same cryptographically secure source used to generate passwords and keys." },
      { q: "Can I generate unique numbers without repeats?", a: "Yes — turn on 'Unique values only' for integers. You'll get a shuffled draw with no duplicates." },
      { q: "Can it generate decimals?", a: "Yes — switch to Decimal mode and pick how many decimal places you need (0 to 10)." },
      { q: "Is anything stored?", a: "No — numbers are generated and shown in your browser. Nothing is logged or uploaded." },
    ],
  },
  "color-palette": {
    slug: "color-palette",
    primaryKeyword: "color palette generator",
    category: "Generators",
    howTo: [
      "Pick a base color, or press Surprise me for a random starting point.",
      "Choose a harmony — analogous, complementary, triadic, tetradic, monochrome or shades.",
      "Lock the colors you love, reshuffle the rest, then copy HEX, RGB or CSS variables.",
    ],
    faqs: [
      { q: "Which harmony should I pick for a UI?", a: "Analogous and monochrome feel calm and unified — ideal for dashboards and content sites. Complementary adds contrast for accents and call-to-action buttons." },
      { q: "Can I export the palette to CSS?", a: "Yes — the Export panel includes CSS variables you can paste straight into your stylesheet, plus HEX and RGB lists." },
      { q: "How do I keep a color I like?", a: "Tap the lock icon on any swatch — it stays put while the others reshuffle around it." },
      { q: "Are palettes generated in my browser?", a: "Yes — the color math runs locally. Nothing about your colors is sent anywhere." },
    ],
  },
  "percentage-calculator": {
    slug: "percentage-calculator",
    primaryKeyword: "percentage calculator",
    category: "Calculators",
    howTo: [
      "Pick the calculation type — percent of a number, percent change or what percent.",
      "Type the two numbers in the boxes.",
      "Read the answer instantly, with the working shown.",
    ],
    faqs: [
      { q: "How do I calculate the percentage of a number?", a: "Pick 'X% of Y', type the percentage in the first box and the number in the second. The result updates as you type — no Calculate button needed." },
      { q: "How is percent increase or decrease calculated?", a: "We use ((new − old) / old) × 100. A negative result means a decrease, a positive result means an increase." },
      { q: "Is anything sent to a server?", a: "No — every calculation runs in your browser. Nothing is logged or uploaded." },
    ],
  },
  "loan-calculator": {
    slug: "loan-calculator",
    primaryKeyword: "loan emi calculator",
    category: "Calculators",
    howTo: [
      "Enter the loan amount, annual interest rate and term in years or months.",
      "See your monthly payment, total interest and total cost.",
      "Open the schedule to see every monthly instalment broken into principal and interest.",
    ],
    faqs: [
      { q: "How is the monthly EMI calculated?", a: "We use the standard amortising loan formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r is the monthly interest rate and n is the number of months." },
      { q: "Does it work for mortgages, car loans and personal loans?", a: "Yes — any fixed-rate amortising loan works the same way. Switch term between months and years to match how your lender quotes it." },
      { q: "Are my inputs saved anywhere?", a: "No — everything is calculated in your browser and nothing is sent or stored." },
    ],
  },
  "tip-calculator": {
    slug: "tip-calculator",
    primaryKeyword: "tip calculator bill split",
    category: "Calculators",
    howTo: [
      "Type the bill total.",
      "Slide the tip percentage to what you'd like to leave.",
      "Pick how many people are splitting — see the per-person amount instantly.",
    ],
    faqs: [
      { q: "Can I split unevenly?", a: "This calculator splits evenly. For uneven splits, divide the bill manually and use the tip percentage to add the same rate to each share." },
      { q: "Does it round to whole money amounts?", a: "Yes — toggle 'Round up per person' to nudge each share up to the nearest dollar/rupee/euro for easier cash payments." },
    ],
  },
  "discount-calculator": {
    slug: "discount-calculator",
    primaryKeyword: "discount calculator",
    category: "Calculators",
    howTo: [
      "Enter the original price.",
      "Type the discount percentage — or stack two discounts.",
      "See the final price and the amount you save.",
    ],
    faqs: [
      { q: "How do stacked discounts work?", a: "Stacked discounts apply one after the other: a 20% off then 10% off coupon equals 28% off, not 30% off. We show the effective single percentage." },
      { q: "Can I include tax?", a: "Yes — add a tax rate and the calculator shows the final price after the discount and tax combined." },
    ],
  },
  "unit-converter": {
    slug: "unit-converter",
    primaryKeyword: "unit converter online",
    category: "Converters",
    howTo: [
      "Pick a category — length, weight, volume, area, speed, time or data.",
      "Choose the unit you have and the unit you want.",
      "Type any number — the result updates as you type, both ways.",
    ],
    faqs: [
      { q: "Which units are supported?", a: "Metric and imperial for length, weight, volume, area, speed and time, plus common data units like KB, MB, GB and TB (both decimal and binary)." },
      { q: "How accurate are the conversions?", a: "We use exact ratios where they exist (e.g. 1 inch = 25.4 mm) and full double precision elsewhere, then round the display to 6 significant figures." },
    ],
  },
  "temperature-converter": {
    slug: "temperature-converter",
    primaryKeyword: "celsius fahrenheit kelvin converter",
    category: "Converters",
    howTo: [
      "Type a temperature in any of the three boxes — Celsius, Fahrenheit or Kelvin.",
      "The other two update as you type.",
      "Tap any common preset (freezing, body temp, boiling) to jump straight to it.",
    ],
    faqs: [
      { q: "How do I convert Celsius to Fahrenheit?", a: "Multiply by 9, divide by 5, then add 32. For example, 20°C × 9 ÷ 5 + 32 = 68°F. This tool does it instantly for you." },
      { q: "What's absolute zero?", a: "0 Kelvin, equal to −273.15°C or −459.67°F. The converter blocks values below that for Kelvin to avoid impossible temperatures." },
    ],
  },
  "roman-numerals": {
    slug: "roman-numerals",
    primaryKeyword: "roman numeral converter",
    category: "Converters",
    howTo: [
      "Type a number from 1 to 3,999 to see its Roman numeral.",
      "Or type a Roman numeral to convert it back to a regular number.",
      "Tap a preset year or copy the result in one click.",
    ],
    faqs: [
      { q: "Why only up to 3,999?", a: "Standard Roman numerals top out at MMMCMXCIX (3,999). Larger numbers traditionally use bars over letters, which doesn't render reliably in plain text." },
      { q: "Are Roman numerals case-sensitive?", a: "No — the converter accepts both XII and xii. The output is shown in uppercase, which is the most common convention." },
    ],
  },
  "fraction-calculator": {
    slug: "fraction-calculator",
    primaryKeyword: "fraction calculator",
    category: "Calculators",
    howTo: [
      "Type the two fractions — leave the whole number empty for plain fractions.",
      "Pick +, −, × or ÷.",
      "See the simplified fraction, mixed number and decimal result instantly.",
    ],
    faqs: [
      { q: "Does it work with mixed numbers?", a: "Yes — fill in the whole-number box to use mixed numbers like 1 1/2. The result also shows a mixed-number form when it makes sense." },
      { q: "Will it simplify the answer for me?", a: "Yes. We compute the greatest common divisor and reduce the result to lowest terms automatically." },
    ],
  },
  "scientific-calculator": {
    slug: "scientific-calculator",
    primaryKeyword: "scientific calculator",
    category: "Calculators",
    howTo: [
      "Tap the on-screen keypad or type with your keyboard.",
      "Switch between DEG and RAD for trig functions.",
      "Press Enter or = to calculate — your history is kept on the side.",
    ],
    faqs: [
      { q: "Which functions are supported?", a: "sin, cos, tan and their inverses, ln, log, log2, sqrt, cbrt, abs, exp, factorial (n!), powers (x^y) and constants π and e." },
      { q: "Does it use degrees or radians?", a: "Either — toggle DEG/RAD at the top. Inverse trig results are returned in the matching unit." },
    ],
  },
  "subnet-calculator": {
    slug: "subnet-calculator",
    primaryKeyword: "subnet calculator",
    category: "Developer",
    howTo: [
      "Type any IPv4 address — e.g. 192.168.1.10.",
      "Set the CIDR prefix (0–32) or pick a common one like /24.",
      "Read the network, broadcast, mask, wildcard and host range.",
    ],
    faqs: [
      { q: "What does /24 mean?", a: "It means the first 24 bits identify the network and the remaining 8 bits are for hosts — giving you 256 addresses with 254 usable hosts." },
      { q: "Does this support IPv6?", a: "Not yet — this tool focuses on IPv4 CIDR subnetting, which covers the vast majority of day-to-day network planning." },
    ],
  },
  "barcode-generator": {
    slug: "barcode-generator",
    primaryKeyword: "barcode generator",
    category: "Generators",
    howTo: [
      "Type the value you want to encode.",
      "Pick a format — CODE128 is a safe default for any text or SKU.",
      "Tweak size and colours, then download as PNG or scalable SVG.",
    ],
    faqs: [
      { q: "Which formats are supported?", a: "CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF, ITF-14, MSI and Pharmacode — covering retail, logistics and general-purpose use." },
      { q: "Are the barcodes safe to print?", a: "Yes. The SVG export is vector and stays crisp at any size. PNG export is high-resolution and great for labels." },
    ],
  },
  "qr-reader": {
    slug: "qr-reader",
    primaryKeyword: "qr code reader online",
    category: "Image",
    howTo: [
      "Drop a QR image or paste a screenshot — or tap Scan with camera.",
      "The decoded text or link appears instantly.",
      "Tap Copy, or open URLs in a new tab.",
    ],
    faqs: [
      { q: "Is my image uploaded anywhere?", a: "No — decoding runs entirely in your browser. The image and the decoded text never leave your device." },
      { q: "Will it read Wi-Fi or contact QR codes?", a: "Yes — any standard QR is decoded to its raw text, including WIFI: and MECARD/vCard payloads, which you can copy or parse further." },
    ],
  },
  "clip-path-generator": {
    slug: "clip-path-generator",
    primaryKeyword: "css clip path generator",
    category: "Generators",
    howTo: [
      "Pick a starting shape — triangle, hexagon, star, arrow and more.",
      "Drag the X and Y sliders to fine-tune each corner.",
      "Copy the ready-to-paste clip-path CSS for your project.",
    ],
    faqs: [
      { q: "Does it include the -webkit- prefix?", a: "Yes — the copied CSS includes both clip-path and -webkit-clip-path for broad browser support." },
      { q: "Can I preview the shape over an image?", a: "Yes — toggle between a solid colour and a sample photo to see how the shape looks over real content." },
    ],
  },
  "user-agent-parser": {
    slug: "user-agent-parser",
    primaryKeyword: "user agent parser",
    category: "Developer",
    howTo: [
      "Paste a User-Agent string, or tap “Use my browser”.",
      "See the browser, engine, OS, device type and bot flag parsed in one view.",
      "Copy the original string to share in bug reports.",
    ],
    faqs: [
      { q: "Does this work offline?", a: "Yes — parsing happens entirely in your browser with no network calls." },
      { q: "Can it detect bots and crawlers?", a: "It flags common search-engine bots and crawlers (Googlebot, Bingbot, DuckDuckBot and more) when they appear in the User-Agent." },
    ],
  },
  "yt-video-id": {
    slug: "yt-video-id",
    primaryKeyword: "youtube video id extractor",
    category: "Generators",
    howTo: [
      "Paste any YouTube link — watch, share, Shorts, embed or youtu.be.",
      "Read the 11-character video ID on the right.",
      "Copy the clean URL format you need — watch, short, embed or thumbnail.",
    ],
    faqs: [
      { q: "What is a YouTube video ID?", a: "Every YouTube video has a unique 11-character ID made of letters, numbers, dashes and underscores — for example dQw4w9WgXcQ. It's the part after v= in a watch URL." },
      { q: "Does this work for Shorts and youtu.be links?", a: "Yes — we handle watch, share, Shorts, embed, live and youtu.be URLs, plus raw IDs pasted on their own." },
      { q: "Is the URL sent anywhere?", a: "No. Parsing runs in your browser only — nothing leaves your device." },
    ],
  },
  "yt-embed-code": {
    slug: "yt-embed-code",
    primaryKeyword: "youtube embed code generator",
    category: "Generators",
    howTo: [
      "Paste a YouTube link or video ID.",
      "Pick options — start time, autoplay, mute, loop, captions, privacy mode.",
      "Copy the responsive iframe and paste it into your site.",
    ],
    faqs: [
      { q: "What is privacy-enhanced mode?", a: "It uses YouTube's youtube-nocookie.com domain, so YouTube doesn't set tracking cookies for visitors until they actually play the video." },
      { q: "Why doesn't autoplay always work?", a: "Most modern browsers block autoplay with sound. Tick the Mute option together with Autoplay so the video can start automatically." },
      { q: "Does the responsive option keep 16:9?", a: "Yes — it wraps the iframe in a container with 56.25% bottom padding so the video fills the width of any column and keeps the 16:9 ratio." },
    ],
  },
  "yt-timestamp": {
    slug: "yt-timestamp",
    primaryKeyword: "youtube timestamp link generator",
    category: "Generators",
    howTo: [
      "Paste a YouTube link.",
      "Add one or more timestamps in seconds or hh:mm:ss.",
      "Copy a single jump link, or the whole chapters block for your description.",
    ],
    faqs: [
      { q: "Will my link jump to the exact second?", a: "Yes — we add ?t=Ns to the youtu.be link so YouTube starts playback at that second on the web and in the app." },
      { q: "How do I make YouTube chapters?", a: "Paste the description block this tool generates into your video description. As long as the first stamp is 0:00 and chapters are at least 10 seconds apart, YouTube will detect them automatically." },
      { q: "Does the timestamp work in embeds too?", a: "Yes — use the YouTube Embed Code Generator and set the Start at field. The iframe will respect it." },
    ],
  },
  "yt-title-counter": {
    slug: "yt-title-counter",
    primaryKeyword: "youtube title character counter",
    category: "Generators",
    howTo: [
      "Type or paste your title, description and tags.",
      "Watch the live bars and the search-result preview on the right.",
      "Keep titles under 70 characters so they don't get cut off in search results.",
    ],
    faqs: [
      { q: "What is the YouTube title character limit?", a: "YouTube allows up to 100 characters in a title, but search and suggested results often truncate after about 70. We flag both limits as you type." },
      { q: "How long can a YouTube description be?", a: "Up to 5,000 characters. The first 157 or so show above the Show more fold on desktop, so put your hook and links there." },
      { q: "How many tags can I add?", a: "The total tag field is capped at 500 characters including commas. We count that for you in real time." },
    ],
  },
  "yt-hashtag-generator": {
    slug: "yt-hashtag-generator",
    primaryKeyword: "youtube hashtag generator",
    category: "Generators",
    howTo: [
      "Type a short topic, like 'cooking pasta'.",
      "Pick a niche to flavour the tag mix.",
      "Copy the 15 hashtags into the bottom of your description.",
    ],
    faqs: [
      { q: "How many hashtags should I use on YouTube?", a: "YouTube shows the first three hashtags in your description above the video title, and ignores anything over fifteen. We give you exactly fifteen — three of them tuned to your topic." },
      { q: "Where should hashtags go on YouTube?", a: "Put them at the very end of your description. The first three become clickable links above the title." },
      { q: "Are these real trending hashtags?", a: "We use a curated bank of broad, mid-tail and niche tags per category. Trends change fast — use these as a strong starting set and add seasonal ones if relevant." },
    ],
  },
  "yt-subscribe-link": {
    slug: "yt-subscribe-link",
    primaryKeyword: "youtube subscribe link generator",
    category: "Generators",
    howTo: [
      "Paste your channel URL or @handle.",
      "Copy the subscribe link — it opens the confirm pop-up automatically.",
      "Download the QR code to print on cards, end screens or in your video.",
    ],
    faqs: [
      { q: "What does ?sub_confirmation=1 do?", a: "It tells YouTube to show the Subscribe confirmation pop-up the moment someone opens your channel page — so they can subscribe in one tap without clicking around." },
      { q: "Will it work on mobile?", a: "Yes — modern phones open the link in the YouTube app and show the confirm dialog. The QR code triggers the same flow when scanned with a phone camera." },
      { q: "Can I use my channel ID instead of a handle?", a: "Yes — paste a youtube.com/channel/UCxxxxxxxxxxxxx URL and we'll build the subscribe link the same way." },
    ],
  },
  "yt-money-calculator": {
    slug: "yt-money-calculator",
    primaryKeyword: "youtube money calculator",
    category: "Calculators",
    howTo: [
      "Enter the total views for a video or month.",
      "Pick the niche that matches your channel — RPM varies a lot by topic.",
      "Adjust the monetisable view rate to match your audience.",
    ],
    faqs: [
      { q: "Is the estimate accurate?", a: "It's a rough range based on industry-average RPMs after YouTube's 45% cut. Your real RPM depends on watch time, audience country, ad inventory and seasonality — December and June are usually the highest months." },
      { q: "Does it include sponsorships or memberships?", a: "No — only AdSense ad revenue. Sponsorships, channel memberships, Super Thanks and affiliate income are on top of this number." },
      { q: "What's RPM vs CPM?", a: "CPM is what advertisers pay per 1,000 ad views. RPM is what you keep per 1,000 video views after YouTube's cut and after un-monetised views. RPM is the number that actually lands in your bank." },
    ],
  },
  "yt-comment-picker": {
    slug: "yt-comment-picker",
    primaryKeyword: "youtube comment picker",
    category: "Generators",
    howTo: [
      "Copy the comments from your YouTube video and paste them in.",
      "Set the number of winners and any keyword that must be included.",
      "Click Pick winners — share your screen during the draw for transparency.",
    ],
    faqs: [
      { q: "Is the random pick really fair?", a: "Yes — it uses the browser's cryptographically secure random generator (crypto.getRandomValues), so every eligible entry has an equal chance." },
      { q: "Does it remove duplicates?", a: "Yes, by default it keeps one entry per @handle. You can also exclude your own handle so replies from your channel don't get picked." },
      { q: "Is any data sent to a server?", a: "No. Everything runs in your browser — comments never leave your device." },
    ],
  },
  "yt-chapters": {
    slug: "yt-chapters",
    primaryKeyword: "youtube chapter generator",
    category: "Generators",
    howTo: [
      "Add a chapter for each section, starting with 0:00.",
      "Make sure each chapter is at least 10 seconds after the last one.",
      "Copy the formatted block and paste it into your video description.",
    ],
    faqs: [
      { q: "Why aren't my chapters showing on YouTube?", a: "Three rules must be met: the first timestamp is 0:00, you have at least 3 chapters, and each one is at least 10 seconds after the last. We check all three live." },
      { q: "Can I use hours?", a: "Yes — use H:MM:SS for videos over an hour (e.g. 1:05:30) or M:SS for shorter videos (e.g. 5:30)." },
      { q: "How many chapters should I add?", a: "Most successful long-form videos use 5–10 chapters. Too many turns the seekbar into clutter; too few and viewers can't skip around." },
    ],
  },
  "yt-tag-generator": {
    slug: "yt-tag-generator",
    primaryKeyword: "youtube tag generator",
    category: "Generators",
    howTo: [
      "Enter your main keyword and an optional niche.",
      "Tap any tag to add or remove it — stay under the 500-character limit.",
      "Copy the comma-separated string straight into YouTube's Tags field.",
    ],
    faqs: [
      { q: "Do YouTube tags still matter?", a: "They're a small signal — much less than title, thumbnail and description. Tags help YouTube confirm what your video is about, especially for misspellings and synonyms of your main keyword." },
      { q: "What's YouTube's tag limit?", a: "500 characters total across all tags, including the commas between them. We show a live counter so you can't go over." },
      { q: "Should I copy tags from other channels?", a: "No — copy the keyword ideas, not the tags themselves. Tags should describe your video specifically, not a competitor's." },
    ],
  },
  "yt-banner-maker": {
    slug: "yt-banner-maker",
    primaryKeyword: "youtube banner maker",
    category: "Image",
    howTo: [
      "Drop a high-resolution photo (2560 px wide or more is ideal).",
      "Choose Fill to cover the banner, or Fit to keep the whole image with a background.",
      "Click Build my banner and download the 2560×1440 PNG.",
    ],
    faqs: [
      { q: "What size is a YouTube banner?", a: "YouTube recommends a single 2560×1440 image. The visible area changes by device — only the central 1546×423 'safe zone' is guaranteed visible on TVs, phones and desktops." },
      { q: "Why is part of my banner cut off on mobile?", a: "Mobile crops to a much narrower strip around the center. Keep your channel name, logo and any text inside the safe-zone overlay and they'll show up on every device." },
      { q: "Does it upload my photo?", a: PRIVACY },
    ],
  },
  "mortgage-calculator": {
    slug: "mortgage-calculator",
    primaryKeyword: "mortgage calculator",
    category: "Calculators",
    howTo: [
      "Type your home price, down payment, loan term and interest rate.",
      "Add yearly property tax and home insurance if you want a full monthly payment.",
      "Try an extra monthly payment to see how much interest you'd save and how much sooner you'd pay off the loan.",
    ],
    faqs: [
      { q: "How is the monthly payment calculated?", a: "We use the standard amortization formula: P × r ÷ (1 − (1 + r)^−n), where P is the loan amount, r is the monthly interest rate and n is the number of monthly payments. Property tax and insurance are added on top, divided by 12." },
      { q: "Does this include PMI or HOA fees?", a: "Not directly — add them into the 'insurance' field if you'd like to bundle them. Most lenders treat PMI as monthly, so divide an annual rate by 12 first." },
      { q: "How much do extra payments really save?", a: "A lot. On a 30-year loan, even $100 extra a month often saves tens of thousands in interest and finishes the loan 3–5 years early. Try a few amounts and watch the yearly schedule." },
      { q: "Is my information saved or uploaded?", a: "No. The calculator runs entirely in your browser — nothing you type leaves your device." },
    ],
  },
  "emoji-picker": {
    slug: "emoji-picker",
    primaryKeyword: "emoji picker copy paste",
    category: "Generators",
    howTo: [
      "Type a word like 'fire', 'heart', or 'party' in the search box.",
      "Click any emoji to copy it to your clipboard.",
      "Paste it anywhere — Instagram, WhatsApp, email, documents, file names.",
    ],
    faqs: [
      { q: "Why doesn't an emoji show up after I paste it?", a: "The other app probably uses an older system font that doesn't include that emoji. Try a newer app or update your device — the character is fine, the font just hasn't caught up." },
      { q: "Are flag emojis blocked on some platforms?", a: "Yes — Windows shows flag emojis as two-letter codes (e.g. 'US', 'GB') instead of the actual flag. That's a Windows decision, not a missing emoji." },
      { q: "Do you save the emojis I copy?", a: "Only on your own device. Your 'recently used' list lives in this browser's local storage so it's there next time. Nothing is uploaded." },
    ],
  },
  "json-minifier": {
    slug: "json-minifier",
    primaryKeyword: "json minifier",
    category: "Developer",
    howTo: [
      "Paste your JSON into the left box (or click Paste).",
      "Pick Minify to strip spaces and line breaks, or Pretty-print to format with indentation.",
      "Click Copy or Download to grab the result. We'll show exactly how much smaller it got.",
    ],
    faqs: [
      { q: "Why minify JSON at all?", a: "Smaller payloads mean faster API responses and lower bandwidth costs. For a typical config or response, minifying shaves 20–40% — sometimes more if your JSON was indented heavily." },
      { q: "Will minifying break my JSON?", a: "No. Whitespace is not significant in JSON — only inside string values, where we never touch it. The parsed data is identical, byte-for-byte after re-parsing." },
      { q: "Why is my JSON invalid?", a: "We show the exact line and column. The usual culprits are trailing commas, single quotes instead of double, comments (JSON doesn't allow them) and unquoted keys." },
      { q: "Is anything uploaded?", a: PRIVACY },
    ],
  },
  "image-to-base64": {
    slug: "image-to-base64",
    primaryKeyword: "image to base64",
    category: "Image",
    howTo: [
      "Drop an image into the box, or pick one from your device.",
      "Copy the Base64 data URL, or the ready-made HTML, CSS or Markdown snippet.",
      "Switch direction to paste Base64 text and download the image back as a file.",
    ],
    faqs: [
      { q: "What's a Base64 data URL good for?", a: "Embedding small images directly in HTML, CSS or Markdown — no separate file or server needed. Common for inline icons, email signatures, single-file demos and quick prototypes." },
      { q: "Why is the Base64 text so long?", a: "Base64 makes a file roughly 33% larger than its binary size. For tiny icons that's fine; for big photos it bloats the page and slows it down — keep a real image file in that case." },
      { q: "Do you support PNG, JPG, SVG, GIF and WebP?", a: "Yes — any image the browser can read. The data URL keeps the original format (PNGs stay PNG, SVGs stay SVG, and so on)." },
      { q: "Does my image get uploaded?", a: PRIVACY },
    ],
  },
  "audio-trimmer": {
    slug: "audio-trimmer", primaryKeyword: "audio trimmer online free", category: "Audio",
    howTo: ["Choose an MP3, WAV, M4A or OGG file from your device.", "Drag the start and end sliders to the part you want to keep.", "Pick MP3 or WAV, then click Trim & download."],
    faqs: [
      { q: "Does my audio get uploaded?", a: "No. The trimmer decodes and re-encodes audio entirely in your browser using the Web Audio API — your file never leaves your device." },
      { q: "What audio formats can I trim?", a: "Anything your browser can decode — MP3, WAV, M4A/AAC and OGG/Opus. The output is saved as MP3 or WAV." },
      { q: "Will trimming reduce quality?", a: "WAV output is lossless. MP3 is re-encoded at 192 kbps which is transparent for spoken word and very close to source for music." },
      { q: "Is there a file size limit?", a: "There is no hard limit, but very long files (over an hour) may use a lot of memory on phones — desktop browsers handle them comfortably." },
    ],
  },
  "audio-merger": {
    slug: "audio-merger", primaryKeyword: "merge audio files online", category: "Audio",
    howTo: ["Add two or more audio clips.", "Drag them into the order you want.", "Click Merge & download to get one continuous file."],
    faqs: [
      { q: "Can I merge MP3 and WAV files together?", a: "Yes — files are decoded to a common format, joined seamlessly, and re-encoded as MP3 or WAV. Sample rates and channel counts are matched automatically." },
      { q: "Is there a gap between clips?", a: "No. Clips are joined sample-accurately with no silence inserted. Use the Crossfade tool if you want a smooth blend." },
      { q: "How many files can I merge?", a: "As many as your device's memory allows. For very long compilations, merge in smaller batches." },
      { q: "Does it work offline?", a: "Yes. Once the page is loaded, the merger runs fully in your browser with no network calls." },
    ],
  },
  "audio-converter": {
    slug: "audio-converter", primaryKeyword: "convert mp3 to wav online", category: "Audio",
    howTo: ["Pick an audio file.", "Choose the output format and (for MP3) a bitrate from 96 to 320 kbps.", "Click Convert & download."],
    faqs: [
      { q: "Which formats are supported?", a: "Input: MP3, WAV, M4A/AAC, OGG/Opus. Output: MP3 or WAV. WAV is lossless; MP3 is widely compatible and small." },
      { q: "Which MP3 bitrate should I pick?", a: "128 kbps for voice, 192 kbps for general use, 320 kbps for music you want to keep at near-CD quality." },
      { q: "Will converting WAV to MP3 lose quality?", a: "MP3 is lossy, so yes — but at 192 kbps and above most people can't tell the difference from the source." },
      { q: "Is the converter free?", a: "Yes, completely free with no signup. Everything runs in your browser." },
    ],
  },
  "audio-speed": {
    slug: "audio-speed", primaryKeyword: "change audio speed online", category: "Audio",
    howTo: ["Upload your audio file.", "Drag the speed slider from 0.25× to 4×.", "Click Apply & download to save the new version."],
    faqs: [
      { q: "Does changing speed also change pitch?", a: "Yes — like an old tape deck. Use the Pitch Shifter if you want to keep the pitch and only change the speed." },
      { q: "What's a good speed for studying podcasts?", a: "1.25× to 1.5× is a sweet spot — fast enough to save time, slow enough to follow easily." },
      { q: "Can I slow down music to learn a part?", a: "Yes — 0.5× or 0.75× is great for transcribing solos or learning lyrics." },
      { q: "Is the audio still high quality after?", a: "Yes. Speed change is done by re-sampling, which keeps audio clean across the supported 0.25×–4× range." },
    ],
  },
  "audio-pitch": {
    slug: "audio-pitch", primaryKeyword: "pitch shifter online free", category: "Audio",
    howTo: ["Upload an audio file.", "Slide pitch up or down in semitones (+12 = one octave up, −12 = one octave down).", "Click Apply & download."],
    faqs: [
      { q: "Does this change the song's key for karaoke?", a: "Yes — shift up or down by semitones to find a key that fits your voice." },
      { q: "Will the song get longer or shorter?", a: "No. The duration stays the same; only the pitch changes." },
      { q: "How far can I shift before it sounds odd?", a: "About ±5 semitones is natural. Beyond that, voices start to sound chipmunk-like or low-and-slow." },
      { q: "Does it work for instruments too?", a: "Yes — guitars, pianos and full mixes all shift cleanly. Drums may sound slightly different in extreme shifts." },
    ],
  },
  "audio-reverser": {
    slug: "audio-reverser", primaryKeyword: "reverse audio online free", category: "Audio",
    howTo: ["Upload any audio file.", "Click Reverse & download.", "Play it back to hear the audio in reverse."],
    faqs: [
      { q: "Why would I reverse audio?", a: "Sound design effects (reverse cymbals, swells), fun voice messages, music production, or to check for hidden messages in songs." },
      { q: "Does reversing reduce quality?", a: "No — the audio samples are just played in reverse order. The original quality is preserved exactly." },
      { q: "Can I reverse just part of a song?", a: "Trim the section first with the Audio Trimmer, then reverse it. Use the Merger to splice it back into the original." },
      { q: "Is the file uploaded anywhere?", a: "No. Reversing happens in your browser; nothing is sent to a server." },
    ],
  },
  "audio-normalizer": {
    slug: "audio-normalizer", primaryKeyword: "normalize audio online", category: "Audio",
    howTo: ["Upload a quiet or uneven audio file.", "Pick a target peak level (−1 dB is a safe default).", "Click Normalize & download."],
    faqs: [
      { q: "What does normalizing audio do?", a: "It scales the whole file so the loudest peak reaches your target level. Quiet recordings become loud and clear without distortion." },
      { q: "What's the difference between normalize and compress?", a: "Normalize uniformly raises volume; compression squashes loud parts to bring up quiet ones. Normalize is simpler and distortion-free." },
      { q: "Should I normalize to 0 dB?", a: "Aim for −1 dB. Hitting exactly 0 dB risks clipping on some playback systems." },
      { q: "Does it work on podcasts and voice memos?", a: "Yes — it's perfect for evening out interview recordings before publishing." },
    ],
  },
  "audio-crossfade": {
    slug: "audio-crossfade", primaryKeyword: "crossfade audio online", category: "Audio",
    howTo: ["Add two audio files in the order you want them to play.", "Choose how long the crossfade should be (2–10 seconds is typical).", "Click Crossfade & download."],
    faqs: [
      { q: "How long should a crossfade be?", a: "3–5 seconds for music transitions, 1–2 seconds for spoken-word edits. Longer fades suit ambient or DJ-style sets." },
      { q: "Do the files need the same format?", a: "No — Bluebird decodes both and matches sample rates automatically before blending." },
      { q: "Can I crossfade more than two tracks?", a: "Crossfade two at a time, then use the Audio Merger to chain the results into a longer mix." },
      { q: "What output format does it use?", a: "MP3 by default for compatibility, or WAV for lossless quality." },
    ],
  },
  "silence-remover": {
    slug: "silence-remover", primaryKeyword: "remove silence from audio online", category: "Audio",
    howTo: ["Upload your podcast, voice memo or interview.", "Set the silence threshold and minimum gap length (defaults work for most recordings).", "Click Remove silence & download."],
    faqs: [
      { q: "How does it know what counts as silence?", a: "Sections quieter than your threshold (in dB) for longer than the minimum gap length are considered silence and removed." },
      { q: "Will it cut breaths and pauses too?", a: "Short pauses under your minimum length are kept so speech still sounds natural. Increase the threshold if you want a tighter cut." },
      { q: "Is it good for editing podcasts?", a: "Yes — it's a fast way to clean up long pauses before publishing. Re-listen to confirm nothing important was trimmed." },
      { q: "Does it work offline?", a: "Yes. Once the page loads, processing is fully local." },
    ],
  },
  "tone-generator": {
    slug: "tone-generator", primaryKeyword: "online tone generator", category: "Audio",
    howTo: ["Pick a waveform — sine, square, triangle or saw.", "Set the frequency (20 Hz to 20 kHz) and volume.", "Press Play to hear it, or Record to save a clip as WAV."],
    faqs: [
      { q: "What's a sine wave used for?", a: "Tuning instruments, testing speakers and hearing tests. 440 Hz is the standard tuning A." },
      { q: "Can I hear ultrasonic frequencies?", a: "Most adults hear up to 15–17 kHz. Children and teens often hear higher. Be gentle with the volume." },
      { q: "Is the tone perfectly accurate?", a: "Yes — it's generated by the browser's Web Audio oscillator, which is sample-accurate." },
      { q: "Will this damage my speakers?", a: "Not at moderate volume. Square and saw waves at high volume can stress small speakers, so start quiet." },
    ],
  },
  "metronome": {
    slug: "metronome", primaryKeyword: "online metronome free", category: "Audio",
    howTo: ["Set the tempo in BPM and pick a time signature.", "Tap Start. Adjust accent and sound to taste.", "Use tempo presets (Largo, Andante, Allegro…) for quick switches."],
    faqs: [
      { q: "How accurate is the metronome?", a: "Bluebird uses the Web Audio clock — accurate to within a millisecond, which is far tighter than any human can hear." },
      { q: "What tempo should I practise at?", a: "Start at a tempo where you play cleanly with no mistakes. Move up by 5 BPM once it feels easy." },
      { q: "Can I use it on my phone?", a: "Yes — it works on iPhone and Android. Keep the screen on so the tab stays awake." },
      { q: "Does it work without internet?", a: "Yes, after the first load it works fully offline." },
    ],
  },
  "bpm-detector": {
    slug: "bpm-detector", primaryKeyword: "bpm detector online free", category: "Audio",
    howTo: ["Upload a song or audio clip.", "Wait a few seconds while Bluebird analyses the beat.", "See the detected tempo in BPM."],
    faqs: [
      { q: "How accurate is automatic BPM detection?", a: "For music with a clear beat (pop, rock, dance) it's typically within 1 BPM. Free-tempo and classical music can be ambiguous." },
      { q: "Why does it sometimes show double or half my expected BPM?", a: "BPM can be musically ambiguous — 70 and 140 BPM can both be valid for the same song. Pick the value that feels right when you tap along." },
      { q: "What audio formats can I analyse?", a: "MP3, WAV, M4A and OGG. Larger files take a few extra seconds to decode." },
      { q: "Is the song uploaded anywhere?", a: "No. Analysis runs in your browser; the song never leaves your device." },
    ],
  },
  "audio-visualizer": {
    slug: "audio-visualizer", primaryKeyword: "audio visualizer online", category: "Audio",
    howTo: ["Upload a file or click Use microphone.", "Choose waveform or frequency bars.", "Watch the live visualization."],
    faqs: [
      { q: "Does it record my microphone?", a: "No. The microphone stream is read live for visualization only — nothing is saved or sent anywhere." },
      { q: "Can I save the visualization as a video?", a: "Use the screen recorder in our Media category to capture the visualization as a video." },
      { q: "Why don't the bars move much?", a: "Quiet audio gives small bars. Increase the playback volume or pick a louder track." },
      { q: "Does it work on mobile?", a: "Yes — iPhone and Android both support the live visualization, including microphone mode after granting permission." },
    ],
  },
  "ringtone-maker": {
    slug: "ringtone-maker", primaryKeyword: "ringtone maker free online", category: "Audio",
    howTo: ["Upload a song.", "Pick the 30-second section you want.", "Add a fade in/out and download as iPhone .m4r or Android .mp3."],
    faqs: [
      { q: "How do I set the ringtone on my iPhone?", a: "Download the .m4r file, open it in GarageBand on iPhone, share to Ringtone. Or use Finder/iTunes on a Mac to sync." },
      { q: "How do I set the ringtone on Android?", a: "Download the .mp3 and pick it under Settings → Sound → Phone ringtone, or set it from any file manager." },
      { q: "Why 30 seconds?", a: "iPhone ringtones must be 30 seconds or less. The tool keeps your clip within that limit automatically." },
      { q: "Is the song uploaded anywhere?", a: "No — the whole process runs in your browser. Your song stays on your device." },
    ],
  },
  "bitcoin-address-validator": {
    slug: "bitcoin-address-validator", primaryKeyword: "bitcoin address validator", category: "Crypto",
    howTo: ["Paste any Bitcoin address into the input.", "Read the format and checksum result below.", "Always double-check the first and last characters before sending."],
    faqs: [
      { q: "Which Bitcoin address formats are supported?", a: "Legacy (1…), P2SH (3…), SegWit Bech32 (bc1q…) and Taproot Bech32m (bc1p…)." },
      { q: "Is my address sent anywhere?", a: "No. Validation runs entirely in your browser — nothing is uploaded." },
      { q: "Does a valid result guarantee my funds are safe?", a: "No. It only means the format and checksum are correct. Always verify the address with the recipient before sending." },
      { q: "Why is my address marked invalid?", a: "The most common cause is a single character typo. Re-copy the address from the original source and try again." },
    ],
  },
  "eth-address-checker": {
    slug: "eth-address-checker", primaryKeyword: "ethereum address checker", category: "Crypto",
    howTo: ["Paste a 0x… Ethereum address.", "See whether the EIP-55 checksum is correct.", "Copy the correct mixed-case form if needed."],
    faqs: [
      { q: "What is EIP-55?", a: "EIP-55 is the mixed-case checksum encoding for Ethereum addresses. Wallets use it to catch copy-paste typos." },
      { q: "Does this work for ERC-20 tokens too?", a: "Yes — token addresses use the same EIP-55 format on Ethereum and other EVM chains." },
      { q: "Is my address sent to a server?", a: "No. All checks happen in your browser using keccak-256 hashing locally." },
      { q: "My address is lowercase — is it still valid?", a: "Yes. All-lowercase Ethereum addresses are valid but skip the checksum. We show the proper mixed-case form so you can verify it." },
    ],
  },
  "gas-unit-converter": {
    slug: "gas-unit-converter", primaryKeyword: "wei gwei ether converter", category: "Crypto",
    howTo: ["Type an amount.", "Pick the unit it's in (Wei, Gwei or Ether).", "Copy the converted values from the result table."],
    faqs: [
      { q: "What is Gwei?", a: "Gwei is a billionth of an Ether (10⁹ Wei). Gas prices are almost always quoted in Gwei." },
      { q: "Is the math precise for big numbers?", a: "Yes. We use BigInt internally so even 18-decimal Ether values stay exact." },
      { q: "Can I convert from Ether back to Wei?", a: "Yes — choose Ether as the source unit and the table shows the exact Wei value." },
      { q: "Is anything sent to a server?", a: "No. The conversion runs entirely in your browser." },
    ],
  },
  "wallet-qr-code": {
    slug: "wallet-qr-code", primaryKeyword: "crypto wallet qr code generator", category: "Crypto",
    howTo: ["Pick a chain (Bitcoin, Ethereum or Solana).", "Paste the receiving address and optional amount/label.", "Download the PNG and share it."],
    faqs: [
      { q: "Will wallets recognise the QR?", a: "Yes — we use the standard URI scheme for each chain (bitcoin:, ethereum:, solana:), which all major wallets understand." },
      { q: "Can I include an amount?", a: "Yes. Adding an amount pre-fills the send screen in most wallets so the sender just confirms." },
      { q: "Is my address uploaded?", a: "No. The QR is generated locally — your address never leaves your browser." },
      { q: "Can I print the QR?", a: "Yes, the PNG is high-resolution and prints cleanly on stickers, posters and receipts." },
    ],
  },
  "solidity-function-selector": {
    slug: "solidity-function-selector", primaryKeyword: "solidity function selector", category: "Crypto",
    howTo: ["Type a Solidity function signature like transfer(address,uint256).", "Read the 4-byte selector from the result card.", "Copy it into your transaction data."],
    faqs: [
      { q: "What is a function selector?", a: "It's the first 4 bytes of keccak-256(signature). The EVM uses it to route a call to the right function." },
      { q: "Should I include parameter names?", a: "No. Use canonical types only: transfer(address,uint256) — no names, no spaces." },
      { q: "Does this run offline?", a: "Yes. The keccak-256 hashing runs entirely in your browser." },
      { q: "Does it work for events too?", a: "Events use the full 32-byte topic hash, not the 4-byte selector. This tool focuses on function selectors." },
    ],
  },
  "dyslexia-text-preview": {
    slug: "dyslexia-text-preview", primaryKeyword: "dyslexia font preview", category: "Accessibility",
    howTo: ["Paste or type your text.", "Switch between dyslexia-friendly fonts and adjust spacing.", "Pick the colours and sizes that feel easiest to read."],
    faqs: [
      { q: "Which fonts are considered dyslexia-friendly?", a: "Research shows readers often prefer Atkinson Hyperlegible, Lexend, Comic Sans and Verdana over decorative serif fonts." },
      { q: "Why a cream background?", a: "Many dyslexic readers find low-contrast warm backgrounds easier than pure white. Try the colour pickers to find your sweet spot." },
      { q: "Does this change other websites?", a: "No — it's a preview tool. Use the settings you like as inspiration for your own designs or browser stylesheets." },
      { q: "Is my text saved?", a: "No. The preview is local-only and nothing is sent to a server." },
    ],
  },
  "bionic-text": {
    slug: "bionic-text", primaryKeyword: "bionic reading converter", category: "Accessibility",
    howTo: ["Paste your text.", "Adjust the bold ratio if you'd like a softer or stronger emphasis.", "Copy the formatted text into your email, doc or CMS."],
    faqs: [
      { q: "Does bionic reading actually help?", a: "Results are mixed in studies, but many people find it helps them focus on long blocks of text. Try it on something you read often." },
      { q: "Can I paste it into Gmail or Docs?", a: "Yes — 'Copy as rich text' preserves the bold styling in most editors." },
      { q: "Does it work in other languages?", a: "Yes — it works on any word characters, including most Latin-based languages." },
      { q: "Is my text uploaded?", a: "No. The conversion happens locally in your browser." },
    ],
  },
  "font-size-tester": {
    slug: "font-size-tester", primaryKeyword: "font size tester online", category: "Accessibility",
    howTo: ["Type your sample copy.", "Choose a font family and weight.", "Enter the sizes you want to compare and pick the most readable one."],
    faqs: [
      { q: "What body size is most accessible?", a: "16–20px is a safe baseline for most audiences. Older readers and small screens often benefit from 18px+." },
      { q: "Can I test custom fonts?", a: "The picker lists common web-safe and Bluebird brand fonts. You can also override the CSS in your own design tool once you've picked a size." },
      { q: "Does it cover headings?", a: "Yes — enter larger values like 24, 32, 48 to compare display sizes." },
      { q: "Is my text saved?", a: "No, everything stays in your browser." },
    ],
  },
  "color-blindness-simulator": {
    slug: "color-blindness-simulator", primaryKeyword: "color blindness simulator", category: "Accessibility",
    howTo: ["Drop in any image (PNG/JPG/WEBP).", "Switch between protanopia, deuteranopia and tritanopia.", "Download the simulated PNG to share with your team."],
    faqs: [
      { q: "Which types of color blindness are covered?", a: "The three most common dichromacies — protanopia (red), deuteranopia (green) and tritanopia (blue)." },
      { q: "Is my image uploaded?", a: "No. The simulation runs on canvas in your browser. Nothing is sent to a server." },
      { q: "What's the largest image I can simulate?", a: "Up to ~1024 px on the longest side for speed. Larger images are scaled down automatically." },
      { q: "How accurate is the simulation?", a: "We use standard color-vision matrices that are widely used in design tooling — accurate enough to spot most accessibility issues." },
    ],
  },
  "world-clock": {
    slug: "world-clock", primaryKeyword: "world clock multiple time zones", category: "Travel",
    howTo: ["Add the cities or time zones you care about.", "Watch them update live, side by side.", "Your board is saved to this browser for next time."],
    faqs: [
      { q: "Does daylight-saving time work automatically?", a: "Yes — we use the official IANA time-zone database via your browser, so DST changes happen on the right day." },
      { q: "Is my board saved across devices?", a: "It's saved only in this browser via localStorage. We don't sync to any server." },
      { q: "Can I add a city that isn't in the list?", a: "The list covers the most popular zones. If you need a specific city, pick any zone in the same IANA region." },
      { q: "Does it work offline?", a: "Yes — once the page is loaded, the clock keeps ticking even without an internet connection." },
    ],
  },
  "distance-calculator": {
    slug: "distance-calculator", primaryKeyword: "distance calculator coordinates", category: "Travel",
    howTo: ["Enter latitude and longitude for two points.", "Read the great-circle distance in km, miles and nautical miles.", "Use it for flight paths, hiking plans or sailing routes."],
    faqs: [
      { q: "What formula do you use?", a: "The Haversine formula on a sphere of radius 6,371 km — the same approximation used for most flight-path estimates." },
      { q: "How accurate is the result?", a: "Within about 0.5% for any two points on Earth, which is fine for travel planning. Surveying needs a different formula (Vincenty)." },
      { q: "Does it include elevation?", a: "No — it's a great-circle distance over a sphere, ignoring terrain and altitude." },
      { q: "Is anything sent to a server?", a: "No. The math runs in your browser only." },
    ],
  },
  "trip-cost-splitter": {
    slug: "trip-cost-splitter", primaryKeyword: "split trip costs calculator", category: "Travel",
    howTo: ["Add everyone in your group.", "Enter each shared expense and who paid for it.", "Read the settle-up list — the smallest set of payments to even things out."],
    faqs: [
      { q: "Does everyone need an account?", a: "No. The whole calculator runs in your browser, no accounts and no signups." },
      { q: "How is the settle-up list calculated?", a: "We compute each person's net balance, then greedily match the biggest debtor to the biggest creditor — usually the fewest possible transfers." },
      { q: "Can I split unequal shares?", a: "This version splits each expense equally across everyone. For weighted shares, add the bigger items as separate entries from the person who owes more." },
      { q: "Is my data saved?", a: "No — refresh the page and you start fresh. We never store your expenses on a server." },
    ],
  },
};



// High-volume long-tail modifiers that map to real Google searches for
// browser-based utilities. Combined with the tool name to generate
// per-tool long-tail phrases when no explicit `longTail` is provided.
const LONG_TAIL_MODIFIERS = [
  "online",
  "online free",
  "free no sign up",
  "in browser",
  "without watermark",
  "for free without registration",
  "no upload",
  "private",
  "on mobile",
  "for windows mac and linux",
];

const USE_CASE_MODIFIERS = [
  "for students",
  "for teachers",
  "for developers",
  "for designers",
  "for content creators",
  "for small businesses",
];

export function synthesizeLongTail(toolName: string): string[] {
  const base = toolName.toLowerCase();
  return LONG_TAIL_MODIFIERS.map((m) => `${base} ${m}`);
}

export function synthesizeUseCases(toolName: string): string[] {
  const base = toolName.toLowerCase();
  return USE_CASE_MODIFIERS.map((m) => `${base} ${m}`);
}

export function getToolSEO(slug: string): ToolSEO | undefined {
  return TOOL_SEO[slug];
}

// Build a complete SEO record for any tool — explicit entry wins, otherwise
// we synthesize a reasonable default from the tool's display name + category.
export function resolveToolSEO(
  slug: string,
  fallbackName: string,
  fallbackCategory: string,
  fallbackDesc?: string,
): ToolSEO {
  const explicit = TOOL_SEO[slug];
  const name = fallbackName;
  const longTail = explicit?.longTail ?? synthesizeLongTail(name);
  const useCases = explicit?.useCases ?? synthesizeUseCases(name);

  if (explicit) {
    return { ...explicit, longTail, useCases };
  }


  const lower = name.toLowerCase();
  return {
    slug,
    primaryKeyword: `${lower} online free`,
    category: fallbackCategory,
    howTo: [
      `Open the ${name} on Bluebird in any modern browser.`,
      `Add your input or upload your file — everything is processed on your device.`,
      `Get your result instantly and download or copy it. No sign-up, no watermark.`,
    ],
    faqs: [
      {
        q: `Is the ${name} really free?`,
        a: `Yes — the ${name} is 100% free, with no account, no watermark and no usage limits. Bluebird is free forever.`,
      },
      {
        q: `Is the ${name} safe to use?`,
        a: `Yes. ${fallbackDesc ?? `The ${name}`} runs entirely in your browser. Nothing is uploaded, stored or shared with any server.`,
      },
      {
        q: `Does the ${name} work on mobile?`,
        a: `Yes — the ${name} is fully responsive and works on iPhone, Android, iPad, Windows, Mac and Linux in any modern browser.`,
      },
      {
        q: `Do I need to sign up to use the ${name}?`,
        a: `No sign-up required. Open the page and start using the ${name} straight away — no email, no account, no cookies needed.`,
      },
    ],
    longTail,
    useCases,
  };
}


