export type BlogPreview = {
  slug: string;
  category: string;
  badge: string;
  title: string;
  excerpt: string;
  readTime: string;
  publishedAt: string;
  imageUrl: string;
  imageAlt: string;
  variant: 'feature' | 'secondary' | 'compact' | 'quote';
  notionUrl: string;
};

export type BlogArticle = {
  slug: string;
  category: string;
  badge: string;
  title: string;
  subtitle: string;
  readTime: string;
  publishedAt: string;
  authorName: string;
  authorRole: string;
  heroImageUrl: string;
  heroImageAlt: string;
  intro: string;
  sectionTitle: string;
  paragraphs: string[];
  figure: {
    imageUrl: string;
    imageAlt: string;
    caption: string;
  };
  quote: {
    text: string;
    attribution: string;
  };
  highlights: Array<{
    title: string;
    description: string;
  }>;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  tags: string[];
  notionUrl: string;
};

export const blogPreviews: BlogPreview[] = [
  {
    slug: 'the-problem-of-innovating-in-nigeria',
    category: 'Research',
    badge: 'Featured Report',
    title: 'The problem of innovating in Nigeria',
    excerpt:
      'A field report on how infrastructure friction reshapes technical ambition, and why durable systems matter more than perfect ones.',
    readTime: '12 min read',
    publishedAt: 'Oct 24, 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAC_nVxWjzfx8lLQ8teMBCSFTLUOJIsueT2mdvw-UmwwLoIj_VEe9c923_dIp5-YvRJO3tkkeosigYJq-TGcdsuEDiSwu7pu6klnc79zajN9T9OsBCxilN7iiPMyXZs4JTrB28uurzIXaSXKCozX2hUg-5wx6OFP2QCqlLdKAmuaSOyGexvpNmKDiZnLon9t7ZrI1jzV4kanfLeuP4gN6LR5aBa9xzeg0Nu9lwqskmmQpB_TEjK5_dzf_qBAR5P1eSSSnjMlKnOeyY',
    imageAlt:
      'Dramatic industrial scene showing close-up of heavy precision machinery in a dark factory setting with blue cool lighting and lens flares',
    variant: 'feature',
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'five-axis-cnc-calibration',
    category: 'Electronics',
    badge: 'Research Note',
    title: 'Optimizing Signal Integrity for High-Frequency PCB Design',
    excerpt:
      'Grounding, impedance, and trace discipline for multi-layer fabrication that has to survive real-world noise.',
    readTime: '8 min read',
    publishedAt: 'Nov 02, 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJkFbasMqU2UdLxUImDByUg7Z-5DeABUj1Gcecyag65J-rVROmQS9CkfizJhrQNZR3Gd28JXs8KIHzeCfBkTyoh0ndRVpJJUozZKQF9hApVGcEKN_hC9M6zLxaoSwCNUCQk8eo8bFOLzxW3fItyk-6bi-cgNt87uvCuuoq03p-jbBk4MtMQ8AD28f24N3AHkO9CtAycHiqXBBJ94GDGzRmQqyNfxkbNEYV0QLPNI1B-W8uv_0TNZCFIaPlqODZhHl_SG8p3uKvAY',
    imageAlt:
      'Symmetrical top-down macro shot of a complex green circuit board with glowing LEDs and microchips, professional technical photography',
    variant: 'secondary',
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'kinematic-couplings-modular-robotics',
    category: 'Mechanical',
    badge: 'Field Log',
    title: 'Kinematic Couplings in Modular Robotics',
    excerpt:
      'Exploring deterministic location and repeatable precision for interchangeable robot end-effectors.',
    readTime: '6 min read',
    publishedAt: 'Nov 07, 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDy8deUCtUtgB8CjWsWo-oWdzGjGJ9j8pO7SoMdookvTFQTDeDkJMGKfMPvDF_iB5T9ug3wFJreO01L83Flm3eLX3DkwM9lki2-KiXz6Utmg-P1mVzFnCFb4bmMqtItmIxWNUs9PfgsAG_LL1kHB1vqrYhYNH_xPs8jhkrCIaXWbtDs2l48B6LqZfhWZrgTDgdEKQgo0QUYiDxQGpP-7txNIm9WgkSucuwuNOqryf32gU2EePnH2QQ7NkzBY9PTvn4JsdM5P3nnFsg',
    imageAlt:
      'Polished steel industrial gears and mechanical components interlocked with dramatic cinematic shadow and light contrast',
    variant: 'compact',
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'code-is-the-new-iron',
    category: 'Software',
    badge: 'Opinion',
    title: 'Code is the new iron.',
    excerpt:
      'A philosophical look at how firmware architecture has become the primary constraint in heavy machinery performance.',
    readTime: '4 min read',
    publishedAt: 'Nov 12, 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcaGdG4Iex6ti_HoQQTnyu-QKh-RyxzbGcQPgLjsgcBftHpfB9xAwI0h8K1kPLQ71o7XdK2U-izb0LzPJW1OkUMhAV0OuiYu8IfYcE1jSDDcRu37V9lSf6-tRSc_-qke1Ee5Ls5pAjr9VZ9sZkeREQ3lTVVdY5iARBIz_OzW2Gz2wI_p5C7C6D2_RTWh58bN5ofo33tQ32jamRTAvwLB1hfPbNZXzRp65WTXnX-7AaqgoQdxjBPGB83y7vrydEnL4HSEOvFyGHkxY',
    imageAlt:
      'Professional headshot of a male software architect in a studio setting',
    variant: 'quote',
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'laser-sintering-beyond-traditional-casting',
    category: 'Fabrication',
    badge: 'Lab Brief',
    title: 'Laser Sintering: Beyond Traditional Casting',
    excerpt:
      'How additive manufacturing is rewriting the rules for complex internal voids and low-volume production.',
    readTime: '7 min read',
    publishedAt: 'Nov 18, 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC-wcOOgaEAqWm-VWr9P6pqqDEwloigpblC74SSzYc1Zenv_AaOry64KGybJt9zoQEkgG4Y0rexn7w7qzjXSXsiXTvOTEH3TZd0Tg0qtaWXwb8AxTIuDiHjfZ7auSHzBrDl8cIn9VIdcOaIcJ9U8UR0zuGmWYPRDVGX4svkYf32CHbJat55DoLtfBtjo6Nuqm--wTq5WcjljZ3XeGbDQsbGO38Ogw0rAgc3duIklgiXdvw6cpP0zPUVM5VL6WpTE3HeBcV4MssZRMI',
    imageAlt:
      'Sparks flying from a precision laser cutter on a dark steel plate in a high-tech fabrication facility',
    variant: 'compact',
    notionUrl: '#notion-sync-pending',
  },
];

export const featuredBlog = blogPreviews[0];

export const blogArticles: BlogArticle[] = [
  {
    slug: 'the-problem-of-innovating-in-nigeria',
    category: 'Technical Analysis',
    badge: 'Field Report',
    title: 'The problem of innovating in Nigeria',
    subtitle:
      'Innovation is not abstract here. It is a physical struggle against uptime, logistics, and the cost of staying precise.',
    readTime: '12 min read',
    publishedAt: 'Oct 24, 2024',
    authorName: 'Dr. Adebayo Ogunlesi',
    authorRole: 'Lead Research Fellow, DFN Lab',
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAC_nVxWjzfx8lLQ8teMBCSFTLUOJIsueT2mdvw-UmwwLoIj_VEe9c923_dIp5-YvRJO3tkkeosigYJq-TGcdsuEDiSwu7pu6klnc79zajN9T9OsBCxilN7iiPMyXZs4JTrB28uurzIXaSXKCozX2hUg-5wx6OFP2QCqlLdKAmuaSOyGexvpNmKDiZnLon9t7ZrI1jzV4kanfLeuP4gN6LR5aBa9xzeg0Nu9lwqskmmQpB_TEjK5_dzf_qBAR5P1eSSSnjMlKnOeyY',
    heroImageAlt:
      'Dramatic industrial scene showing close-up of heavy precision machinery in a dark factory setting with blue cool lighting and lens flares',
    intro:
      'Innovation is often discussed in the abstract, as a matter of venture capital and software scalability. In the Nigerian context, however, innovation is a physical, friction-heavy struggle against entropy.',
    sectionTitle: 'The Infrastructure Gap',
    paragraphs: [
      'For the hardware engineer in Lagos or Aba, the primary challenge is not code optimization; it is power consistency. The grid turns every fabrication cycle into a negotiation with interruption, and every machine run into a calculation of risk.',
      'When we discuss digital fabrication, we are also discussing the energy required to drive the lasers, mills, and printers that keep production moving. Without a stable baseline, technical precision becomes a luxury instead of a standard.',
      'The consequence is a redesign of the engineering mindset itself: redundancy-first architecture, local substitution, and workflows built to survive disruption instead of pretending it is absent.',
    ],
    figure: {
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBfSgjf3zfiGcE_HqRigO4SlUyaYYlqcjQB96s3EkIq76VzWr--EWz3L4EOxQIcvP0tWkeP3ife2OuVdCsfFwn7YcUNfnrXxsSCAFHOmAas3H-mPTfdWRsESwLa7FJOHq_m4LaGNvmrHtulL17XCmZ9nS6PZezsH3O07wBruWBX0PTKIWVBi4mMSAJ4BRPoLXBT1DZmQM2RXEkxLkCBHGJ78E1SOyXq6ynPsAd00Yyu-2Pl4wolvccVIKO0pQY0aKraxS6yXx3X9rk',
      imageAlt: 'Technical engineering diagram showing power flow and redundancy loops in a fabrication lab',
      caption:
        'Fig 1.0: Semi-automated CNC array deployed in the Yaba fabrication zone, featuring integrated UPS clusters.',
    },
    quote: {
      text:
        'Innovation in the Global South is not about reinventing the wheel; it is about making the wheel function on a road that does not exist yet.',
      attribution: 'Editorial note from the DFN research desk',
    },
    highlights: [
      {
        title: 'Redundancy as standard',
        description:
          'Every high-precision tool is backed by a fallback energy source, a standby workflow, or a parallel method that reduces total failure.',
      },
      {
        title: 'Material substitution',
        description:
          'The lab pivots between imported resins and locally sourced polymers without compromising the integrity of the final build.',
      },
    ],
    metrics: [
      { label: 'Input node', value: '220V Variable' },
      { label: 'Storage Cap', value: '15.5 kWh' },
      { label: 'Latency', value: '< 0.02ms' },
    ],
    tags: ['Hardware', 'AfricaTech', 'Fabrication'],
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'five-axis-cnc-calibration',
    category: 'Engineering Journal',
    badge: 'Featured Report',
    title: 'The Future of 5-Axis CNC Calibration in Aerospace Prototyping',
    subtitle:
      'A systems-level look at calibration drift, tooling recovery, and why precision tooling is a supply-chain problem as much as a geometry problem.',
    readTime: '10 min read',
    publishedAt: 'Oct 24, 2024',
    authorName: 'Engr. Tola Abimbola',
    authorRole: 'Manufacturing Systems Lead',
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8C6BDINSk-z_ZZ-5rGQ9F88AN80YKGD9b3MVoPIyovs6LmmVhbko2FMM3a9Pm-CgXAyISIPt4A3mQ2PYA0CY8ztLNGeb4xykA-aED_TLE-EjGNUWMbO0t1gwehInvUPyEbZawP80reoylXajL4GhwVz3R2e1bR_e5fBWuuDPAT64lgFPsTparXhnZQqU8wTg7_5i28OvzYcOesJ-8q88Uc9iqncTQJdouoTNpnNnNqiiryCaC1Qiq99WrRcr86RTfa5-_h4F6Y88',
    heroImageAlt:
      'Highly detailed close-up of a precision industrial robotic arm in a clean tech lab with cold blue and white lighting',
    intro:
      'Calibration quality determines whether prototype tolerances remain trustworthy once the part leaves the machine and enters a higher-stakes workflow.',
    sectionTitle: 'Why calibration drifts',
    paragraphs: [
      'Five-axis systems multiply the benefits of precision and the penalty for drift. Once an offset compounds across multiple planes, small mistakes become expensive corrections.',
      'The practical answer is not just better tooling, but a tighter loop between inspection, fixturing, and operator judgment. In a fast-moving lab, the calibration stack is the product.',
    ],
    figure: {
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBWgq5x1maUNHHvqOVzztZaibNwCOFX5FlIi1wXdi5AXQqdHgkuQt6CsaQXInjeiz14ECG_qz0d27PcVktT0rbGF-OzUDM5DSYBX0qmoHNka2xOPKBrcag7SDZPJpR9rlTnw15Cpq4QQE103aBkG3URXnxc3JgjX9zqH-7o7wL0LIIAdK3eQ9t_A-4Z14iDhcRDlEhQgDGCdpBJbWWDmEqlcdTz6KT9R6cg5FyMH9eSM7AiSgEHk9e3lcmZJzu7jMkQGo90Hpfr1BU',
      imageAlt: 'Wide shot of a high-tech CNC milling facility with clean floors and bright LED panels',
      caption: 'Industrial calibration bays require repeatable lighting, stable mounts, and measurement discipline.',
    },
    quote: {
      text: 'A calibration routine is only as good as the worst operator decision it can absorb without collapsing.',
      attribution: 'Manufacturing systems note',
    },
    highlights: [
      {
        title: 'Inspection before ambition',
        description:
          'Treat metrology as part of the machine workflow rather than a separate sign-off step at the end of production.',
      },
      {
        title: 'Tooling recovery windows',
        description:
          'Build in reset intervals so small errors can be corrected before they become compound failures across the run.',
      },
    ],
    metrics: [
      { label: 'Axis count', value: '5' },
      { label: 'Tolerance', value: '± 0.02 mm' },
      { label: 'Cycle window', value: '90 min' },
    ],
    tags: ['CNC', 'Aerospace', 'Calibration'],
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'signal-integrity-pcb-design',
    category: 'Electronics',
    badge: 'Research Note',
    title: 'Optimizing Signal Integrity for High-Frequency PCB Design',
    subtitle:
      'Grounding, trace length, and the practical discipline needed to keep high-frequency boards clean under fabrication pressure.',
    readTime: '8 min read',
    publishedAt: 'Nov 02, 2024',
    authorName: 'Engr. Zainab Yusuf',
    authorRole: 'PCB Reliability Analyst',
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJkFbasMqU2UdLxUImDByUg7Z-5DeABUj1Gcecyag65J-rVROmQS9CkfizJhrQNZR3Gd28JXs8KIHzeCfBkTyoh0ndRVpJJUozZKQF9hApVGcEKN_hC9M6zLxaoSwCNUCQk8eo8bFOLzxW3fItyk-6bi-cgNt87uvCuuoq03p-jbBk4MtMQ8AD28f24N3AHkO9CtAycHiqXBBJ94GDGzRmQqyNfxkbNEYV0QLPNI1B-W8uv_0TNZCFIaPlqODZhHl_SG8p3uKvAY',
    heroImageAlt:
      'Symmetrical top-down macro shot of a complex green circuit board with glowing LEDs and microchips, professional technical photography',
    intro:
      'At high frequencies, a PCB stops behaving like a static drawing and starts behaving like a living system of trade-offs.',
    sectionTitle: 'The discipline behind clean signals',
    paragraphs: [
      'Return paths, impedance, and via placement all matter more once the board begins carrying speed-sensitive data. The cost of poor discipline is not just noise, but a redesign that ripples into the rest of the system.',
      'The easiest designs to explain are rarely the easiest to manufacture. A production-safe board keeps the layout simple enough for the fab house and strict enough for the device itself.',
    ],
    figure: {
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuApb6L4LQH7Y7QK6uK0Qk4Ck9O0uA7XwI0A3s8Z0vYOVyPjJScJQJ7r8vZp3gI2g3Qn2j2l3jz8WwX1nVqv1M3YJrS3U2S7z7n4dQw2KxV6P0pC7m1WkNw4H1kQJ7n8m2q8Z7T0pQp4XQ',
      imageAlt: 'Close-up of a circuit board being hand soldered with precision in a bright workshop',
      caption: 'Manufacturing reality is where the clean theoretical trace is actually judged.',
    },
    quote: {
      text: 'Signal integrity is just discipline made visible on copper.',
      attribution: 'Lab margin note',
    },
    highlights: [
      {
        title: 'Grounding first',
        description:
          'Make the return path obvious before you start optimizing for density or visual neatness.',
      },
      {
        title: 'Trace length matters',
        description:
          'Even small inconsistencies can create timing differences that become expensive to debug after assembly.',
      },
    ],
    metrics: [
      { label: 'Layers', value: '6' },
      { label: 'Impedance', value: 'Controlled' },
      { label: 'Noise floor', value: 'Low' },
    ],
    tags: ['PCB', 'Signals', 'Electronics'],
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'kinematic-couplings-modular-robotics',
    category: 'Mechanical',
    badge: 'Field Log',
    title: 'Kinematic Couplings in Modular Robotics',
    subtitle:
      'A compact study of deterministic location, repeatable alignment, and the cost of interchangeable precision.',
    readTime: '6 min read',
    publishedAt: 'Nov 07, 2024',
    authorName: 'Engr. Musa Ibrahim',
    authorRole: 'Robotics Systems Designer',
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDy8deUCtUtgB8CjWsWo-oWdzGjGJ9j8pO7SoMdookvTFQTDeDkJMGKfMPvDF_iB5T9ug3wFJreO01L83Flm3eLX3DkwM9lki2-KiXz6Utmg-P1mVzFnCFb4bmMqtItmIxWNUs9PfgsAG_LL1kHB1vqrYhYNH_xPs8jhkrCIaXWbtDs2l48B6LqZfhWZrgTDgdEKQgo0QUYiDxQGpP-7txNIm9WgkSucuwuNOqryf32gU2EePnH2QQ7NkzBY9PTvn4JsdM5P3nnFsg',
    heroImageAlt:
      'Polished steel industrial gears and mechanical components interlocked with dramatic cinematic shadow and light contrast',
    intro:
      'Modular robots only stay modular when every coupling still lands in the same place after repeated use.',
    sectionTitle: 'Deterministic alignment',
    paragraphs: [
      'Kinematic couplings eliminate ambiguity by forcing the part to settle into a predictable relationship with the host interface. That predictability is what makes modular tooling viable at scale.',
      'The practical question is not whether the coupling is elegant, but whether it remains stable after dust, wear, and operator fatigue enter the workflow.',
    ],
    figure: {
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBpV8sUFpBf3D_HhFf2Wf6-8_hVqZQ0alhsyIaJfB2J2yDrl6Oi7c09TA8sFbCdu96caVfujVGI9h8htMd0pGffSpMjpIIOqTsmY2uuaCBfiA25jgabSuHugMq88YicaxpM203BHiFpcAt2_TeU3byFezXtamtM8c3woYyV6LdS63p7g_Xe1xduNmziXncumop0EZqgHgeR36VTymTyW2dQAHabDVSJtVV_piqp7MoF3FWswiGWTJ1EGmBEjhsFZ8UQOeCZs_hB4LI',
      imageAlt: 'A roughly finished hand-built metal component',
      caption: 'A coupling that is easy to explain is not always easy to keep clean in the field.',
    },
    quote: {
      text: 'Interchangeability is a precision problem wearing a convenience badge.',
      attribution: 'Robotics design note',
    },
    highlights: [
      {
        title: 'Repeatable seating',
        description:
          'The interface must return to the same state every time, even if the user does not.',
      },
      {
        title: 'Wear tolerance',
        description:
          'If the mechanism degrades too quickly, modularity becomes a maintenance burden rather than a productivity gain.',
      },
    ],
    metrics: [
      { label: 'Contact points', value: '3' },
      { label: 'Re-seat error', value: '< 0.01 mm' },
      { label: 'Swap time', value: '22 sec' },
    ],
    tags: ['Robotics', 'Mechanical', 'Precision'],
    notionUrl: '#notion-sync-pending',
  },
  {
    slug: 'laser-sintering-beyond-traditional-casting',
    category: 'Fabrication',
    badge: 'Lab Brief',
    title: 'Laser Sintering: Beyond Traditional Casting',
    subtitle:
      'How additive manufacturing rewrites the rules for complex internal voids and low-volume production.',
    readTime: '7 min read',
    publishedAt: 'Nov 18, 2024',
    authorName: 'Engr. Kemi Adeyemi',
    authorRole: 'Additive Manufacturing Lead',
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC-wcOOgaEAqWm-VWr9P6pqqDEwloigpblC74SSzYc1Zenv_AaOry64KGybJt9zoQEkgG4Y0rexn7w7qzjXSXsiXTvOTEH3TZd0Tg0qtaWXwb8AxTIuDiHjfZ7auSHzBrDl8cIn9VIdcOaIcJ9U8UR0zuGmWYPRDVGX4svkYf32CHbJat55DoLtfBtjo6Nuqm--wTq5WcjljZ3XeGbDQsbGO38Ogw0rAgc3duIklgiXdvw6cpP0zPUVM5VL6WpTE3HeBcV4MssZRMI',
    heroImageAlt:
      'Sparks flying from a precision laser cutter on a dark steel plate in a high-tech fabrication facility',
    intro:
      'Additive manufacturing is valuable when geometry matters more than traditional casting economics can easily explain.',
    sectionTitle: 'What additive production changes',
    paragraphs: [
      'Laser sintering makes internal channels, voids, and lightweight structures much easier to produce, but it also demands tighter oversight of powder behavior and thermal consistency.',
      'In practice, the process is less a replacement for casting than a separate design language for parts that were previously hard to make at all.',
    ],
    figure: {
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBWgq5x1maUNHHvqOVzztZaibNwCOFX5FlIi1wXdi5AXQqdHgkuQt6CsaQXInjeiz14ECG_qz0d27PcVktT0rbGF-OzUDM5DSYBX0qmoHNka2xOPKBrcag7SDZPJpR9rlTnw15Cpq4QQE103aBkG3URXnxc3JgjX9zqH-7o7wL0LIIAdK3eQ9t_A-4Z14iDhcRDlEhQgDGCdpBJbWWDmEqlcdTz6KT9R6cg5FyMH9eSM7AiSgEHk9e3lcmZJzu7jMkQGo90Hpfr1BU',
      imageAlt: 'Wide shot of a high-tech CNC milling facility with clean floors and bright LED panels',
      caption: 'A broad fabrication floor shows how additive and subtractive systems coexist.',
    },
    quote: {
      text: 'The future of parts production is not one method winning. It is the right geometry choosing the right process.',
      attribution: 'Lab editorial note',
    },
    highlights: [
      {
        title: 'Design for voids',
        description:
          'Sintering lets teams create shapes that would be difficult or impossible to cast cleanly.',
      },
      {
        title: 'Production realism',
        description:
          'The machine is only half the story; post-processing and inspection still determine whether the part is usable.',
      },
    ],
    metrics: [
      { label: 'Build style', value: 'Layered' },
      { label: 'Support ratio', value: 'Optimized' },
      { label: 'Post-process', value: 'Required' },
    ],
    tags: ['Additive', 'CNC', 'Materials'],
    notionUrl: '#notion-sync-pending',
  },
];

export const previewBySlug = new Map(blogPreviews.map((preview) => [preview.slug, preview]));
export const articleBySlug = new Map(blogArticles.map((article) => [article.slug, article]));
