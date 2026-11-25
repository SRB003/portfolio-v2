// All content comes from sahil_jio_optimized.tex — edit here to update the site.
// The client SEO report is kept out of git (confidential). If the file is present locally it is
// bundled and linked; without it the SEO card simply shows as unlinked.
const seoReport = Object.values(import.meta.glob('./assets/seo-report.pdf', { eager: true, query: '?url', import: 'default' }))[0]
export const profile = {
  name: 'Sahil Bhuvad',
  firstName: 'Sahil',
  role: 'Full-Stack Developer',
  location: 'Mumbai, Maharashtra',
  email: 'sahilbhuvad01926@gmail.com',
  phone: '+91-9960668062',
  linkedin: 'https://www.linkedin.com/in/sahil-bhuvad-b6a050243/',
  github: 'https://github.com/SRB003',
  resume: '/resume.pdf', // drop the compiled PDF into /public as resume.pdf
  intro:
    'I build full-stack web apps with React, Node.js, REST APIs and SQL, from the first requirement all the way to production support.',
  about: [
    'I’m a software developer who likes the whole journey: understanding what a feature needs, designing it with the team, writing clean code, and staying with it through testing, debugging and production.',
    'Right now I’m a Junior Developer at Epoch Branding Resources, shipping responsive interfaces, integrating APIs and keeping live client sites fast and reliable.',
  ],
}

export const stats = [
  { value: '9.1', label: 'B.Tech CGPA' },
  { value: '2', label: 'Live products shipped' },
  { value: '2', label: 'Hackathon teams led' },
  { value: '20%', label: 'Engagement lift' },
]

export const projects = [
  {
    title: 'Aertrip',
    year: '2025',
    url: 'https://holidays.aertrip.com/',
    tag: 'Travel platform',
    stack: ['React', 'Node.js', 'REST APIs', 'PostgreSQL'],
    summary:
      'Full-stack features for a live travel platform: booking flows, customer onboarding and payments.',
    points: [
      'Built booking, onboarding and payment flows with React, Node.js and REST APIs.',
      'Wired frontend to backend APIs with validation across booking and payment workflows.',
      'Fixed UAT and production issues, documented fixes and improved stability.',
    ],
    tone: 'green',
  },
  {
    title: 'Made Again',
    year: '2026',
    url: 'https://madeagain.in/',
    tag: 'CMS website',
    stack: ['JavaScript', 'HTML5', 'CSS3', 'CMS'],
    summary:
      'Responsive, CMS-driven website with custom JavaScript for dynamic content, navigation and interactions.',
    points: [
      'Developed responsive pages and CMS sections from design specs.',
      'Built custom JS for dynamic loading, navigation logic and site interactions.',
      'Maintain the live site with UI fixes, mobile tweaks and client updates.',
    ],
    tone: 'lime',
  },
]

export const experience = [
  {
    company: 'Epoch Branding Resources',
    role: 'Junior Developer · Full-time',
    period: 'June 2025 - Present',
    location: 'Mumbai',
    points: [
      'Design, build and maintain web app features across the full SDLC, from requirements to deployment and support.',
      'Build responsive interfaces with React.js, HTML5 and CSS3, integrating REST APIs for data-driven workflows.',
      'Work with developers, QA and stakeholders on feature design and deliver within timelines.',
      'Debug issues, join code reviews, write technical docs and optimise frontend performance.',
    ],
  },
]

export const education = [
  {
    school: 'Thakur College of Engineering and Technology',
    degree: 'B.Tech, Computer Engineering',
    score: 'CGPA 9.1',
    period: '2022 - 2025',
  },
  {
    school: 'Pravin Patil College of Diploma in Engineering and Technology',
    degree: 'Diploma, Computer Engineering',
    score: '91.6%',
    period: '2019 - 2022',
  },
]

export const skills = [
  { group: 'Languages', items: ['JavaScript (ES6+)', 'Python', 'Java', 'SQL'] },
  { group: 'Frontend', items: ['React.js', 'HTML5', 'CSS3', 'Responsive UI', 'State Management'] },
  { group: 'Backend & Data', items: ['Node.js', 'REST APIs', 'PostgreSQL', 'MySQL', 'Data Modeling'] },
  { group: 'Engineering', items: ['SDLC', 'Clean Code', 'Debugging', 'Testing', 'Code Reviews', 'Docs'] },
  { group: 'Tools', items: ['Git', 'GitHub', 'Postman', 'Webflow'] },
]

export const marquee = ['React', 'Node.js', 'REST APIs', 'PostgreSQL', 'JavaScript', 'Webflow', 'MySQL', 'Python', 'Git', 'CSS3']

export const extras = [
  {
    title: 'Alumni Speaker',
    detail: 'Went back to Pravin Patil College to share career and tech insights. Student project success went up 20%.',
    url: 'https://drive.google.com/file/d/1bOQmTCt18s6UiwDIM_Epy6SgDnuq9m7M/view',
  },
  {
    title: 'Hackathon Team Lead × 2',
    detail: 'Led cross-functional teams, shipped 3 product features and drove a 20% engagement lift.',
    url: 'https://drive.google.com/file/d/178Gc_js8VtjQYYvm8i6hD4EZusz-_Bh5/view',
  },
]

// Peer-reviewed research paper. PDFs live in src/assets (paper + certificate).
export const publication = {
  title: 'AgroChain: Decentralised Supply Chain Management System',
  authors: ['Sahil Bhuvad', 'Disha Dahanukar', 'Prasad Padwal'],
  affiliation: 'Thakur College of Engineering and Technology, Mumbai, India',
  journal: 'International Journal of Advanced Research in Science, Communication and Technology (IJARSCT)',
  journalShort: 'IJARSCT',
  issue: 'Volume 4, Issue 1',
  date: 'October 2024',
  pages: '432–440',
  pageCount: 9,
  issn: '2581-9429',
  impact: '7.53',
  certNo: '102024-A0187',
  doi: '10.48175/IJARSCT-19777',
  doiUrl: 'https://doi.org/10.48175/IJARSCT-19777',
  journalUrl: 'https://ijarsct.co.in/Paper19777.pdf',
  summary:
    'Farm supply chains run on paper records, central databases and layers of middlemen, so farmers lose margin and buyers can’t trace where food comes from. AgroChain proposes a decentralised model built on blockchain and smart contracts: every hand-off from farm to retailer is written to a tamper-proof ledger that anyone can verify with a QR scan.',
  points: [
    'Blockchain traceability for an auditable farm-to-shelf record.',
    'Smart contracts and direct-to-consumer markets for fairer farmer prices.',
    'IoT and data analytics to cut waste and improve logistics.',
    'Covers adoption risks: smart-contract bugs, privacy and skills gaps.',
  ],
  keywords: ['Blockchain', 'Smart contracts', 'Supply chain', 'Agriculture', 'Transparency'],
}

// Cards for the horizontal "inside the laptop" rail
export const cases = [
  {
    id: 'aertrip', kind: 'Web app', title: 'Aertrip Holidays', org: 'Travel platform', year: '2025', at: 'EBR', atFull: 'Built at Epoch Branding Resources',
    url: 'https://holidays.aertrip.com/', art: 'aertrip', tone: '#cfe3ea',
    line: 'Booking flows, onboarding and payments for a live travel platform.',
    stack: ['React', 'Node.js', 'REST APIs', 'PostgreSQL'],
    facts: [['3', 'core flows built'], ['UAT → Prod', 'issues owned']],
  },
  {
    id: 'madeagain', kind: 'Website', title: 'Made Again', org: 'CMS website', year: '2026', at: 'EBR', atFull: 'Built at Epoch Branding Resources',
    url: 'https://madeagain.in/', art: 'madeagain', tone: '#e3efc9',
    line: 'Responsive CMS site with custom JS for dynamic content and navigation.',
    stack: ['JavaScript', 'HTML5', 'CSS3', 'CMS'],
    facts: [['100%', 'responsive pages'], ['Live', 'maintained today']],
  },
  {
    id: 'webflow', kind: 'Website', title: 'Webflow client sites', org: 'Client sites', year: '2025 - now', at: 'EBR', atFull: 'Built at Epoch Branding Resources',
    url: 'https://www.jeraifitness.com/', art: 'webflow', tone: '#e6eaf2',
    line: 'Fine-tuning and improving live Webflow sites for clients like Jerai Fitness: layouts, CMS, interactions and responsiveness.',
    stack: ['Webflow', 'CMS', 'Interactions', 'Custom JS'],
    facts: [['Jerai Fitness', '+ more client sites'], ['Polish', 'fixes & upgrades']],
  },
  {
    id: 'seo', kind: 'SEO', title: 'Client SEO sprint', org: 'SEO · AI-assisted', year: '2026', at: 'EBR', atFull: 'Built at Epoch Branding Resources',
    url: seoReport, host: 'seo-report.pdf', status: 'Verified', cta: 'View SEO report', art: 'seo', tone: '#eaf1ec',
    line: 'Delivered a 12-week technical and content SEO sprint for a Dubai real-estate developer, with Claude AI speeding up audits, schema and content. Full month 1 vs month 3 report inside.',
    stack: ['Technical SEO', 'Schema', 'Web Vitals', 'Claude AI'],
    facts: [['46 → 88', 'SEO health score'], ['0 → 838', 'search impressions']],
  },
  {
    id: 'frames', kind: 'Tool', title: 'MP4 to AVIF frames', org: 'In-house tool', year: '2026', at: 'EBR', atFull: 'Built at Epoch Branding Resources',
    url: 'https://mp4toavifframes.netlify.app/', cta: 'Try the tool', art: 'frames', tone: '#e9e9f6',
    line: 'Browser tool that turns desktop and mobile videos into frame sequences for scroll animations. It tunes quality so each frame lands near 30-40 KB, then zips them ready for the CDN.',
    stack: ['JavaScript', 'Canvas API', 'JSZip', 'Netlify'],
    facts: [['30-40 KB', 'per frame, auto-tuned'], ['100-200', 'frames per scroll']],
  },

]

export const path = [
  { year: '2019', title: 'Started a Diploma in Computer Engineering', tag: 'Diploma', where: 'Pravin Patil College', note: 'Finished with 91.6%.' },
  { year: '2022', title: 'B.Tech in Computer Engineering', tag: 'B.Tech', where: 'Thakur College of Engineering & Technology', note: 'Graduated 2025 with a 9.1 CGPA.' },
  { year: '2023', title: 'Led teams in two hackathons', tag: 'Hack ×2', where: 'Cross-functional teams', note: 'Shipped 3 features, +20% user engagement.', url: 'https://drive.google.com/file/d/178Gc_js8VtjQYYvm8i6hD4EZusz-_Bh5/view' },
  { year: '2024', title: 'Published a research paper', tag: 'Paper', where: 'IJARSCT · Vol 4, Issue 1', note: 'AgroChain: decentralised supply chains on blockchain.', url: 'https://doi.org/10.48175/IJARSCT-19777' },
  { year: '2025', title: 'Junior Developer, full-time', tag: 'Epoch', where: 'Epoch Branding Resources', note: 'React, APIs, Webflow and production support.' },
  { year: '2025', title: 'Shipped Aertrip Holidays features', tag: 'Aertrip', where: 'React · Node.js · PostgreSQL', note: 'Booking, onboarding and payment flows.' },
  { year: '2025', title: 'Invited back as alumni speaker', tag: 'Speaker', where: 'Pravin Patil College', note: 'Student project success up 20%.', url: 'https://drive.google.com/file/d/1bOQmTCt18s6UiwDIM_Epy6SgDnuq9m7M/view' },
  { year: '2026', title: 'Built Made Again', tag: 'Made Again', where: 'JavaScript · CMS', note: 'Responsive, CMS-driven, maintained live.' },
]
