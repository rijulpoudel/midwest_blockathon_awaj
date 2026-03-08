# AAWAJ – GitHub Copilot Prompts for React Implementation

Use these prompts **in order** inside GitHub Copilot Chat (`Ctrl+I` or the Chat panel).
Each prompt builds on the previous one. Copy-paste them exactly.

---

## 0. Project Setup

```
Create a new React project structure for a civic reporting app called AAWAJ.
Set up the following:
- React with Vite
- React Router DOM for page navigation
- TailwindCSS for styling
- Three routes: "/" (HomePage), "/submit" (SubmitReportPage), "/track" (TrackReportPage)
- A shared Layout component that wraps all pages with the Navbar
Show me the full file structure and the contents of main.jsx, App.jsx, and the Layout component.
```

---

## 1. Global Styles & Theme

```
Set up global CSS variables and Tailwind config for the AAWAJ app with this exact theme:

Colors:
- Background: deep navy #0a0e1a and #0d1526
- Card backgrounds: rgba(10, 14, 26, 0.6) with backdrop blur
- Primary text: white #ffffff
- Secondary text: #a0aec0
- Accent: #3b82f6 (blue)
- Border: rgba(255,255,255,0.1)

Typography:
- Display font: 'Bebas Neue' from Google Fonts (for large headings)
- Body font: 'DM Sans' from Google Fonts

Add the Google Fonts import to index.html and extend tailwind.config.js with these custom fonts and colors.
Also add a global body style with the deep navy background color.
```

---

## 2. Navbar Component

```
Create a React Navbar component at src/components/Navbar.jsx with these exact specs:

- Dark/transparent background, sticky at top, full width
- Left: Bold "AAWAJ" logo text in white using Bebas Neue font, large size
- Center: Three nav links — HOME | SUBMIT REPORT | TRACK REPORT — uppercase, spaced, white, light weight
- Right: A search icon (use lucide-react SearchIcon)
- Active link should be slightly brighter/bold compared to inactive links
- Use React Router's <NavLink> for all links
- On mobile (below md breakpoint): hide center links, show a hamburger menu icon instead
- The hamburger toggles a dropdown menu with the three links stacked vertically

Use Tailwind for all styling. No separate CSS file.
```

---

## 3. Homepage – Hero Section

```
Create the hero section for src/pages/HomePage.jsx with these specs:

- Full viewport height (100vh)
- Background: Use this Unsplash Himalayan mountain image as a CSS background-image:
  https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600
  Set background-size: cover, background-position: center
- Dark gradient overlay on top of the image (from rgba(10,14,26,0.3) to rgba(10,14,26,0.7))
- Centered content vertically and horizontally
- Giant "AAWAJ" heading text — Bebas Neue font, ~15vw size, white, letter-spacing wide
- Below the heading: a pill-shaped CTA button "Find your AAWAJ"
  Style: white background, black text, rounded-full, px-8 py-3, font medium
  Add a hover effect: slight scale-up and shadow

The component should export as default and be used inside HomePage.
```

---

## 4. Homepage – Feature Strip

```
Add a feature strip section below the hero in HomePage.jsx with these specs:

Three glassmorphism cards in a row (stack vertically on mobile):
- Card style: background rgba(10,14,26,0.6), backdrop-filter blur(12px), border 1px solid rgba(255,255,255,0.1), rounded-2xl, padding p-6

Card 1:
- Small icon: a lightning bolt or permanent record icon (use lucide-react)
- Title: "Your voice, permanent and loud."
- Body: "The people's record permanent, tamper-proof, forever. When officials deny, when reports disappear, when voices go unheard Awaj writes it all to blockchain. Permanently."

Card 2:
- Small icon: a megaphone or speaker icon
- Title: "Speak. Report. Be seen."
- Body: "Every complaint deserves a witness. Corruption thrives in silence. Awaj makes every civic report public, verified, and impossible to erase — powered by your community and the blockchain."

Card 3:
- Small icon: an ear or radio tower icon
- Title: "Because someone has to listen."
- Body: "Built for the districts nobody listens to. From Humla to Kathmandu, every citizen deserves to be heard. Submit your report, get it confirmed by your community, and watch it live on-chain."

Title text white, body text #a0aec0, icon color #3b82f6.
```

---

## 5. Homepage – Stats Bar

```
Add a stats bar section in HomePage.jsx with these specs:

- Full-width dark rounded card: bg rgba(15,20,40,0.8), rounded-2xl, backdrop blur, border rgba(255,255,255,0.08)
- Three stats in a row with vertical dividers between them
- Each stat has: an icon (lucide-react), a large bold white number, and a small gray label below

Stat 1: FileText icon — "10" — "Total Reports"
Stat 2: CheckCircle icon — "5" — "Received"
Stat 3: MapPin icon — "5+" — "Active Wards"

Use flex with justify-around. Dividers: 1px solid rgba(255,255,255,0.1), height 40px, self-center.
Numbers: text-3xl font-bold white. Labels: text-sm text-gray-400.
```

---

## 6. Homepage – Recent Reports Section

```
Add a "Recent Reports" section in HomePage.jsx with these specs:

- Small section label "Recent Reports" in gray uppercase tracking-widest, mb-4
- Two report cards stacked vertically, each with:
  Left side: a square image (200x200px, rounded-xl, object-cover)
  Right side:
    - Location tag with a blue checkmark icon (CheckCircle from lucide-react, size 14): "Mumbai, India" in small gray text
    - Bold white title: "Food Shortage" in text-xl font-bold
    - Description text in gray: "Landslide has blocked the only road into Dolpa. Villages have not received food supply in 10 days."
  Card style: glassmorphism — bg rgba(10,14,26,0.6), backdrop blur, border rgba(255,255,255,0.1), rounded-2xl, p-4, flex row, gap-4

Use these placeholder image URLs:
Card 1: https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400
Card 2: https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400
```

---

## 7. Homepage – Current News Section

```
Add a "Current News" section at the bottom of HomePage.jsx with these specs:

- Centered pill label button: "Current News" — white bg, black text, rounded-full, px-6 py-2, not clickable (just decorative), mb-8
- Two news cards in a row (stack on mobile) using CSS grid grid-cols-1 md:grid-cols-2

Each news card:
- Rounded corners rounded-2xl, overflow-hidden, glassmorphism bg
- Top half: a grayscale black-and-white photo, full width, h-48, object-cover, filter grayscale(100%)
- Bottom half: dark overlay section with padding p-4
  - Small gray text: location + date — "Kathmandu, Nepal · Mar 7, 2026"
  - Bold white title (2 lines): "Rapper-politician Balendra Shah on course to be Nepal's next prime minister"
  - "Read Full Post ↗" in blue text, text-sm, mt-2, cursor-pointer

Use this placeholder image for both cards:
https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600
```

---

## 8. Submit Report Page – Layout & Photo Upload

```
Create src/pages/SubmitReportPage.jsx with these specs:

- Same Himalayan mountain background as the homepage hero
  URL: https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600
  Full screen background with dark overlay
- Page title "SUBMIT YOUR REPORT" centered at top — Bebas Neue font, text-4xl, white, letter-spacing widest, mt-16 mb-8

Main upload card (centered, max-w-3xl, mx-auto):
- Glassmorphism: bg rgba(200,210,230,0.25), backdrop-filter blur(20px), rounded-3xl, border rgba(255,255,255,0.2)
- Height ~350px, flex column items-center justify-center, gap-4
- Camera icon (lucide-react Camera, size 64, color black)
- Text "click or drag or drop a photo" — text-2xl font-bold text-black
- Subtext "Will only Accept image files" — text-sm text-gray-600
- The card is a drag-and-drop zone:
  - Add onDragOver, onDrop handlers
  - Add onClick to trigger a hidden <input type="file" accept="image/*">
  - When an image is dropped or selected, show a preview inside the card (replace the icon and text with the image, object-fit cover, rounded-3xl)

Below the card: centered pill button "Submit Your Report" — white bg, black text, rounded-full, px-10 py-3, text-lg, mt-8
Add hover: bg-gray-100, subtle shadow.

Use useState to manage: dragActive (boolean), previewUrl (string|null).
```

---

## 9. Submit Report Page – Extended Form Fields

```
After the photo upload card in SubmitReportPage.jsx, add a form section with these fields.
Reveal the form only after a photo has been uploaded (previewUrl !== null).

Add a smooth fade-in animation when the form appears (use a CSS transition or Tailwind animate-fade-in).

Form fields (all glassmorphism style: bg rgba(255,255,255,0.05), border rgba(255,255,255,0.15), rounded-xl, text-white, px-4 py-3):

1. Text input: placeholder "Report Title" — full width
2. Textarea: placeholder "Describe the issue in detail..." — full width, h-32, resize-none
3. Two inputs side by side:
   - "District / Ward" text input
   - "Category" select dropdown with options: Infrastructure, Food & Water, Corruption, Health, Education, Other
4. Text input: placeholder "Your Name (optional)"

All labels in small gray text above each field.
Submit button at the bottom: full width, bg-blue-600 hover:bg-blue-700, text-white, rounded-xl, py-3, font-semibold.

Use useState to manage formData object with all field values.
On submit, console.log the formData and show a success toast/message.
```

---

## 10. Track Report Page

```
Create src/pages/TrackReportPage.jsx with these specs:

Same mountain background image as Submit page.

Page title "TRACK YOUR REPORT" centered, Bebas Neue, text-4xl, letter-spacing widest, white, mt-16 mb-8.

Search card (centered, max-w-xl, glassmorphism — same style as submit page card, p-8):
- Label: "Enter your Report ID" in small gray text
- Text input: full width, glassmorphism style, placeholder "e.g. RPT-00123"
- Blue button below: "Track Report" — bg-blue-600, rounded-xl, full width, py-3, text-white

Below the search card, a "Sample Reports" section with 3 mock report status cards:
Each card: glassmorphism, rounded-2xl, p-4, flex between title and status badge

Card data:
1. "Food Shortage – Dolpa" | Status: "Received" (yellow badge)
2. "Road Damage – Humla" | Status: "Under Review" (blue badge)  
3. "Water Supply Failure – Mustang" | Status: "Resolved" (green badge)

Badge styles: rounded-full px-3 py-1 text-xs font-semibold
- Received: bg-yellow-500/20 text-yellow-300
- Under Review: bg-blue-500/20 text-blue-300
- Resolved: bg-green-500/20 text-green-300
```

---

## 11. Responsive & Polish Pass

```
Review all components and make the following improvements:

1. Ensure all pages are fully responsive:
   - Navbar collapses to hamburger on mobile
   - Feature strip cards stack vertically on mobile (flex-col on sm, flex-row on md+)
   - News cards go from 2 columns to 1 column on mobile
   - Report cards stack vertically on mobile

2. Add subtle scroll fade-in animation to each section using Intersection Observer:
   Create a custom hook useInView(ref) that returns true when element enters viewport.
   Apply "opacity-0 translate-y-6 transition-all duration-700" initially, 
   and "opacity-100 translate-y-0" when in view.

3. Add a smooth scroll behavior to html element in index.css.

4. Add a footer at the bottom of the Layout:
   - Dark bg, centered text
   - "© 2026 AAWAJ. Your voice, on-chain."
   - Small links: About | GitHub | Contact

5. Make sure the background image on Hero extends behind the Navbar (use -mt-16 or z-index trick).
```

---

## Tips for Using These Prompts

- Run prompts **one at a time** — don't combine them
- After each prompt, review the output and fix anything before moving on
- If Copilot misses something, follow up with: *"The card is missing the backdrop blur effect, add `backdrop-filter: blur(12px)` to it"*
- Use **Copilot Edits** (`Ctrl+Shift+I`) to apply changes directly to open files
- If a component gets too long, ask Copilot to split it: *"Extract the stats bar into its own component at src/components/StatsBar.jsx"*

---

## Recommended File Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Layout.jsx
│   ├── StatsBar.jsx
│   ├── ReportCard.jsx
│   └── NewsCard.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── SubmitReportPage.jsx
│   └── TrackReportPage.jsx
├── hooks/
│   └── useInView.js
├── App.jsx
└── main.jsx
```
