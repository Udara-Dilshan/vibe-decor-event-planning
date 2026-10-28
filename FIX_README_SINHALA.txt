VIBE DECOR — EVENTS ONLY FIX (සිංහල උපදෙස්)
============================================

මෙම project එක ඔබ upload කළ GitHub ZIP එකෙන් සකස් කළේය. Services, Packages, About, Contact, Hero, footer, nav සහ වෙනත් sections පවතින design/data එකෙන්ම තබා ඇත.

මූලික fixes:
- Homepage Portfolio එක hardcoded events.ts එකෙන් events කියවයි.
- /portfolio page එක hardcoded events.ts එකෙන් events කියවයි.
- Event detail pages hardcoded events වල slug එකෙන් event එක සොයයි.
- Category filter එකේ Other ඇතුළත් කර ඇත.
- event photos නොමැති විට broken image icon වෙනුවට placeholder පෙන්වයි.
- Services section එකේ default service images service1.webp සිට service6.webp දක්වා තබා ඇත; event image paths Services cards සඳහා භාවිතා නොකරයි.
- Services, Packages, Service Areas, Site Settings සඳහා තිබූ CMS loading logic-ийг වෙනස් කර නැත, events loading එක පමණක් hardcoded කර ඇත.

වැදගත්: ඔබ ලබාදුන් GitHub ZIP එකේ event photo files තිබුණේ නැත. src/data/events.ts තුළ මේ වගේ path references තිබුණත් public/ folder එකේ ඒ files නොමැත:
wc25.png.jpeg, b2b.jpeg, cr.jpeg, re.jpeg, crp.jpeg, cp.jpeg, 24.jpeg, cp2.jpeg, cp3.jpeg, ss.jpeg, ss1.jpeg, d1.jpeg, d2.jpeg, d3.jpeg, a1.jpeg, a2.jpeg, a3.jpeg, b1.jpeg, b2.jpeg, b3.jpeg

ඒ නිසා real event photos පෙන්වීමට ඔයාගේ original event photo files public/ folder එකට copy කරන්න. උදාහරණයක්:
public/wc25.png.jpeg
public/b2b.jpeg

Photo files service1.webp, service2.webp වැනි service filenames වලින් save/overwrite නොකරන්න. ඒ files Services section එකට අයත්ය.

Run locally:
  npm install
  npm run dev

GitHub:
  git status
  git add .
  git commit -m "Fix event portfolio without changing service images"
  git push

Note: Full production build was not verified in this environment because the copied node_modules lacked the platform-specific Rollup optional dependency. TypeScript check passed. Run `npm install` on Windows before deploying.
