/*
 * Copy and sample content for the public site.
 *
 * ⚠️ PLACEHOLDER CONTENT — the case study, testimonials, team members, quotes and results
 * in this file were invented for the test build. Replace them with real, approved material
 * before launch: fake testimonials and case studies mislead visitors and, in the EU, breach
 * consumer-protection law (UWG / UCPD).
 */

// ---------------------------------------------------------------------------
// Hero headline experiment
// ---------------------------------------------------------------------------

export const HEADLINE_EXPERIMENT = 'hero-headline';
export const HEADLINE_VARIANTS = ['original', 'clients', 'as-good'] as const;
export type HeadlineVariant = (typeof HEADLINE_VARIANTS)[number];

export const HEADLINES: Record<HeadlineVariant, { lead: string; accent: string }> = {
  original: { lead: 'Websites that earn trust', accent: 'at first glance.' },
  clients: { lead: 'A website that brings you', accent: 'better clients.' },
  'as-good': { lead: 'Your business, finally looking', accent: 'as good as it is.' },
};

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
  /** One line for the hero: "Recently launched: …". */
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
// Testimonials (placeholder)
// ---------------------------------------------------------------------------

export interface Testimonial {
  quote: string;
  name: string;
  company: string;
  result: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Within three months our enquiries were up forty percent — and they’re the right enquiries.',
    name: 'Dr. Jana Brandt',
    company: 'Brandt Physiotherapy',
    result: '+40% enquiries',
  },
  {
    quote: 'They asked better questions about our business in one call than our last agency did in a year.',
    name: 'Tobias Lindner',
    company: 'Lindner & Co. Architects',
    result: 'Live in 6 weeks',
  },
  {
    quote: 'Our old shop took nine seconds to load. Now it’s instant, and the sales show it.',
    name: 'Selin Aydın',
    company: 'Atelier Nord Ceramics',
    result: '+28% online sales',
  },
];

// ---------------------------------------------------------------------------
// Team (placeholder names; illustrated portraits)
// ---------------------------------------------------------------------------

export type PortraitHair = 'short' | 'bun' | 'long' | 'curly';

export interface TeamMember {
  name: string;
  role: string;
  line: string;
  portrait: { hair: PortraitHair; sunX: number };
}

export const TEAM: TeamMember[] = [
  {
    name: 'Lena Hartmann',
    role: 'Design lead',
    line: 'Believes every pixel should earn its place.',
    portrait: { hair: 'bun', sunX: 0.24 },
  },
  {
    name: 'Jonas Keller',
    role: 'Engineering',
    line: 'Makes sites fast enough to feel instant.',
    portrait: { hair: 'short', sunX: 0.72 },
  },
  {
    name: 'Mira Okafor',
    role: 'Strategy & content',
    line: 'Turns what you do into words people act on.',
    portrait: { hair: 'curly', sunX: 0.4 },
  },
];

// ---------------------------------------------------------------------------
// Process
// ---------------------------------------------------------------------------

export interface ProcessStep {
  title: string;
  duration: string;
  text: string;
  details: string[];
}

export const PROCESS: ProcessStep[] = [
  {
    title: 'Consultation',
    duration: 'Day 1',
    text: 'A focused call about your business, your goals and whether we’re the right fit.',
    details: ['45–90 minutes by video or phone', 'Goals, audience and budget', 'An honest fit check and a rough estimate'],
  },
  {
    title: 'Strategy & design',
    duration: 'Weeks 1–2',
    text: 'Structure, content and a visual direction, refined together until it feels right.',
    details: ['Sitemap and content plan', 'Visual direction with two review rounds', 'A clickable prototype before any code'],
  },
  {
    title: 'Build',
    duration: 'Weeks 3–6',
    text: 'Hand-crafted, fast and accessible, with editing that suits your team.',
    details: ['Responsive, accessible build', 'Content entry and a short editing session', 'Speed and search tuning'],
  },
  {
    title: 'Launch & care',
    duration: 'Week 7 onward',
    text: 'A careful launch, then monitoring and support so the site keeps improving.',
    details: ['Launch checklist, analytics and redirects', '30 days of free fixes', 'Optional monthly care plan'],
  },
];

export const PRINCIPLES = [
  { title: 'Clarity over decoration', text: 'Every element earns its place.' },
  { title: 'Performance as a feature', text: 'Fast on every device and connection.' },
  { title: 'Built to be owned', text: 'Clean code, simple tools, no lock-in.' },
];

// ---------------------------------------------------------------------------
// Service finder
// ---------------------------------------------------------------------------

export const FINDER_QUESTIONS = [
  {
    id: 'need',
    question: 'What do you need?',
    options: [
      { value: 'new', label: 'A new website' },
      { value: 'redesign', label: 'A redesign' },
      { value: 'improve', label: 'More from my current site' },
      { value: 'care', label: 'Someone to look after it' },
    ],
  },
  {
    id: 'sell',
    question: 'Will the site sell or book anything?',
    options: [
      { value: 'products', label: 'Products' },
      { value: 'bookings', label: 'Bookings or a portal' },
      { value: 'presence', label: 'No, it’s about presence' },
    ],
  },
  {
    id: 'timing',
    question: 'When would you like to launch?',
    options: [
      { value: 'soon', label: 'Within a month' },
      { value: 'quarter', label: 'In 2–3 months' },
      { value: 'exploring', label: 'Just exploring' },
    ],
  },
] as const;

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
