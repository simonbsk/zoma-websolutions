/*
 * Copy and sample content for the public site.
 *
 * ⚠️ PLACEHOLDER CONTENT — prices, team roles, the case study and the three concept websites
 * were invented for the test build. Replace them with real, approved material before launch:
 * invented case studies or results mislead visitors and, in the EU, breach consumer-protection
 * law (UWG / UCPD). The concept websites are labelled as concepts on the page and may stay.
 */

// ---------------------------------------------------------------------------
// Hero headline experiment
// ---------------------------------------------------------------------------

export const HEADLINE_EXPERIMENT = 'hero-headline-v2';
export const HEADLINE_VARIANTS = ['shape', 'choices', 'drop'] as const;
export type HeadlineVariant = (typeof HEADLINE_VARIANTS)[number];

/** `accent` is set in a quieter tone and ends in an ink drop instead of a full stop. */
export const HEADLINES: Record<HeadlineVariant, { lead: string; accent: string }> = {
  shape: { lead: 'Websites that take the shape', accent: 'of your business' },
  choices: { lead: 'Your website, your choices.', accent: 'Our craft' },
  drop: { lead: 'Every great website starts', accent: 'with a single drop' },
};

// ---------------------------------------------------------------------------
// Options shared by the homepage and the start form
// ---------------------------------------------------------------------------

export const SERVICE_OPTIONS = [
  { id: 'new-website', label: 'New website' },
  { id: 'relaunch', label: 'Website relaunch' },
  { id: 'fixes', label: 'Fixes & improvements' },
  { id: 'shop', label: 'Online shop or booking system' },
  { id: 'care', label: 'Care & hosting plan' },
  { id: 'other', label: 'Something else / not sure yet' },
] as const;
export type ServiceOption = (typeof SERVICE_OPTIONS)[number]['id'];

export const BUDGET_OPTIONS = [
  { id: '800-1200', label: '€800 – €1,200' },
  { id: '1200-2000', label: '€1,200 – €2,000' },
  { id: '2000-3000', label: '€2,000 – €3,000' },
  { id: '3000-4000', label: '€3,000 – €4,000' },
  { id: 'flexible', label: 'No fixed budget yet' },
] as const;
export type BudgetOption = (typeof BUDGET_OPTIONS)[number]['id'];

export const REPLY_CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone call' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'video', label: 'Video call' },
] as const;
export type ReplyChannel = (typeof REPLY_CHANNELS)[number]['id'];

/** Working days until we promise an answer. */
export const REPLY_DAYS = 3;

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export interface ServiceItem {
  id: ServiceOption;
  title: string;
  text: string;
  price: string;
  time: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'new-website',
    title: 'New website',
    text: 'From a blank page to launch: structure, design, words and a fast, hand-built site.',
    price: 'from €890',
    time: '3–6 weeks',
  },
  {
    id: 'relaunch',
    title: 'Relaunch',
    text: 'Keep what works, rebuild what doesn’t — with your Google rankings carried over.',
    price: 'from €1,490',
    time: '4–8 weeks',
  },
  {
    id: 'fixes',
    title: 'Fixes & upgrades',
    text: 'Slow, broken or dated? We repair, speed up and modernise the site you already have.',
    price: 'quoted per task',
    time: 'from 2 days',
  },
  {
    id: 'shop',
    title: 'Shops & bookings',
    text: 'Sell products or take bookings online, connected to the tools you already use.',
    price: 'from €2,490',
    time: '6–10 weeks',
  },
];

// ---------------------------------------------------------------------------
// How it works: the choices a client makes
// ---------------------------------------------------------------------------

export const FEATURE_OPTIONS = [
  'Online booking',
  'Online shop',
  'Blog or news',
  'Two languages',
  'Newsletter sign-up',
  'Members area',
] as const;

export const DIRECTIONS = [
  { id: 'a', name: 'Editorial', note: 'Big type, lots of air' },
  { id: 'b', name: 'Bold', note: 'Colour and contrast' },
  { id: 'c', name: 'Warm', note: 'Soft, photo-led' },
] as const;

// ---------------------------------------------------------------------------
// Showcase: three concept websites, one per ink colour
// ---------------------------------------------------------------------------

export const POSSIBILITIES = [
  'Online shops',
  'Booking & reservations',
  'Members areas',
  'Multilingual sites',
  'Product configurators',
  'Payment & calendar integrations',
  'Content you edit yourself',
  'Animations like this one',
];

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export interface PricingTier {
  id: 'start' | 'business' | 'signature';
  name: string;
  audience: string;
  from: string;
  timeline: string;
  budget: BudgetOption;
  service: ServiceOption;
  featured?: boolean;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'start',
    name: 'Start',
    audience: 'For a strong one-page presence',
    from: '890',
    timeline: 'Live in about 3 weeks',
    budget: '800-1200',
    service: 'new-website',
    features: [
      'Single-page website',
      'Three design directions to choose from',
      'Looks right on every screen',
      'Contact form with spam protection',
      'Search basics: titles, sitemap, speed',
      'Two feedback rounds',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    audience: 'For growing businesses',
    from: '1,990',
    timeline: 'Live in about 5 weeks',
    budget: '2000-3000',
    service: 'new-website',
    featured: true,
    features: [
      'Everything in Start',
      'Up to 8 pages',
      'Edit texts and images yourself',
      'Scroll animations & interactions',
      'SEO and privacy-friendly analytics',
      'Booking or enquiry forms',
    ],
  },
  {
    id: 'signature',
    name: 'Signature',
    audience: 'For shops and custom features',
    from: '3,490',
    timeline: 'Live in 8+ weeks',
    budget: '3000-4000',
    service: 'shop',
    features: [
      'Everything in Business',
      'As many pages as you need',
      'Online shop or web app',
      'Multilingual, e.g. German & English',
      'Payments, calendars, CRM connected',
      'Priority support for 3 months',
    ],
  },
];

export const CARE_PLAN = {
  name: 'Care & Hosting',
  price: '49',
  intro:
    'One monthly subscription keeps your website fast, safe and current — so you never have to think about servers, updates or broken plugins again.',
  features: [
    'Fast, secure hosting with SSL',
    'Updates, backups & uptime monitoring',
    '30 minutes of content changes every month',
    'Priority support by email or WhatsApp',
    'A short monthly report: speed, visits, issues',
    'Cancel any month — no minimum term',
  ],
  terms: 'First month free after launch',
};

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'What does a website cost?',
    a: 'Most of our projects land between €890 and €4,000, depending on pages and features. After a free first conversation you get a fixed-price offer — and that is the price you pay. If you want something extra later, you decide first.',
  },
  {
    q: 'How long until my website is live?',
    a: 'A one-page site is usually online in about three weeks, a business site in five to six, shops and web apps in eight or more. Your offer includes a timeline with dates, and you can follow every step on a private preview link.',
  },
  {
    q: 'Who writes the texts and takes the photos?',
    a: 'You know your business best, so we start from your notes — even rough bullet points — and shape them into clear website copy. Need photos? We work with local photographers or design illustrations and graphics instead.',
  },
  {
    q: 'Do I own my website?',
    a: 'Completely. Domain, code, content and every account are in your name from day one. Stay with our care plan or take everything to another provider — there is no lock-in and no exit fee.',
  },
  {
    q: 'What happens after the launch?',
    a: 'You get 30 days of free fixes. After that, the optional Care & Hosting plan (€49 a month) covers hosting, updates, backups and small changes. Bigger additions are quoted separately, at a fixed price as always.',
  },
];

// ---------------------------------------------------------------------------
// Team (roles are placeholders — confirm them with each person)
// ---------------------------------------------------------------------------

export type Silhouette = 'quiff' | 'crop' | 'curls' | 'beard';
export type Accent = 'iris' | 'saffron' | 'verdant' | 'ink';

export interface TeamMember {
  name: string;
  role: string;
  accent: Accent;
  silhouette: Silhouette;
}

export const TEAM: TeamMember[] = [
  { name: 'Jakob', role: 'Design & UX', accent: 'iris', silhouette: 'quiff' },
  { name: 'Anton', role: 'Development', accent: 'saffron', silhouette: 'crop' },
  { name: 'Simon', role: 'Projects & strategy', accent: 'verdant', silhouette: 'curls' },
  { name: 'Eyüp', role: 'Client care & SEO', accent: 'ink', silhouette: 'beard' },
];

// ---------------------------------------------------------------------------
// Case studies (placeholder)
// ---------------------------------------------------------------------------

export interface CaseStudy {
  slug: string;
  client: string;
  sector: string;
  location: string;
  year: number;
  duration: string;
  service: string;
  /** One line for teasers: "Recently launched: …". */
  teaser: string;
  headline: string;
  summary: string;
  brief: string;
  approach: string[];
  outcome: string;
  metrics: { value: string; label: string }[];
  quote: { text: string; name: string; role: string };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'sonnenhof-bakery',
    client: 'Sonnenhof Bakery',
    sector: 'Bakery & café',
    location: 'Freiburg',
    year: 2026,
    duration: '7 weeks',
    service: 'E-commerce store',
    teaser: '3× more online pre-orders',
    headline: 'A family bakery, open for orders all night.',
    summary:
      'A three-generation bakery wanted to take pre-orders online without losing the warmth of their shop counter.',
    brief:
      'Sonnenhof took orders by phone, which tied up staff during the morning rush and meant regulars often called too late. Their old website was a single page with opening hours and a broken menu PDF.',
    approach: [
      'Shot the products ourselves in morning light, so the site smells of fresh bread before you scroll.',
      'Built a pre-order flow for next-day pickup: choose a time window, pay online, done in under a minute.',
      'Connected orders to a simple printout for the bakers at 4 a.m. — no new software for the team to learn.',
      'Kept every page under 100 KB of JavaScript, so it loads instantly on a phone in the queue.',
    ],
    outcome:
      'Pre-orders tripled within two months, the phone is quiet during the rush, and the Saturday sell-out now happens by 10 a.m. instead of noon.',
    metrics: [
      { value: '3×', label: 'online pre-orders' },
      { value: '1.1 s', label: 'load time on mobile' },
      { value: '−40%', label: 'phone orders at peak' },
    ],
    quote: {
      text: 'It feels like our shop — just open at night too. Our regulars order before they go to bed.',
      name: 'Marta Sonnenhof',
      role: 'Owner, Sonnenhof Bakery',
    },
  },
];

export const FEATURED_CASE_STUDY = CASE_STUDIES[0];

// ---------------------------------------------------------------------------
// The website launch checklist (lead magnet)
// ---------------------------------------------------------------------------

export const CHECKLIST: { title: string; items: { label: string; why: string }[] }[] = [
  {
    title: 'Clarity',
    items: [
      { label: 'A visitor can say what you do within five seconds', why: 'Show the page to someone new and ask them.' },
      { label: 'One primary action per page', why: 'Two equal buttons halve the clicks on both.' },
      { label: 'Headlines describe outcomes, not features', why: '“More bookings” beats “Online booking module”.' },
      { label: 'Navigation has five items or fewer', why: 'Every extra link is a decision someone has to make.' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { label: 'Real photos of real people', why: 'Stock photos are recognised instantly — and discounted.' },
      { label: 'At least one concrete result or case study', why: 'Numbers and names beat adjectives.' },
      { label: 'Imprint, privacy policy and contact details are one click away', why: 'Required in Germany — and expected everywhere.' },
      { label: 'Prices or price ranges are visible', why: 'Hidden prices make people assume the worst.' },
    ],
  },
  {
    title: 'Speed',
    items: [
      { label: 'Largest content appears in under 2.5 s on 4G', why: 'Check “LCP” in PageSpeed Insights.' },
      { label: 'Images are modern formats and sized for the screen', why: 'WebP or AVIF, never a 4,000-pixel photo in a 400-pixel slot.' },
      { label: 'No layout jumps while loading', why: 'Reserve space for images, fonts and embeds.' },
      { label: 'Third-party scripts are justified one by one', why: 'Each chat widget or tracker costs real seconds.' },
    ],
  },
  {
    title: 'Findability',
    items: [
      { label: 'Every page has a unique title and description', why: 'They are your ad text in Google.' },
      { label: 'Your Google Business Profile links to the site', why: 'For local businesses this matters more than anything else.' },
      { label: 'Headings follow a logical H1 → H2 → H3 order', why: 'Search engines and screen readers both rely on it.' },
      { label: 'Old URLs redirect to their new pages', why: 'Otherwise you throw away years of search ranking.' },
    ],
  },
  {
    title: 'Accessibility',
    items: [
      { label: 'Text contrast meets WCAG AA (4.5 : 1)', why: 'Light grey on white fails more often than you think.' },
      { label: 'Everything works with a keyboard alone', why: 'Tab through the page and watch the focus ring.' },
      { label: 'Images have meaningful alt text', why: 'Describe the purpose, not the pixels.' },
      { label: 'Forms have visible labels and clear error messages', why: 'Placeholders are not labels.' },
    ],
  },
  {
    title: 'Conversion',
    items: [
      { label: 'Contact or booking takes under two minutes', why: 'Time it yourself on a phone.' },
      { label: 'Forms ask only what you truly need', why: 'Every extra field loses a few percent of people.' },
      { label: 'A thank-you page explains what happens next', why: 'Silence after submitting creates doubt.' },
      { label: 'You measure enquiries, not just visits', why: 'Traffic is vanity; enquiries pay the bills.' },
    ],
  },
];
