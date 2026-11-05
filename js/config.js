/* ===== YOUTUBE CONFIG — edit here =====
   CHANNEL_URL: your channel link (e.g. https://www.youtube.com/@ancienttalk)
   VIDEOS: add {id:"YouTubeVideoID", title:"..."}; empty entries show "Coming soon". */
const CHANNEL_URL = "https://www.youtube.com/@ancienttalksoffical"; // channel ID: UCXFpcacfsztR8JeoO1ozRRA
// No public videos as of Nov 3, 2026; add real IDs below when uploads go live.
/* ===== LISTEN ALONG: one place for every YouTube reading =====
   HOW TO ADD A VIDEO: upload the reading, copy the ID from its link
   (https://www.youtube.com/watch?v=THIS_PART or https://youtu.be/THIS_PART)
   and paste it as `id` on the matching line below. Keys are:
     - a book slug (the file name in books/ without .html, e.g. "chesterton-orthodoxy";
       multi-part books use the base slug, so one video covers every part), or
     - a Shorts id (the #anchor on shorts.html, e.g. "merciful-heart").
   That video then appears as a "Listen along" player on that book page, Shorts card,
   any Daily passage from it, and on watch.html. Entries with id "" show
   "Readings coming to YouTube" instead. You can add new lines for any book or Short. */
const READINGS = {
  "chesterton-orthodoxy":          { id: "", title: "G.K. Chesterton — Orthodoxy" },
  "merciful-heart":                { id: "", title: "St Isaac the Syrian — What Is a Merciful Heart?" },
  "athanasius-on-the-incarnation": { id: "", title: "St Athanasius — On the Incarnation" },
  "augustine-confessions":         { id: "", title: "St Augustine — Confessions" },
  "imitation-of-christ":           { id: "", title: "Thomas à Kempis — The Imitation of Christ" },
  "didache":                       { id: "", title: "The Didache" }
};
const VIDEOS = Object.keys(READINGS).map(k => ({ key: k, id: READINGS[k].id, title: READINGS[k].title })); // used by watch.html

/* ===== NEWSLETTER (Kit, free up to 10,000 subscribers) =====
   Paste the numeric Form ID from your Kit form's HTML embed code, e.g. "1234567"
   (from <form action="https://app.kit.com/forms/1234567/subscriptions" ...>).
   While empty, the site shows "Newsletter coming soon" and no form is shown. */
const KIT_FORM_ID = "";

/* ===== SUPPORT & CONTACT =====
   SUPPORT_URL: your donation page, e.g. "https://ko-fi.com/ancienttalk". While empty the
   Support page shows "Donations coming soon" and no button.
   CONTACT_EMAIL: e.g. "hello@yourdomain.com". While empty no email link is shown. */
const SUPPORT_URL = "https://ko-fi.com/ancienttalks";
const CONTACT_EMAIL = "Ancienttalksoffical@gmail.com";

/* ===== SEARCH ENGINES =====
   Verification codes from Google Search Console / Bing Webmaster Tools (the "content" value
   of their HTML-tag method). NOTE: search engines read these only from static HTML, so ALSO paste
   them into the marked "SEARCH ENGINE VERIFICATION" comment in the <head> of index.html.
   (Easiest for Google: verify the Domain with a DNS TXT record at Porkbun instead.) */
const GOOGLE_SITE_VERIFICATION = "";
const BING_SITE_VERIFICATION = "";

/* ===== VISITOR STATS (GoatCounter: free, no cookies, no banner needed) =====
   Sign up at https://www.goatcounter.com/signup and pick a code, e.g. "ancienttalks"
   (your dashboard is then https://ancienttalks.goatcounter.com). Paste just the code here.
   While empty, no stats script is loaded. */
const GOATCOUNTER_CODE = "";
