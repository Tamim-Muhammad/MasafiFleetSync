// src/data/siteContent.js

export const faqData = [
  { 
    q: "How does the Masafi Fleet Sync pricing work?", 
    a: "Our pricing uses an automated formula: [Base Rate + (Distance in km × Per-km Rate) × Volume Multiplier]. This ensures total transparency for all bulk water deliveries." 
  },
  { 
    q: "What happens if my document expires mid-job?", 
    a: "The system enforces a 'Mid-Job Grace Period'. You will be allowed to complete your active delivery, but the system will automatically block you from receiving new assignments until the document is renewed." 
  },
  { 
    q: "How do I report a vehicle breakdown?", 
    a: "Use the 'Push-to-Log' or 'SOS' button in your driver app. This instantly transmits your precise GPS coordinates to our recovery dispatchers for immediate assistance." 
  },
  { 
    q: "Are my documents secure?", 
    a: "Yes. All uploaded licenses and insurance certificates are stored in a secure cloud-based digital repository with AES-256 encryption." 
  },
  {
    q: "Can I manage multiple vehicles on one account?",
    a: "Yes, our compliance management system supports multi-vehicle profiles under a single driver account, provided each vehicle's registration and insurance are individually verified."
  }
];

export const aboutUsData = {
  background: "Initiated as a comprehensive digital transformation effort for Al-Waqar Transport L.L.C., Masafi Fleet Sync was engineered to mitigate the risks of manual workflows, such as undetected document expirations and inefficient routing, by providing a robust, data-driven framework.",
  mission: "To establish operational excellence and market leadership in the fleet management and water delivery services sector within the Masafi/Fujairah region by providing a synchronized, digital ecosystem.",
  vision: "To replace fragmented, manual paper-based processes with an intelligent, data-driven platform that guarantees 99% fleet compliance and optimized logistical performance.",
  coreValues: [
    { 
      title: "Operational Excellence", 
      detail: "We strive to eliminate revenue leakage and improve routing efficiency through advanced VRP algorithms and real-time GPS fleet monitoring." 
    },
    { 
      title: "Regulatory Integrity", 
      detail: "By leveraging OCR technology for automated document verification, we ensure all fleet operations remain 100% compliant with UAE regulatory standards." 
    },
    { 
      title: "Innovation", 
      detail: "We are committed to modernizing the logistics sector by centralizing scheduling, compliance, rental, and recovery operations into a single platform." 
    }
  ]
};

export const servicesData = [
  { 
    title: "Logistics Management System (LMS)", 
    description: "An interactive, map-based dispatch dashboard for real-time water tanker scheduling. It utilizes VRP optimization to generate intelligent route suggestions, reducing fleet mileage and optimizing fuel consumption." 
  },
  { 
    title: "Automated Compliance Hub", 
    description: "A digital compliance repository that uses OCR technology to automatically extract expiry dates. It enforces automated assignment blockades for non-compliant vehicles, ensuring 99% regulatory compliance." 
  },
  { 
    title: "Vehicle Rental Management", 
    description: "An automated leasing workflow featuring an interactive rental calendar, digital PDF contract generation, and bidirectional status synchronization to prevent double-booking." 
  },
  { 
    title: "Emergency Recovery & SOS", 
    description: "A digitized emergency coordination module that captures precise GPS coordinates and timestamps from driver 'Push-to-Log' reports, enabling rapid, location-aware recovery team deployment." 
  }
];

export const contactData = {
  headquarters: "Al-Waqar Transport L.L.C., Masafi/Fujairah Region, UAE",
  hotline: "+971-50-882-1944",
  supportEmail: "support@masafifleetsync.com",
  availability: "24/7 Operations Support",
  description: "Our dedicated support team is available around the clock to assist with emergency recovery dispatch, order inquiries, and compliance documentation support."
};