import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode, type ComponentType, type SVGProps } from "react";
import { BluebirdMark } from "./BluebirdLogo";
import { ToolSEOBlock } from "./ToolSEOBlock";
import { ToolRating } from "./ToolRating";
import {
  Minimize2,
  Ruler,
  Repeat,
  ScanSearch,
  Sparkles,
  RotateCw,
  Crop,
  Stamp,
  Pipette,
  FileStack,
  QrCode,
  FileImage,
  KeyRound,
  Braces,
  FileCode2,
  Type as TypeIcon,
  Regex,
  GitCompare,
  Camera,
  FilePlus2,
  Scissors,
  FileText,
  Hash,
  Fingerprint,
  Link2,
  AlignLeft,
  Clock,
  FileType2,
  Palette,
  Table2,
  ShieldCheck,
  CloudOff,
  HardDrive,
  Gift,
  ArrowRight,
  SquareSlash,
  Binary,
  Code2,
  FileType,
  ListOrdered,
  Dices,
  SwatchBook,
  ListFilter,
  Search as SearchIcon,
  Paintbrush,
  FileDown,
  RotateCw as RotateCwIcon,
  FileSearch,
  Wand2,
  FileCode2 as FileCodeIcon,
  Scissors as ScissorsIcon,
  FilePlus2 as FilePlusIcon,
  Percent,
  Landmark,
  Receipt,
  Tag,
  Scale,
  Thermometer,
  BookOpen,
  FlipHorizontal,
  Radio,
  AtSign,
  Timer,
  Coins,
  Shuffle,
  Contrast,
  Square,
  CalendarDays,
  TrendingUp,
  PlayCircle,
  Volume2,
  TimerReset,
  Tags,
  Bot,
  Eye,
  Monitor,
  Plus as PlusIcon,
  Mic,
  Aperture,
  Languages,
  WandSparkles,
  Smile,
  Ratio,
  Radio as RadioIcon,
  Terminal,
  Database,
  GraduationCap,
  CircuitBoard,
  Calculator,
  Network,
  Barcode,
  ScanLine,
  Shapes,
  Globe,
  PlaySquare,
  UserPlus,

  Grid3x3,
  LayoutGrid,
  Smartphone,
  Heart,
  AlignJustify,
  Image as ImageIcon,
  Clapperboard,
  Menu,
  X,
  ChevronDown,
  Filter,
  Moon,
  Flame,
  Apple,
  Target,
  Baby,
  CalendarHeart,
  Wifi,
  Server,
  Mail,
  Plug,
  Music,
  Music2,
  AudioLines,
  Gauge,
  Combine,
  FastForward,
  Rewind,
  Disc3,
  Activity,
  Headphones,
  Waves,
  Bell,
  Bitcoin,
  Accessibility as AccessibilityIcon,
  Plane,
  Wallet,
  Fuel,
  Hash as HashIcon,
  Globe2,
  MapPin,
  Users as UsersIcon,
  Glasses,
  BookOpenText,
  ALargeSmall,
  Eye as EyeIcon2,
  FileBadge2,
  Atom,
  Layers,
  Grid2x2,
  Disc,
  Puzzle,
  Brain,
} from "lucide-react";


export type ToolCategory =
  | "Image"
  | "PDF"
  | "Text"
  | "Color & Design"
  | "Developer"
  | "Calculators"
  | "Converters"
  | "Generators"
  | "Media"
  | "Productivity"
  | "Instagram"
  | "YouTube"
  | "Network"
  | "Privacy"
  | "Audio"
  | "Crypto"
  | "Accessibility"
  | "Travel"
  | "Office"
  | "Education"
  | "Fun";

export const CATEGORIES: { id: ToolCategory; label: string; blurb: string }[] = [
  { id: "Image", label: "Image", blurb: "Edit, clean and prepare photos." },
  { id: "PDF", label: "PDF", blurb: "Merge, split, rotate and convert PDFs in your browser." },
  { id: "Audio", label: "Audio", blurb: "Trim, convert, speed, pitch and visualize sound — all offline." },
  { id: "Text", label: "Text", blurb: "Format, count, transform and clean up any text." },
  { id: "Color & Design", label: "Color & Design", blurb: "Pick colors, design palettes and craft CSS visuals." },
  { id: "Instagram", label: "Instagram", blurb: "Instagram-ready images, captions, hashtags and stats." },
  { id: "YouTube", label: "YouTube", blurb: "Thumbnails, embeds, timestamps and tags for creators." },
  { id: "Developer", label: "Developer", blurb: "Quick utilities for everyday coding and data." },
  { id: "Calculators", label: "Calculators", blurb: "Everyday math, money, health and study calculators." },
  { id: "Converters", label: "Converters", blurb: "Switch between units, temperatures and number systems." },
  { id: "Generators", label: "Generators", blurb: "Create QR codes, passwords, random data and more." },
  { id: "Media", label: "Media", blurb: "Record your screen, voice and capture from your camera." },
  { id: "Productivity", label: "Productivity", blurb: "Timers, counters and focus tools to get things done." },
  { id: "Network", label: "Network", blurb: "IP, DNS, ports and email-auth tools that run offline." },
  { id: "Privacy", label: "Privacy", blurb: "Strip metadata, blur faces and redact PDFs on your device." },
  { id: "Crypto", label: "Crypto & Web3", blurb: "Validate addresses, build wallet QRs and convert gas units offline." },
  { id: "Accessibility", label: "Accessibility", blurb: "Test readability, bionic text, dyslexia fonts and color blindness." },
  { id: "Travel", label: "Travel", blurb: "World clocks, distance, time zones and trip-cost splitters." },
  { id: "Office", label: "Office", blurb: "Invoices, resumes and everyday paperwork — print or save as PDF." },
  { id: "Education", label: "Education", blurb: "Study aids, periodic table, flash cards and times tables." },
  { id: "Fun", label: "Fun & Games", blurb: "Sudoku, name wheels and mnemonics for a creative break." },
];

/** URL-safe slug for a category id (e.g. "Color & Design" -> "color-and-design"). */
export function categorySlug(id: ToolCategory): string {
  return id.toLowerCase().replace(/\s*&\s*/g, "-and-").replace(/\s+/g, "-");
}


type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export const TOOLS = [
  {
    slug: "image-compressor",
    name: "Image Compressor",
    short: "Compress",
    category: "Image" as ToolCategory,
    Icon: Minimize2 as IconType,
    desc: "Make image files smaller without losing visible quality. Great for email attachments and faster websites.",
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    short: "Resize",
    category: "Image" as ToolCategory,
    Icon: Ruler as IconType,
    desc: "Change the width and height of a photo, or pick a ready-made size for Instagram, YouTube and more.",
  },
  {
    slug: "image-cropper",
    name: "Image Cropper",
    short: "Crop",
    category: "Image" as ToolCategory,
    Icon: Crop as IconType,
    desc: "Crop a photo to a square, a fixed ratio, or any custom box — with a live drag-to-resize handle.",
  },
  {
    slug: "rotate-flip",
    name: "Rotate & Flip",
    short: "Rotate",
    category: "Image" as ToolCategory,
    Icon: RotateCw as IconType,
    desc: "Rotate a photo by 90°, straighten it with a slider, or mirror it horizontally or vertically.",
  },
  {
    slug: "image-format-converter",
    name: "Format Converter",
    short: "Convert",
    category: "Image" as ToolCategory,
    Icon: Repeat as IconType,
    desc: "Turn a JPG into a PNG, a PNG into a WEBP, or any other mix — in a single click.",
  },
  {
    slug: "watermark",
    name: "Photo Watermark",
    short: "Watermark",
    category: "Image" as ToolCategory,
    Icon: Stamp as IconType,
    desc: "Add a text or logo watermark to one photo — or to a whole batch at once.",
  },
  {
    slug: "color-picker",
    name: "Color Picker",
    short: "Color",
    category: "Color & Design" as ToolCategory,
    Icon: Pipette as IconType,
    desc: "Tap any pixel in a photo to read its HEX, RGB and HSL color, and build a small palette.",
  },
  {
    slug: "exif-viewer",
    name: "EXIF Viewer & Cleaner",
    short: "Inspect",
    category: "Image" as ToolCategory,
    Icon: ScanSearch as IconType,
    desc: "See hidden info inside a photo (camera, location, date) and remove it before sharing.",
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    short: "Favicons",
    category: "Image" as ToolCategory,
    Icon: Sparkles as IconType,
    desc: "Turn any image into a full set of website icons, zipped and ready to drop into your site.",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    short: "PDF",
    category: "PDF" as ToolCategory,
    Icon: FileStack as IconType,
    desc: "Combine many photos into a single PDF — perfect for receipts, IDs, homework or portfolios.",
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    short: "PDF→IMG",
    category: "PDF" as ToolCategory,
    Icon: FileImage as IconType,
    desc: "Turn every page of a PDF into a sharp PNG or JPG — pick the pages you want and download them in one go.",
  },
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    short: "QR",
    category: "Generators" as ToolCategory,
    Icon: QrCode as IconType,
    desc: "Make a styled QR code for a link, Wi-Fi network, contact card or plain text — with your own colors and logo.",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    short: "Password",
    category: "Generators" as ToolCategory,
    Icon: KeyRound as IconType,
    desc: "Create strong, unique passwords with a live strength meter. Built with secure browser randomness — never sent anywhere.",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    short: "JSON",
    category: "Developer" as ToolCategory,
    Icon: Braces as IconType,
    desc: "Pretty-print, validate or minify JSON in one click. Spot errors with a clear line and column pointer.",
  },
  {
    slug: "base64",
    name: "Base64 Encoder & Decoder",
    short: "Base64",
    category: "Developer" as ToolCategory,
    Icon: FileCode2 as IconType,
    desc: "Turn text or files into Base64 and back. URL-safe option and a one-click file-to-data-URL helper.",
  },
  {
    slug: "text-case-converter",
    name: "Text Case Converter",
    short: "Case",
    category: "Text" as ToolCategory,
    Icon: TypeIcon as IconType,
    desc: "Switch text between UPPER, lower, Title, camel, snake, kebab and more — with live word and character counts.",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    short: "JWT",
    category: "Developer" as ToolCategory,
    Icon: KeyRound as IconType,
    desc: "Decode any JSON Web Token in your browser. See header, payload, expiry and signature side-by-side.",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    short: "Regex",
    category: "Developer" as ToolCategory,
    Icon: Regex as IconType,
    desc: "Test regular expressions with live highlighting, capture groups and flag toggles. No signup.",
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    short: "Diff",
    category: "Text" as ToolCategory,
    Icon: GitCompare as IconType,
    desc: "Compare two blocks of text or code and see every change highlighted line-by-line or word-by-word.",
  },
  {
    slug: "heic-to-jpg",
    name: "HEIC to JPG",
    short: "HEIC",
    category: "Image" as ToolCategory,
    Icon: Camera as IconType,
    desc: "Convert iPhone HEIC photos to JPG or PNG in your browser. Batch-convert dozens and download them as a ZIP.",
  },
  {
    slug: "pdf-merge",
    name: "PDF Merge",
    short: "Merge",
    category: "PDF" as ToolCategory,
    Icon: FilePlus2 as IconType,
    desc: "Combine many PDFs into one. Drag to reorder, no upload, no watermark — and no page limit.",
  },
  {
    slug: "pdf-split",
    name: "PDF Split",
    short: "Split",
    category: "PDF" as ToolCategory,
    Icon: Scissors as IconType,
    desc: "Split a PDF into single pages or pull out a custom range like 1-3,7. Free and fully private.",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    short: "Words",
    category: "Text" as ToolCategory,
    Icon: FileText as IconType,
    desc: "Count words, characters, sentences and reading time as you type. Perfect for essays, blogs and tweets.",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    short: "Hash",
    category: "Developer" as ToolCategory,
    Icon: Hash as IconType,
    desc: "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text or any file — and verify a download with one paste.",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    short: "UUID",
    category: "Generators" as ToolCategory,
    Icon: Fingerprint as IconType,
    desc: "Generate up to 1,000 secure v4 or time-sortable v7 UUIDs. Bulk copy, download or tweak the format.",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder & Decoder",
    short: "URL",
    category: "Developer" as ToolCategory,
    Icon: Link2 as IconType,
    desc: "Percent-encode or decode URLs in one click. Component-safe or whole-URL mode, with a one-tap round-trip.",
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    short: "Lorem",
    category: "Text" as ToolCategory,
    Icon: AlignLeft as IconType,
    desc: "Generate paragraphs, sentences or words of placeholder text. Copy as plain text or wrap as <p> HTML.",
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    short: "Epoch",
    category: "Developer" as ToolCategory,
    Icon: Clock as IconType,
    desc: "Turn Unix epoch timestamps into human dates and back. Seconds or milliseconds, your timezone or UTC.",
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    short: "Markdown",
    category: "Text" as ToolCategory,
    Icon: FileType2 as IconType,
    desc: "Write Markdown and see a live preview side-by-side. GitHub-flavored, copy as HTML, download .md or .html.",
  },
  {
    slug: "csv-json",
    name: "CSV ⇄ JSON Converter",
    short: "CSV/JSON",
    category: "Developer" as ToolCategory,
    Icon: Table2 as IconType,
    desc: "Turn CSV into JSON or JSON into CSV. Auto-detect delimiter, preview the result and download the file.",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    short: "Convert",
    category: "Color & Design" as ToolCategory,
    Icon: Palette as IconType,
    desc: "Convert any color between HEX, RGB, HSL, HSV and OKLCH. Live swatch and one-click copy for every format.",
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    short: "Slug",
    category: "Text" as ToolCategory,
    Icon: SquareSlash as IconType,
    desc: "Turn any title into a clean URL slug. Accent-safe, custom separator, batch-friendly — copy and paste in seconds.",
  },
  {
    slug: "number-base-converter",
    name: "Number Base Converter",
    short: "Base",
    category: "Converters" as ToolCategory,
    Icon: Binary as IconType,
    desc: "Convert numbers between binary, octal, decimal and hexadecimal. Big-number safe, with one-click copy.",
  },
  {
    slug: "html-entities",
    name: "HTML Entity Encoder & Decoder",
    short: "Entities",
    category: "Developer" as ToolCategory,
    Icon: Code2 as IconType,
    desc: "Escape HTML special characters or decode named, decimal and hex entities. Round-trip with one click.",
  },
  {
    slug: "text-to-pdf",
    name: "Text to PDF",
    short: "Text→PDF",
    category: "PDF" as ToolCategory,
    Icon: FileType as IconType,
    desc: "Turn plain text into a clean, paginated PDF. Pick page size, font size and margins — all in your browser.",
  },
  {
    slug: "pdf-page-numbers",
    name: "PDF Page Numbers",
    short: "Numbers",
    category: "PDF" as ToolCategory,
    Icon: ListOrdered as IconType,
    desc: "Add page numbers to any PDF. Pick a position, format and starting number — your file never leaves your device.",
  },
  {
    slug: "random-number",
    name: "Random Number Generator",
    short: "Random",
    category: "Generators" as ToolCategory,
    Icon: Dices as IconType,
    desc: "Generate secure random numbers — single value, a list, unique draws, integers or decimals. Built on browser cryptography.",
  },
  {
    slug: "color-palette",
    name: "Color Palette Generator",
    short: "Palette",
    category: "Color & Design" as ToolCategory,
    Icon: SwatchBook as IconType,
    desc: "Generate harmonious color palettes — complementary, analogous, triadic and more. Copy HEX, RGB or CSS variables instantly.",
  },
  {
    slug: "line-tools",
    name: "Line Sort & Dedupe",
    short: "Lines",
    category: "Text" as ToolCategory,
    Icon: ListFilter as IconType,
    desc: "Sort lines A→Z, remove duplicates, trim whitespace, drop blank lines and shuffle — all in one box.",
  },
  {
    slug: "text-extractor",
    name: "Text Extractor",
    short: "Extract",
    category: "Text" as ToolCategory,
    Icon: SearchIcon as IconType,
    desc: "Pull every email, URL, phone number, hashtag or number out of any block of text in one tap.",
  },
  {
    slug: "gradient-generator",
    name: "CSS Gradient Generator",
    short: "Gradient",
    category: "Color & Design" as ToolCategory,
    Icon: Paintbrush as IconType,
    desc: "Design linear, radial and conic CSS gradients with a live preview. Copy the CSS in one click.",
  },
  {
    slug: "markdown-to-pdf",
    name: "Markdown to PDF",
    short: "MD→PDF",
    category: "PDF" as ToolCategory,
    Icon: FileDown as IconType,
    desc: "Turn Markdown into a clean, paginated PDF. Headings, lists, code and quotes all rendered properly.",
  },
  {
    slug: "pdf-rotate",
    name: "Rotate PDF",
    short: "Rotate",
    category: "PDF" as ToolCategory,
    Icon: RotateCwIcon as IconType,
    desc: "Rotate every page or just a custom range of a PDF by 90°, 180° or 270°. Saved fresh, no upload.",
  },
  {
    slug: "pdf-extract-text",
    name: "PDF to Text",
    short: "PDF→Text",
    category: "PDF" as ToolCategory,
    Icon: FileSearch as IconType,
    desc: "Pull copyable text out of any PDF. Pick all pages or a range, then copy or save as a .txt file.",
  },
  {
    slug: "photo-filters",
    name: "Photo Filters",
    short: "Filters",
    category: "Image" as ToolCategory,
    Icon: Wand2 as IconType,
    desc: "Add classic and modern looks to a photo — mono, vintage, warm, punch and more — with live preview.",
  },
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    short: "Base64",
    category: "Image" as ToolCategory,
    Icon: FileCodeIcon as IconType,
    desc: "Turn an image into a Base64 data URL ready for HTML, CSS or JSON. Copy in one click.",
  },
  {
    slug: "pdf-delete-pages",
    name: "Delete PDF Pages",
    short: "Delete pages",
    category: "PDF" as ToolCategory,
    Icon: ScissorsIcon as IconType,
    desc: "Remove unwanted pages from a PDF and save a clean new file. Pick page numbers or ranges.",
  },
  {
    slug: "pdf-extract-pages",
    name: "Extract PDF Pages",
    short: "Extract pages",
    category: "PDF" as ToolCategory,
    Icon: FilePlusIcon as IconType,
    desc: "Save just the PDF pages you need into a fresh, smaller PDF. Pick any range like 1-3,7.",
  },
  {
    slug: "box-shadow",
    name: "CSS Box Shadow",
    short: "Box shadow",
    category: "Color & Design" as ToolCategory,
    Icon: Palette as IconType,
    desc: "Design CSS shadows visually with stacked layers, live preview and one-click copy.",
  },
  {
    slug: "cron-parser",
    name: "Cron Parser",
    short: "Cron",
    category: "Developer" as ToolCategory,
    Icon: Clock as IconType,
    desc: "Explain any 5-field cron expression in plain English and preview the next upcoming runs.",
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    short: "Age",
    category: "Calculators" as ToolCategory,
    Icon: Clock as IconType,
    desc: "Find exact years, months and days between any two dates — plus your next birthday.",
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    short: "BMI",
    category: "Calculators" as ToolCategory,
    Icon: Dices as IconType,
    desc: "Calculate body mass index in metric or imperial, with category and a healthy weight range.",
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    short: "Percent",
    category: "Calculators" as ToolCategory,
    Icon: Percent as IconType,
    desc: "Work out X% of a number, what percent one number is of another, and percent increase or decrease.",
  },
  {
    slug: "loan-calculator",
    name: "Loan & EMI Calculator",
    short: "Loan",
    category: "Calculators" as ToolCategory,
    Icon: Landmark as IconType,
    desc: "Estimate your monthly loan payment, total interest and full amortisation for any loan amount, rate and term.",
  },
  {
    slug: "tip-calculator",
    name: "Tip & Bill Split",
    short: "Tip",
    category: "Calculators" as ToolCategory,
    Icon: Receipt as IconType,
    desc: "Add a tip to any bill and split it evenly between any number of people in seconds.",
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    short: "Discount",
    category: "Calculators" as ToolCategory,
    Icon: Tag as IconType,
    desc: "See the final sale price and how much you save from a percentage discount, plus stacked discounts.",
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    short: "Units",
    category: "Converters" as ToolCategory,
    Icon: Scale as IconType,
    desc: "Convert length, weight, volume, area, speed, time and data between dozens of common units.",
  },
  {
    slug: "temperature-converter",
    name: "Temperature Converter",
    short: "Temp",
    category: "Converters" as ToolCategory,
    Icon: Thermometer as IconType,
    desc: "Switch any temperature between Celsius, Fahrenheit and Kelvin — accurate to the decimal.",
  },
  {
    slug: "roman-numerals",
    name: "Roman Numeral Converter",
    short: "Roman",
    category: "Converters" as ToolCategory,
    Icon: BookOpen as IconType,
    desc: "Convert numbers to Roman numerals and Roman numerals back to numbers from 1 to 3,999.",
  },
  {
    slug: "text-reverser",
    name: "Text Reverser",
    short: "Reverse",
    category: "Text" as ToolCategory,
    Icon: FlipHorizontal as IconType,
    desc: "Reverse any text by character, word or line. Emoji and accents are handled correctly.",
  },
  {
    slug: "morse-code",
    name: "Morse Code Translator",
    short: "Morse",
    category: "Converters" as ToolCategory,
    Icon: Radio as IconType,
    desc: "Translate text to Morse code and Morse back to text — letters, digits and punctuation.",
  },
  {
    slug: "binary-translator",
    name: "Binary Translator",
    short: "Binary",
    category: "Converters" as ToolCategory,
    Icon: Binary as IconType,
    desc: "Convert text to binary (UTF-8) and binary back to text — emoji-safe and instant.",
  },
  {
    slug: "email-validator",
    name: "Email Validator",
    short: "Email",
    category: "Developer" as ToolCategory,
    Icon: AtSign as IconType,
    desc: "Check one email or a whole list for valid syntax, with helpful typo suggestions for popular domains.",
  },
  {
    slug: "stopwatch-timer",
    name: "Stopwatch & Timer",
    short: "Timer",
    category: "Productivity" as ToolCategory,
    Icon: Timer as IconType,
    desc: "A precise stopwatch with lap times and a countdown timer with a soft alarm — perfect for work and study.",
  },
  {
    slug: "dice-roller",
    name: "Dice Roller",
    short: "Dice",
    category: "Generators" as ToolCategory,
    Icon: Dices as IconType,
    desc: "Roll d4, d6, d8, d10, d12, d20 or d100 with truly random results — single or in bulk.",
  },
  {
    slug: "coin-flip",
    name: "Coin Flip",
    short: "Coin",
    category: "Generators" as ToolCategory,
    Icon: Coins as IconType,
    desc: "Flip a fair coin online — one at a time or a hundred at once. Settle any tie in seconds.",
  },
  {
    slug: "list-randomizer",
    name: "List Randomizer & Picker",
    short: "Shuffle",
    category: "Generators" as ToolCategory,
    Icon: Shuffle as IconType,
    desc: "Shuffle a list or randomly pick one or many items — perfect for giveaways and fair draws.",
  },
  {
    slug: "contrast-checker",
    name: "Color Contrast Checker",
    short: "Contrast",
    category: "Color & Design" as ToolCategory,
    Icon: Contrast as IconType,
    desc: "Check WCAG AA and AAA color contrast between text and background, with a live preview.",
  },
  {
    slug: "border-radius",
    name: "CSS Border Radius",
    short: "Radius",
    category: "Color & Design" as ToolCategory,
    Icon: Square as IconType,
    desc: "Design rounded corners visually with per-corner control, live preview and a one-click CSS copy.",
  },
  {
    slug: "date-difference",
    name: "Date Difference Calculator",
    short: "Days between",
    category: "Calculators" as ToolCategory,
    Icon: CalendarDays as IconType,
    desc: "Find the exact days, weeks, months and years between two dates — or add days to jump in time.",
  },
  {
    slug: "compound-interest",
    name: "Compound Interest Calculator",
    short: "Interest",
    category: "Calculators" as ToolCategory,
    Icon: TrendingUp as IconType,
    desc: "See how your savings grow with compound interest and monthly contributions — full year-by-year breakdown.",
  },
  {
    slug: "youtube-thumbnail",
    name: "YouTube Thumbnail Downloader",
    short: "YT Thumbnail",
    category: "YouTube" as ToolCategory,
    Icon: PlayCircle as IconType,
    desc: "Grab any YouTube video thumbnail in HD, SD or default size from a link or video ID.",
  },
  {
    slug: "yt-video-id",
    name: "YouTube Video ID Extractor",
    short: "Video ID",
    category: "YouTube" as ToolCategory,
    Icon: Link2 as IconType,
    desc: "Paste any YouTube link — watch, share, Shorts or embed — and get the 11-character video ID plus clean URLs.",
  },
  {
    slug: "yt-embed-code",
    name: "YouTube Embed Code Generator",
    short: "Embed",
    category: "YouTube" as ToolCategory,
    Icon: Code2 as IconType,
    desc: "Build a responsive YouTube iframe with autoplay, mute, loop, start time, captions and privacy mode.",
  },
  {
    slug: "yt-timestamp",
    name: "YouTube Timestamp Link",
    short: "Timestamp",
    category: "YouTube" as ToolCategory,
    Icon: Clock as IconType,
    desc: "Make YouTube links that jump to a specific moment, plus a full chapters block for your description.",
  },
  {
    slug: "yt-title-counter",
    name: "YouTube Title & Description Counter",
    short: "Char counter",
    category: "YouTube" as ToolCategory,
    Icon: AlignLeft as IconType,
    desc: "Stay inside YouTube's title, description and tag limits — with a live search preview and above-the-fold cut-off.",
  },
  {
    slug: "yt-hashtag-generator",
    name: "YouTube Hashtag Generator",
    short: "Hashtags",
    category: "YouTube" as ToolCategory,
    Icon: Tags as IconType,
    desc: "Get 15 YouTube hashtags built from a smart mix of broad, mid-tail and niche tags — by topic and niche.",
  },
  {
    slug: "yt-subscribe-link",
    name: "YouTube Subscribe Link Generator",
    short: "Subscribe link",
    category: "YouTube" as ToolCategory,
    Icon: UserPlus as IconType,
    desc: "Turn any channel URL or @handle into a one-click subscribe link with a downloadable QR code.",
  },
  {
    slug: "yt-money-calculator",
    name: "YouTube Money Calculator",
    short: "Earnings estimate",
    category: "YouTube" as ToolCategory,
    Icon: Coins as IconType,
    desc: "Estimate YouTube AdSense earnings from views — by niche, CPM range and monetisable rate.",
  },
  {
    slug: "yt-comment-picker",
    name: "YouTube Comment Picker",
    short: "Giveaway winner",
    category: "YouTube" as ToolCategory,
    Icon: Shuffle as IconType,
    desc: "Pick random winners from pasted YouTube comments — with keyword filter and one-entry-per-person.",
  },
  {
    slug: "yt-chapters",
    name: "YouTube Chapter Generator",
    short: "Validate chapters",
    category: "YouTube" as ToolCategory,
    Icon: ListOrdered as IconType,
    desc: "Build YouTube chapters that actually unlock — 0:00 start, in order, 10s+ apart, ready to paste.",
  },
  {
    slug: "yt-tag-generator",
    name: "YouTube Tag Generator",
    short: "SEO tags",
    category: "YouTube" as ToolCategory,
    Icon: Tags as IconType,
    desc: "Generate YouTube SEO tags from a keyword — exact, long-tail and trending, under the 500-char limit.",
  },
  {
    slug: "yt-banner-maker",
    name: "YouTube Banner Maker",
    short: "Channel banner",
    category: "YouTube" as ToolCategory,
    Icon: ImageIcon as IconType,
    desc: "Resize any photo to a 2560×1440 YouTube channel banner with the TV-safe zone marked — so titles never get cropped.",
  },
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    short: "Mortgage",
    category: "Calculators" as ToolCategory,
    Icon: Landmark as IconType,
    desc: "Estimate your monthly mortgage payment, total interest and payoff date — with property tax, insurance and extra payments.",
  },
  {
    slug: "emoji-picker",
    name: "Emoji Picker",
    short: "Emojis",
    category: "Text" as ToolCategory,
    Icon: Smile as IconType,
    desc: "Search and copy emojis in one click — faces, hands, hearts, animals, food, flags and more.",
  },
  {
    slug: "json-minifier",
    name: "JSON Minifier",
    short: "Minify JSON",
    category: "Developer" as ToolCategory,
    Icon: Braces as IconType,
    desc: "Minify or pretty-print JSON with live validation and exact size savings — paste, fix, copy.",
  },
  {
    slug: "text-to-speech",
    name: "Text to Speech",
    short: "Read aloud",
    category: "Media" as ToolCategory,
    Icon: Volume2 as IconType,
    desc: "Listen to any text in dozens of natural voices — adjust speed and pitch and download to use anywhere.",
  },
  {
    slug: "svg-to-png",
    name: "SVG to PNG Converter",
    short: "SVG → PNG",
    category: "Image" as ToolCategory,
    Icon: FileImage as IconType,
    desc: "Turn any SVG into a crisp PNG at any size, with full transparency support.",
  },
  {
    slug: "pomodoro",
    name: "Pomodoro Timer",
    short: "Pomodoro",
    category: "Productivity" as ToolCategory,
    Icon: TimerReset as IconType,
    desc: "Stay focused with 25 minute work sprints and 5 minute breaks — gentle alarm and round tracking.",
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    short: "Meta tags",
    category: "Developer" as ToolCategory,
    Icon: Tags as IconType,
    desc: "Generate SEO, Open Graph and Twitter Card meta tags with live Google and social previews.",
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    short: "Robots.txt",
    category: "Developer" as ToolCategory,
    Icon: Bot as IconType,
    desc: "Build a clean robots.txt with custom rules, sitemap URLs and tested presets for WordPress and more.",
  },
  {
    slug: "ascii-art",
    name: "Image to ASCII Art",
    short: "ASCII",
    category: "Image" as ToolCategory,
    Icon: TypeIcon as IconType,
    desc: "Turn any photo into ASCII art — adjust width, contrast and character set. Copy text or save as PNG.",
  },
  {
    slug: "color-blindness",
    name: "Color Blindness Simulator",
    short: "Color vision",
    category: "Color & Design" as ToolCategory,
    Icon: Eye as IconType,
    desc: "See your designs through protanopia, deuteranopia, tritanopia and more — check accessibility for everyone.",
  },
  {
    slug: "screen-recorder",
    name: "Screen Recorder",
    short: "Record",
    category: "Media" as ToolCategory,
    Icon: Monitor as IconType,
    desc: "Record your screen, a window or a browser tab with optional microphone. Saves locally — no signup, no watermark.",
  },
  {
    slug: "tally-counter",
    name: "Tally Counter",
    short: "Count",
    category: "Productivity" as ToolCategory,
    Icon: PlusIcon as IconType,
    desc: "Multiple labeled counters with keyboard shortcuts and autosave. Count anything — people, reps, inventory.",
  },
  {
    slug: "speech-to-text",
    name: "Speech to Text",
    short: "Voice typing",
    category: "Media" as ToolCategory,
    Icon: Mic as IconType,
    desc: "Voice typing in your browser — supports 15+ languages, live transcript, edit and download as text.",
  },
  {
    slug: "webcam-capture",
    name: "Webcam Photo Booth",
    short: "Webcam",
    category: "Media" as ToolCategory,
    Icon: Aperture as IconType,
    desc: "Take webcam snapshots with timer, mirror and camera switch. Photos stay on your device.",
  },
  {
    slug: "audio-recorder",
    name: "Voice Recorder",
    short: "Record audio",
    category: "Media" as ToolCategory,
    Icon: Mic as IconType,
    desc: "Record voice memos with live level meter, pause and resume. Saves locally as audio files.",
  },
  {
    slug: "pig-latin",
    name: "Pig Latin Translator",
    short: "Pig Latin",
    category: "Text" as ToolCategory,
    Icon: Languages as IconType,
    desc: "Translate English to Pig Latin and back — keeps capitals and punctuation in place.",
  },
  {
    slug: "fancy-text",
    name: "Fancy Text Generator",
    short: "Fancy text",
    category: "Text" as ToolCategory,
    Icon: WandSparkles as IconType,
    desc: "Turn plain text into 15+ Unicode styles — bold, italic, bubble, small caps, upside down. One-tap copy.",
  },
  {
    slug: "wingdings",
    name: "Wingdings Translator",
    short: "Wingdings",
    category: "Text" as ToolCategory,
    Icon: Smile as IconType,
    desc: "Convert text to Wingdings-style symbols and back. Includes a full visual symbol chart.",
  },
  {
    slug: "aspect-ratio",
    name: "Aspect Ratio Calculator",
    short: "Aspect ratio",
    category: "Calculators" as ToolCategory,
    Icon: Ratio as IconType,
    desc: "Find missing width or height for any aspect ratio. Presets for 16:9, 9:16, 1:1, 4:5 and cinema.",
  },
  {
    slug: "nato-phonetic",
    name: "NATO Phonetic Alphabet",
    short: "NATO phonetic",
    category: "Converters" as ToolCategory,
    Icon: RadioIcon as IconType,
    desc: "Spell anything clearly using Alpha, Bravo, Charlie. Speak it aloud or copy to share.",
  },
  {
    slug: "chmod-calculator",
    name: "Chmod Calculator",
    short: "Chmod",
    category: "Developer" as ToolCategory,
    Icon: Terminal as IconType,
    desc: "Visual file-permission builder — tick boxes to get octal, symbolic and a ready-to-paste chmod command.",
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    short: "SQL format",
    category: "Developer" as ToolCategory,
    Icon: Database as IconType,
    desc: "Beautify SQL queries for PostgreSQL, MySQL, SQLite, T-SQL and more. Pick indent and keyword case.",
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    short: "XML format",
    category: "Developer" as ToolCategory,
    Icon: FileCode2 as IconType,
    desc: "Pretty-print or minify XML, validate structure and copy the result. Runs entirely in your browser.",
  },
  {
    slug: "gpa-calculator",
    name: "GPA Calculator",
    short: "GPA",
    category: "Calculators" as ToolCategory,
    Icon: GraduationCap as IconType,
    desc: "Calculate your GPA on a 4.0 scale. Add courses with credits and letter grades — see your average instantly.",
  },
  {
    slug: "binary-calculator",
    name: "Binary Calculator",
    short: "Binary math",
    category: "Calculators" as ToolCategory,
    Icon: Binary as IconType,
    desc: "Add, subtract, multiply or bitwise-combine binary, decimal or hex numbers. See results in all three bases.",
  },
  {
    slug: "resistor-calculator",
    name: "Resistor Color Code",
    short: "Resistor",
    category: "Calculators" as ToolCategory,
    Icon: CircuitBoard as IconType,
    desc: "Decode 4, 5 and 6-band resistor colour codes to resistance, tolerance and temperature coefficient.",
  },
  {
    slug: "fraction-calculator",
    name: "Fraction Calculator",
    short: "Fractions",
    category: "Calculators" as ToolCategory,
    Icon: Calculator as IconType,
    desc: "Add, subtract, multiply or divide fractions and mixed numbers. Simplified, mixed and decimal results in one view.",
  },
  {
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    short: "Sci calc",
    category: "Calculators" as ToolCategory,
    Icon: Calculator as IconType,
    desc: "Trig, logs, powers, roots, factorial and parentheses — with history and full keyboard support.",
  },
  {
    slug: "subnet-calculator",
    name: "Subnet Calculator",
    short: "Subnet",
    category: "Developer" as ToolCategory,
    Icon: Network as IconType,
    desc: "Calculate IPv4 subnet, mask, broadcast, host range and class from any IP and CIDR prefix.",
  },
  {
    slug: "barcode-generator",
    name: "Barcode Generator",
    short: "Barcode",
    category: "Generators" as ToolCategory,
    Icon: Barcode as IconType,
    desc: "Generate Code128, EAN-13, UPC, Code39 and more — live preview, custom colours, PNG or SVG download.",
  },
  {
    slug: "qr-reader",
    name: "QR Code Reader",
    short: "QR scan",
    category: "Image" as ToolCategory,
    Icon: ScanLine as IconType,
    desc: "Scan a QR code from an image, screenshot or your camera — decoded text and links shown instantly.",
  },
  {
    slug: "clip-path-generator",
    name: "CSS clip-path Generator",
    short: "Clip path",
    category: "Color & Design" as ToolCategory,
    Icon: Shapes as IconType,
    desc: "Design clip-path shapes — triangle, hexagon, star, arrow and more — with a live preview and one-click CSS.",
  },
  {
    slug: "user-agent-parser",
    name: "User Agent Parser",
    short: "User agent",
    category: "Developer" as ToolCategory,
    Icon: Globe as IconType,
    desc: "Paste any User-Agent to see the browser, version, engine, OS and device — perfect for bug reports.",
  },
  {
    slug: "ig-grid-splitter",
    name: "Instagram Grid Splitter",
    short: "IG grid",
    category: "Instagram" as ToolCategory,
    Icon: Grid3x3 as IconType,
    desc: "Split a photo into a perfectly aligned 3×3, 3×2 or 3×1 Instagram grid — download every tile in posting order.",
  },
  {
    slug: "ig-carousel-splitter",
    name: "Instagram Carousel Maker",
    short: "Carousel",
    category: "Instagram" as ToolCategory,
    Icon: LayoutGrid as IconType,
    desc: "Turn one wide photo into 2 to 10 seamless square or 4:5 carousel slides — ZIP download, in posting order.",
  },
  {
    slug: "ig-photo-resizer",
    name: "Instagram Photo Resizer",
    short: "IG resize",
    category: "Instagram" as ToolCategory,
    Icon: Smartphone as IconType,
    desc: "Fit any photo to Instagram post, portrait, story or reel sizes — pad with a smart color, no awkward crop.",
  },
  {
    slug: "ig-hashtag-generator",
    name: "Instagram Hashtag Generator",
    short: "Hashtags",
    category: "Instagram" as ToolCategory,
    Icon: Hash as IconType,
    desc: "Pick a topic and get a balanced mix of popular, medium and niche hashtags — copy 30 in one tap.",
  },
  {
    slug: "ig-bio-generator",
    name: "Instagram Bio Generator",
    short: "IG bio",
    category: "Instagram" as ToolCategory,
    Icon: WandSparkles as IconType,
    desc: "Build a stylish IG bio with fancy fonts, symbols and clean line breaks — preview and copy ready to paste.",
  },
  {
    slug: "ig-engagement-rate",
    name: "Engagement Rate Calculator",
    short: "Engagement",
    category: "Instagram" as ToolCategory,
    Icon: Heart as IconType,
    desc: "Work out your Instagram, TikTok or YouTube engagement rate from followers, likes, comments and saves.",
  },
  {
    slug: "ig-line-break",
    name: "Instagram Line Break Generator",
    short: "Line breaks",
    category: "Instagram" as ToolCategory,
    Icon: AlignJustify as IconType,
    desc: "Add real paragraph spacing to Instagram captions. Invisible characters keep your blank lines after posting.",
  },
  {
    slug: "ig-highlight-cover",
    name: "Story Highlight Cover Maker",
    short: "Highlight covers",
    category: "Instagram" as ToolCategory,
    Icon: ImageIcon as IconType,
    desc: "Design clean Instagram Highlight covers in any color with a built-in icon library — 1080×1920 PNG, no watermark.",
  },
  {
    slug: "ig-reels-cover",
    name: "Reels Cover Maker",
    short: "Reels cover",
    category: "Instagram" as ToolCategory,
    Icon: Clapperboard as IconType,
    desc: "Design a Reels cover that doesn't get cut on the profile grid — live safe-zone guides and bold title text.",
  },
  {
    slug: "ig-username-generator",
    name: "Instagram Username Generator",
    short: "Username",
    category: "Instagram" as ToolCategory,
    Icon: AtSign as IconType,
    desc: "Type a name and get 60+ aesthetic, niche and creative Instagram username ideas — tap to copy.",
  },
  { slug: "reading-time", name: "Reading Time Estimator", short: "Reading time", category: "Text" as ToolCategory, Icon: BookOpen as IconType, desc: "Paste any text to see how long it takes to read — slow, average and read-aloud speeds." },
  { slug: "readability-score", name: "Readability Score", short: "Readability", category: "Text" as ToolCategory, Icon: GraduationCap as IconType, desc: "Score your writing with Flesch Reading Ease and Flesch-Kincaid grade level." },
  { slug: "sort-lines", name: "Sort Lines", short: "Sort", category: "Text" as ToolCategory, Icon: ListFilter as IconType, desc: "Sort a list of lines A-Z, Z-A, by length, numerically or shuffle them — with trim and dedupe options." },
  { slug: "dedupe-lines", name: "Remove Duplicate Lines", short: "Dedupe", category: "Text" as ToolCategory, Icon: Filter as IconType, desc: "Strip duplicate lines from any list with optional case-insensitive matching and duplicate counts." },
  { slug: "strip-html", name: "Strip HTML Tags", short: "Strip HTML", category: "Text" as ToolCategory, Icon: Code2 as IconType, desc: "Convert HTML to clean plain text — keep line breaks and link URLs if you want." },
  { slug: "repeat-text", name: "Repeat Text Generator", short: "Repeat", category: "Text" as ToolCategory, Icon: Repeat as IconType, desc: "Repeat a word or phrase any number of times with your choice of separator." },
  { slug: "find-replace", name: "Find and Replace", short: "Find/Replace", category: "Text" as ToolCategory, Icon: SearchIcon as IconType, desc: "Find and replace text across long blocks — with regex, case-insensitive and whole-word options." },
  { slug: "strip-whitespace", name: "Whitespace Remover", short: "Whitespace", category: "Text" as ToolCategory, Icon: AlignLeft as IconType, desc: "Trim lines, collapse double spaces, drop blank lines and convert tabs in one click." },
  { slug: "add-line-numbers", name: "Add Line Numbers", short: "Line numbers", category: "Text" as ToolCategory, Icon: ListOrdered as IconType, desc: "Add line numbers to text or code with a custom start, step and separator." },
  { slug: "acronym-generator", name: "Acronym Generator", short: "Acronym", category: "Text" as ToolCategory, Icon: TypeIcon as IconType, desc: "Turn any phrase into a snappy acronym — first letter, two-letter, camel case and more." },
  { slug: "sleep-calculator", name: "Sleep Calculator", short: "Sleep cycles", category: "Calculators" as ToolCategory, Icon: Moon as IconType, desc: "Find the best bedtime or wake-up time using 90-minute sleep cycles." },
  { slug: "time-card-calculator", name: "Time Card Calculator", short: "Time card", category: "Calculators" as ToolCategory, Icon: Clock as IconType, desc: "Add weekly clock-in/out times, subtract breaks and get total hours, overtime and pay." },
  { slug: "date-add-subtract", name: "Date Calculator", short: "Date math", category: "Calculators" as ToolCategory, Icon: CalendarDays as IconType, desc: "Add or subtract days, weeks, months or years from any date — with business-days mode." },
  { slug: "pace-calculator", name: "Pace Calculator", short: "Pace", category: "Calculators" as ToolCategory, Icon: Timer as IconType, desc: "Calculate running pace, time and speed — with 5K, 10K, half and full marathon splits." },
  { slug: "calorie-burn", name: "Calorie Burn Calculator", short: "Calories burned", category: "Calculators" as ToolCategory, Icon: Flame as IconType, desc: "Estimate calories burned by activity using standard MET values — walking, running, cycling and more." },
  { slug: "macro-calculator", name: "Macro Calculator", short: "Macros", category: "Calculators" as ToolCategory, Icon: Apple as IconType, desc: "Get personalised daily protein, carbs and fat for your goal using Mifflin-St Jeor BMR." },
  { slug: "body-fat-calculator", name: "Body Fat Calculator", short: "Body fat %", category: "Calculators" as ToolCategory, Icon: Scale as IconType, desc: "Estimate body fat percentage with the US Navy tape-measure formula — no calipers needed." },
  { slug: "ideal-weight", name: "Ideal Weight Calculator", short: "Ideal weight", category: "Calculators" as ToolCategory, Icon: Target as IconType, desc: "Healthy weight ranges from BMI plus four classic formulas (Devine, Robinson, Miller, Hamwi)." },
  { slug: "due-date-calculator", name: "Pregnancy Due Date Calculator", short: "Due date", category: "Calculators" as ToolCategory, Icon: Baby as IconType, desc: "Find your estimated due date and current week of pregnancy from LMP or conception date." },
  { slug: "ovulation-calculator", name: "Ovulation Calculator", short: "Ovulation", category: "Calculators" as ToolCategory, Icon: CalendarHeart as IconType, desc: "Find your fertile window, likely ovulation day and the next three periods." },
  { slug: "ip-validator", name: "IP Address Validator", short: "IP check", category: "Network" as ToolCategory, Icon: Network as IconType, desc: "Check if an IPv4 or IPv6 address is valid — with class, scope and binary breakdown." },
  { slug: "cidr-range", name: "CIDR to IP Range", short: "CIDR", category: "Network" as ToolCategory, Icon: Network as IconType, desc: "Turn a CIDR block into network, broadcast, first/last host and total addresses." },
  { slug: "mac-lookup", name: "MAC Address Lookup", short: "MAC vendor", category: "Network" as ToolCategory, Icon: Wifi as IconType, desc: "Identify the manufacturer behind a MAC address from a bundled offline OUI list." },
  { slug: "dns-format", name: "DNS Record Formatter", short: "DNS format", category: "Network" as ToolCategory, Icon: Server as IconType, desc: "Format A, AAAA, CNAME, MX, TXT and SRV records into clean zone-file lines." },
  { slug: "spf-builder", name: "SPF Record Builder", short: "SPF", category: "Network" as ToolCategory, Icon: Mail as IconType, desc: "Build a valid SPF TXT record step by step with IPs, includes and a clear policy." },
  { slug: "dmarc-builder", name: "DMARC Record Builder", short: "DMARC", category: "Network" as ToolCategory, Icon: Mail as IconType, desc: "Generate a DMARC TXT record with policy, alignment and reporting addresses." },
  { slug: "dkim-keygen", name: "DKIM Key Pair Generator", short: "DKIM keys", category: "Network" as ToolCategory, Icon: KeyRound as IconType, desc: "Generate a 1024 or 2048-bit DKIM RSA key pair entirely in your browser." },
  { slug: "port-lookup", name: "Port Number Lookup", short: "Ports", category: "Network" as ToolCategory, Icon: Plug as IconType, desc: "Search common TCP and UDP port numbers and the services that use them." },
  { slug: "http-status", name: "HTTP Status Code Lookup", short: "HTTP codes", category: "Network" as ToolCategory, Icon: Globe as IconType, desc: "Plain-English reference for every HTTP status code — 200, 301, 404, 500 and more." },
  { slug: "url-parser", name: "URL Parser", short: "URL parts", category: "Network" as ToolCategory, Icon: Link2 as IconType, desc: "Break any URL into protocol, host, path, query parameters and hash." },
  { slug: "reverse-dns", name: "Reverse DNS Formatter", short: "PTR / arpa", category: "Network" as ToolCategory, Icon: Network as IconType, desc: "Convert an IPv4 or IPv6 address into its reverse DNS (.arpa) zone name." },
  { slug: "exif-batch-strip", name: "Batch EXIF Stripper", short: "EXIF batch", category: "Privacy" as ToolCategory, Icon: ShieldCheck as IconType, desc: "Remove EXIF, GPS and camera metadata from many photos at once — download as ZIP." },
  { slug: "face-blur", name: "Image Face Blur", short: "Face blur", category: "Privacy" as ToolCategory, Icon: ShieldCheck as IconType, desc: "Drag boxes over faces or sensitive areas to blur them — no upload, no AI." },
  { slug: "pdf-redact", name: "PDF Redaction Tool", short: "Redact PDF", category: "Privacy" as ToolCategory, Icon: ShieldCheck as IconType, desc: "Black-out names and account numbers in a PDF and download a flattened redacted copy." },
  { slug: "filename-sanitizer", name: "Filename Sanitizer", short: "Safe names", category: "Privacy" as ToolCategory, Icon: ShieldCheck as IconType, desc: "Clean emoji, accents and unsafe characters from file names for any operating system." },
  { slug: "email-alias", name: "Email Alias Generator", short: "Plus address", category: "Privacy" as ToolCategory, Icon: AtSign as IconType, desc: "Make Gmail-compatible plus-addresses and dot variants to track signups privately." },
  { slug: "audio-trimmer", name: "Audio Trimmer", short: "Cut audio", category: "Audio" as ToolCategory, Icon: Scissors as IconType, desc: "Cut MP3, WAV, M4A or OGG files to the exact start and end you want — saves as MP3 or WAV." },
  { slug: "audio-merger", name: "Audio Merger", short: "Join audio", category: "Audio" as ToolCategory, Icon: Combine as IconType, desc: "Join several audio clips into one continuous track, in the order you choose." },
  { slug: "audio-converter", name: "Audio Format Converter", short: "MP3 ↔ WAV", category: "Audio" as ToolCategory, Icon: Repeat as IconType, desc: "Convert between MP3, WAV, M4A and OGG with a choice of MP3 quality from 96 to 320 kbps." },
  { slug: "audio-speed", name: "Audio Speed Changer", short: "Speed", category: "Audio" as ToolCategory, Icon: FastForward as IconType, desc: "Speed up or slow down any audio from 0.25× to 4× — perfect for lessons, podcasts and effects." },
  { slug: "audio-pitch", name: "Audio Pitch Shifter", short: "Pitch", category: "Audio" as ToolCategory, Icon: Music2 as IconType, desc: "Shift pitch up or down by semitones without changing the length — great for music practice and karaoke." },
  { slug: "audio-reverser", name: "Audio Reverser", short: "Reverse", category: "Audio" as ToolCategory, Icon: Rewind as IconType, desc: "Play any clip backwards for fun effects, sound design or hidden‑message experiments." },
  { slug: "audio-normalizer", name: "Audio Volume Normalizer", short: "Normalize", category: "Audio" as ToolCategory, Icon: Gauge as IconType, desc: "Even out quiet audio by raising the loudest peak to a safe target level — without distortion." },
  { slug: "audio-crossfade", name: "Audio Crossfade", short: "Crossfade", category: "Audio" as ToolCategory, Icon: Waves as IconType, desc: "Smoothly blend the end of one clip into the start of another — a classic DJ transition." },
  { slug: "silence-remover", name: "Silence Remover", short: "Auto-cut quiet", category: "Audio" as ToolCategory, Icon: ScissorsIcon as IconType, desc: "Automatically find and remove long quiet stretches from podcasts, interviews and voice memos." },
  { slug: "tone-generator", name: "Tone Generator", short: "Pure tones", category: "Audio" as ToolCategory, Icon: Activity as IconType, desc: "Play sine, square, triangle or saw waves from 20 Hz to 20 kHz — tune instruments and test speakers." },
  { slug: "metronome", name: "Online Metronome", short: "Metronome", category: "Audio" as ToolCategory, Icon: Bell as IconType, desc: "A precise 30–300 BPM metronome with time signatures, accented beats and tempo presets." },
  { slug: "bpm-detector", name: "BPM Detector", short: "Find tempo", category: "Audio" as ToolCategory, Icon: Headphones as IconType, desc: "Drop in a song and estimate its tempo in beats per minute — useful for DJs, dancers and producers." },
  { slug: "audio-visualizer", name: "Audio Visualizer", short: "Waveform", category: "Audio" as ToolCategory, Icon: Disc3 as IconType, desc: "Live waveform and frequency display from any file or your microphone — nothing is recorded." },
  { slug: "ringtone-maker", name: "Ringtone Maker", short: "Ringtone", category: "Audio" as ToolCategory, Icon: Music as IconType, desc: "Trim any song to 30 seconds, add fade in and fade out, and save as iPhone .m4r or Android .mp3." },
  { slug: "bitcoin-address-validator", name: "Bitcoin Address Validator", short: "BTC check", category: "Crypto" as ToolCategory, Icon: Bitcoin as IconType, desc: "Check if a Bitcoin address is valid — supports legacy, SegWit and Bech32 formats. Runs offline." },
  { slug: "eth-address-checker", name: "Ethereum Address Checker", short: "ETH check", category: "Crypto" as ToolCategory, Icon: Wallet as IconType, desc: "Validate Ethereum addresses with EIP‑55 checksum so you can spot copy‑paste mistakes before sending." },
  { slug: "gas-unit-converter", name: "Gas Unit Converter", short: "Wei ↔ ETH", category: "Crypto" as ToolCategory, Icon: Fuel as IconType, desc: "Convert between Wei, Gwei and Ether with full BigInt precision — perfect for gas estimates." },
  { slug: "wallet-qr-code", name: "Wallet QR Code", short: "Wallet QR", category: "Crypto" as ToolCategory, Icon: HashIcon as IconType, desc: "Make a QR for any Bitcoin, Ethereum or Solana wallet address with an optional amount and label." },
  { slug: "solidity-function-selector", name: "Solidity Function Selector", short: "4‑byte sig", category: "Crypto" as ToolCategory, Icon: Code2 as IconType, desc: "Compute the 4‑byte function selector (keccak‑256) for any Solidity function signature." },
  { slug: "dyslexia-text-preview", name: "Dyslexia‑Friendly Preview", short: "Dyslexia font", category: "Accessibility" as ToolCategory, Icon: Glasses as IconType, desc: "Preview any text in dyslexia‑friendly fonts with adjustable spacing, line height and colour." },
  { slug: "bionic-text", name: "Bionic Reading Converter", short: "Bionic text", category: "Accessibility" as ToolCategory, Icon: BookOpenText as IconType, desc: "Bold the leading letters of each word so your eyes can scan faster — copy or download the result." },
  { slug: "font-size-tester", name: "Font Size Tester", short: "Type tester", category: "Accessibility" as ToolCategory, Icon: ALargeSmall as IconType, desc: "Preview the same paragraph at multiple font sizes side‑by‑side to pick the most readable one." },
  { slug: "color-blindness-simulator", name: "Color Blindness Simulator", short: "CB sim", category: "Accessibility" as ToolCategory, Icon: EyeIcon2 as IconType, desc: "See how your image looks to people with protanopia, deuteranopia or tritanopia. Runs on canvas, offline." },
  { slug: "world-clock", name: "World Clock & Time Zone Board", short: "World clock", category: "Travel" as ToolCategory, Icon: Globe2 as IconType, desc: "Compare current time across multiple cities at a glance — perfect for remote teams and travel planning." },
  { slug: "distance-calculator", name: "Distance Calculator", short: "Distance", category: "Travel" as ToolCategory, Icon: MapPin as IconType, desc: "Calculate great‑circle distance between two coordinates in km and miles using the Haversine formula." },
  { slug: "trip-cost-splitter", name: "Trip Cost Splitter", short: "Split bills", category: "Travel" as ToolCategory, Icon: UsersIcon as IconType, desc: "Split shared expenses fairly across your group — get a clean settle‑up list with who owes whom." },
  { slug: "invoice-generator", name: "Invoice Generator", short: "Invoice", category: "Office" as ToolCategory, Icon: Receipt as IconType, desc: "Build a clean invoice with line items, tax and notes. Print or save as PDF in one click — no signup." },
  { slug: "resume-builder", name: "Resume Builder", short: "Resume", category: "Office" as ToolCategory, Icon: FileBadge2 as IconType, desc: "Fill in a simple form and get an ATS‑friendly resume with a live preview. Print to PDF when you're ready." },
  { slug: "periodic-table", name: "Periodic Table", short: "Elements", category: "Education" as ToolCategory, Icon: Atom as IconType, desc: "All 118 elements with mass, symbol and category. Searchable and works fully offline." },
  { slug: "flash-cards", name: "Flash Cards", short: "Flashcards", category: "Education" as ToolCategory, Icon: Layers as IconType, desc: "Build a deck of cards, shuffle and study with flip and progress tracking. Saved in this browser only." },
  { slug: "multiplication-table", name: "Multiplication Table", short: "Times table", category: "Education" as ToolCategory, Icon: Grid2x2 as IconType, desc: "Generate printable multiplication tables in any range — perfect for kids and classrooms." },
  { slug: "wheel-of-names", name: "Wheel of Names", short: "Spin wheel", category: "Fun" as ToolCategory, Icon: Disc as IconType, desc: "Spin a colourful wheel to pick a random name from your list — great for classrooms and giveaways." },
  { slug: "sudoku", name: "Sudoku Generator", short: "Sudoku", category: "Fun" as ToolCategory, Icon: Puzzle as IconType, desc: "Generate fresh Sudoku puzzles at four difficulty levels. Play on screen or print to play later." },
  { slug: "mnemonic-generator", name: "Mnemonic Generator", short: "Mnemonics", category: "Fun" as ToolCategory, Icon: Brain as IconType, desc: "Turn an acronym or word list into memorable mnemonic phrases — great for study and revision." },
] as const;

export type ToolSlug = (typeof TOOLS)[number]["slug"];

export function ToolLayout({
  slug,
  children,
}: {
  slug: ToolSlug;
  children: ReactNode;
}) {
  const tool = TOOLS.find((t) => t.slug === slug)!;
  const related = TOOLS.filter((t) => t.slug !== slug).slice(0, 4);
  const Icon = tool.Icon;


  return (
    <div className="min-h-dvh sky-bg text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-24">
        {/* Breadcrumb */}
        <div className="pt-6 flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <Link to="/" className="hover:text-primary shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <span className="text-foreground truncate">{tool.name}</span>
        </div>

        {/* Hero */}
        <section className="pt-6 sm:pt-8 pb-8 sm:pb-10 animate-[fade-in_.4s_ease-out_both]">
          <span className="eyebrow inline-flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-primary" />
            {tool.short}
          </span>
          <div className="mt-4 flex flex-col gap-4 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-5">
            <span
              aria-hidden
              className="grid place-items-center size-14 sm:size-16 shrink-0 rounded-2xl bg-primary text-primary-foreground shadow-soft"
            >
              <Icon className="size-7 sm:size-8" />
            </span>
            <h1 className="font-display min-w-0 text-[1.75rem] sm:text-5xl md:text-6xl leading-[1.1] tracking-tight text-balance break-words">
              {tool.name}
            </h1>
          </div>
          <p className="mt-4 sm:mt-5 max-w-2xl text-[15px] sm:text-lg text-muted-foreground leading-relaxed">
            {tool.desc}
          </p>

          {/* Trust chips */}
          <ul className="mt-5 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Chip icon={<ShieldCheck className="size-3.5 sm:size-4" />}>Runs in your browser</Chip>
            <Chip icon={<CloudOff className="size-3.5 sm:size-4" />}>No uploads</Chip>
            <Chip icon={<HardDrive className="size-3.5 sm:size-4" />}>Up to 20 MB</Chip>
            <Chip icon={<Gift className="size-3.5 sm:size-4" />}>Free, forever</Chip>
          </ul>
        </section>

        {/* Tool body */}
        <section className="animate-[rise_.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          {children}
        </section>

        {/* Rate this tool */}
        <ToolRating slug={slug} name={tool.name} />

        {/* SEO: How-to, Why, FAQ + JSON-LD (auto-injected per slug) */}
        <ToolSEOBlock slug={slug} />

        {/* Cross-category footer link */}
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight min-w-0">Try another tool</h2>
            <Link to="/" className="shrink-0 text-sm font-medium text-primary hover:underline underline-offset-4 inline-flex items-center gap-1">
              See all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => {
              const RIcon = t.Icon;
              return (
                <Link
                  key={t.slug}
                  to={`/${t.slug}` as string}
                  className="soft-card hover-lift p-5 group block"
                >
                  <span aria-hidden className="grid place-items-center size-11 rounded-xl bg-primary-soft text-primary">
                    <RIcon className="size-5" />
                  </span>
                  <div className="mt-4 font-display text-lg tracking-tight group-hover:text-primary">
                    {t.name}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-card text-foreground px-2.5 sm:px-3 py-1.5 border border-border shadow-soft/30">
      <span aria-hidden className="text-primary">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  // Close the desktop "Categories" popover on outside click or Escape.
  useEffect(() => {
    if (!catsOpen) return;
    function onClick(e: MouseEvent) {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setCatsOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setCatsOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [catsOpen]);

  // Lock body scroll when the mobile sheet is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link to="/" aria-label="Bluebird — home" className="flex min-w-0 items-center gap-2.5 group mr-auto">
            <BluebirdMark className="size-9 shrink-0 transition-transform group-hover:scale-105 motion-reduce:transform-none" />
            <span className="font-display text-xl tracking-tight truncate">Bluebird</span>
            
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm shrink-0">
            <div ref={catsRef} className="relative">
              <button
                type="button"
                onClick={() => setCatsOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={catsOpen}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground hover:bg-primary-soft min-h-10 font-medium"
              >
                Categories <ChevronDown className={`size-4 transition-transform ${catsOpen ? "rotate-180" : ""}`} />
              </button>
              {catsOpen && (
                <div role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] w-[28rem] rounded-2xl border border-border bg-popover shadow-lift p-3 grid grid-cols-2 gap-1 animate-[pop_.18s_ease-out_both]">
                  {CATEGORIES.map((c) => {
                    const count = TOOLS.filter((t) => t.category === c.id).length;
                    return (
                      <Link
                        key={c.id}
                        to="/category/$slug"
                        params={{ slug: categorySlug(c.id) }}
                        onClick={() => setCatsOpen(false)}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-soft group"
                      >
                        <span className="font-medium text-sm truncate">{c.label}</span>
                        <span className="text-xs num text-muted-foreground group-hover:text-primary">{count}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <Link to="/" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-soft min-h-10 inline-flex items-center font-medium">
              All tools
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center size-11 rounded-xl border border-border bg-card hover:border-primary/40"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-background border-l border-border shadow-lift flex flex-col animate-[pop_.2s_ease-out_both]">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <div className="flex items-center gap-2.5">
                <BluebirdMark className="size-8" />
                <span className="font-display text-lg">Bluebird</span>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"
                className="size-11 grid place-items-center rounded-xl border border-border hover:border-primary/40">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-auto p-4">
              <Link to="/" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold min-h-12 mb-3">
                <span>All categories</span>
                <span className="text-xs opacity-90 num">{CATEGORIES.length}</span>
              </Link>
              <div className="eyebrow px-2 mb-2">Categories</div>
              <ul className="grid gap-1">
                {CATEGORIES.map((c) => {
                  const count = TOOLS.filter((t) => t.category === c.id).length;
                  return (
                    <li key={c.id}>
                      <Link
                        to="/category/$slug"
                        params={{ slug: categorySlug(c.id) }}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-transparent hover:bg-primary-soft min-h-12"
                      >
                        <span className="font-medium">{c.label}</span>
                        <span className="text-xs num text-muted-foreground">{count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="p-4 border-t border-border text-xs text-muted-foreground">
              Everything runs in your browser. Nothing uploads.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  const total = TOOLS.length;
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
        {/* Top row: brand + categories grid */}
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand block */}
          <div className="md:col-span-4 lg:col-span-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <BluebirdMark className="size-9 shrink-0" />
              <span className="font-display text-xl">Bluebird</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Friendly tools that run on your device. Nothing ever uploads.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:shadow-lift hover:-translate-y-0.5 transition-transform motion-reduce:transform-none"
            >
              Browse all {total} tools →
            </Link>
          </div>

          {/* Categories — multi-column, always balanced */}
          <div className="md:col-span-8 lg:col-span-9">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div className="eyebrow">Browse by category</div>
              <div className="text-xs text-muted-foreground num">
                {CATEGORIES.length} categories · {total} tools
              </div>
            </div>
            <ul
              className="grid gap-x-6 gap-y-1 text-sm grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              style={{ columnGap: "1.25rem" }}
            >
              {CATEGORIES.map((c) => {
                const count = TOOLS.filter((t) => t.category === c.id).length;
                return (
                  <li key={c.id} className="min-w-0">
                    <Link
                      to="/category/$slug"
                      params={{ slug: categorySlug(c.id) }}
                      className="group flex items-center justify-between gap-2 rounded-lg px-2 -mx-2 py-1.5 text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors"
                    >
                      <span className="truncate">{c.label}</span>
                      <span className="shrink-0 text-[11px] num text-muted-foreground/70 group-hover:text-primary">
                        {count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
          <p className="max-w-xl">
            No account. No email. No ads. Built for everyone — kids to grandparents.
          </p>
          <p className="num sm:text-right">© {new Date().getFullYear()} Bluebird</p>
        </div>
      </div>
    </footer>
  );
}


const MAX_BYTES = 20 * 1024 * 1024;

export function validateImageFile(
  file: File | null,
  opts: { jpegOnly?: boolean } = {},
): string | null {
  if (!file) return "Please choose an image to begin.";
  if (file.size === 0) return "This file is empty (0 bytes). Try another one.";
  if (file.size > MAX_BYTES) return "That image is bigger than 20 MB. Please pick a smaller one.";
  if (!file.type.startsWith("image/")) return "That doesn't look like an image file.";
  if (opts.jpegOnly && !["image/jpeg", "image/jpg"].includes(file.type)) {
    return "This tool only works with JPG / JPEG photos.";
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
