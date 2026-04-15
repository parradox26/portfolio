export const personal = {
  name: "Shresthdeep Gupta",
  title: "Technical Lead",
  subtitle: "Full-Stack · GenAI · Cloud · IoT · ML",
  location: "Noida, India",
  email: "gupta.shresth33@gmail.com",
  phone: "+91-8171953773",
  linkedin: "https://linkedin.com/in/shresthdeep-gupta-09b118170",
  github: "",
  yearsExperience: "6+",
  bio: "I build systems that do real things at scale — from satellite mission control and orbital prediction to AI loan pipelines and smart city IoT platforms. Six years of shipping production software across domains most engineers never touch.",
  certification: [
    {
      name: "Microsoft Certified: Azure AI Engineer Associate",
      link: "https://learn.microsoft.com/en-us/users/ShresthdeepGupta-0974/credentials/CCCD5FCA8DE37EE5"
    }
  ],
  
};

export const skills = [
  { category: "Languages",     items: ["Node.js", "Python", "Java", "TypeScript", "Kotlin", "Dart/Flutter", "SQL"] },
  { category: "GenAI & LLM",   items: ["LangChain", "LlamaIndex", "RAG Pipelines", "LLM Fine-tuning", "Prompt Engineering", "Neo4j", "ChromaDB", "Groq API", "Agentic Workflows"] },
  { category: "ML & Data",     items: ["XGBoost", "LightGBM", "Temporal Fusion Transformer", "Optuna/TPE", "Bayesian Optimisation", "Kedro", "MLflow", "PyTorch", "scikit-learn"] },
  { category: "Frontend",      items: ["React", "Next.js", "TypeScript", "Flutter"] },
  { category: "Cloud & AWS",   items: ["IoT Core", "Lambda", "ECS", "EC2", "S3", "RDS", "API Gateway", "CloudFormation", "CloudWatch", "Cognito"] },
  { category: "Databases",     items: ["PostgreSQL", "MongoDB", "MySQL", "DynamoDB", "Redis", "OpenSearch", "Realm DB", "Neo4j"] },
  { category: "Messaging",     items: ["RabbitMQ", "Kafka", "MQTT", "SQS/SNS", "Celery"] },
  { category: "DevOps",        items: ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "Jenkins", "ELK Stack", "Prometheus", "Grafana"] },
  { category: "Architecture",  items: ["Microservices", "Multi-tenant SaaS", "BPMN/Camunda", "Fiware", "DDD", "RBAC", "gRPC"] },
];

export const experience = [
  {
    company: "InnoBit Systems LLC",
    role: "Technical Lead",
    duration: "Jul 2023 – Present",
    location: "Noida, India",
    projects: [
      {
        name: "Golden Batch Analytics — ML Optimisation Platform",
        period: "Nov 2025 – Present",
        team: 3,
        bullets: [
          "Engineered end-to-end Python ML optimisation framework for manufacturing quality targets — 8–12% quality improvement in first 3 months.",
          "Automated model retraining lifecycle from days of manual effort to under 2 hours via MLflow drift detection; sustained 15–20% gain in prediction accuracy.",
          "Architected constraint-aware optimisation (Optuna TPE, Differential Evolution) with Kedro pipeline orchestration.",
        ],
      },
      {
        name: "AfterMarket — Multi-Tenant SaaS Platform",
        period: "Jul 2025 – Nov 2025",
        team: 10,
        bullets: [
          "Led Spring Boot + NestJS backend architecture for multi-tenant SaaS — 99.9% API availability, p95 under 200ms.",
          "Cut time-to-market for new tenant environments from 4 days to under 24 hours via Terraform IaC and GitHub Actions CI/CD.",
          "Designed PCI-compliant PayPal billing, Keycloak RBAC, and OpenSearch full-text search on MySQL transactional data.",
        ],
      },
      {
        name: "StruXure+ — IoT Device Ecosystem",
        period: "Mar 2025 – Dec 2025",
        team: 3,
        bullets: [
          "Reduced IoT engineering maintenance costs by 90% via AWS Secure Tunnels — eliminated on-site intervention.",
          "Delivered Alexa skill integration driving 30% uplift in end-user engagement; managed AWS PCA certificate lifecycle.",
          "Full IaC deployment on AWS IoT Core, Lambda, API Gateway, S3, CloudFormation using Serverless Framework.",
        ],
      },
      {
        name: "Smart City Management Platform",
        period: "Nov 2024 – Mar 2025",
        team: 7,
        bullets: [
          "Designed IoT operations platform (Node.js, React, PostgreSQL, MongoDB, MQTT) using Fiware framework with Camunda BPMN engine.",
          "Integrated ERPNext for resource management; modular architecture enabling independent feature delivery across city service domains.",
        ],
      },
      {
        name: "CubeSat Mission Control — Genmat-01",
        period: "Jul 2023 – Dec 2024",
        team: 7,
        bullets: [
          "Directed TT&C mission control for Genmat-01 CubeSat — Python/Flask, FastAPI, PostgreSQL, MongoDB, Spring Boot/Orekit orbital APIs.",
          "Built LangChain RAG knowledge base over Neo4j vector DB — operators query multi-step satellite command sequences via LLM.",
          "Integrated ELK Stack for real-time telemetry ingestion; contributed to hyperspectral mineral classification ML pipeline.",
        ],
      },
    ],
  },
  {
    company: "InnoBit Systems LLC",
    role: "Senior Technical Staff Member",
    duration: "May 2022 – Jul 2023",
    location: "Noida, India",
    projects: [
      {
        name: "Family Health Pro — Health Monitoring Platform",
        period: "Apr 2023 – Jul 2023",
        team: 7,
        bullets: [
          "Scaled platform to 3,000+ customers; architected IoT-based elderly health monitoring on Node.js modular monolith with gRPC-ready interfaces.",
        ],
      },
      {
        name: "RFID Warehouse Management System",
        period: "Oct 2022 – Apr 2023",
        team: 10,
        bullets: [
          "Delivered Android/Kotlin app with Realm DB offline-first architecture for RFID/NFC/barcode supply chain workflows on weak-connection warehouse devices.",
          "Shipped MongoDB backend with WebSocket APIs for real-time inventory sync.",
        ],
      },
    ],
  },
  {
    company: "InnoBit Systems LLC",
    role: "Backend Software Developer",
    duration: "Mar 2021 – May 2022",
    location: "Noida, India",
    projects: [
      {
        name: "Smart Library SaaS",
        period: "Mar 2021 – May 2022",
        team: null,
        bullets: [
          "Built Node.js/ExpressJS microservice backend — 15+ library installations, 1–2M events/day via RabbitMQ.",
          "Owned AWS deployment (EC2, SNS, SES, S3, Cognito) with full observability from day one.",
        ],
      },
    ],
  },
  {
    company: "InnoBit Systems LLC",
    role: "Mobile Application Developer",
    duration: "Feb 2020 – Mar 2021",
    location: "Noida, India",
    projects: [
      {
        name: "Mobile Applications",
        period: "Feb 2020 – Mar 2021",
        team: null,
        bullets: [
          "Developed Android e-commerce app for books — full mobile SDLC from design to production.",
          "Delivered warehouse management app in React Native.",
        ],
      },
    ],
  },
];

export const projects = [
  
  {
    name: "CubeSat Mission Control",
    icon: "🛸",
    description: "TT&C mission control for Genmat-01 CubeSat with RAG knowledge base — ground operators query multi-step satellite command sequences via LLM over Neo4j vector DB.",
    tags: ["Python", "Flask", "FastAPI", "LangChain", "Neo4j", "ELK Stack"],
    link: "/projects/cubesat",
    highlight: true,
    period: "Jul 2023 – Dec 2024",
    role: "Technical Lead",
    highlights: [
      "Directed TT&C mission control for Genmat-01 CubeSat with Python/Flask, FastAPI, Spring Boot/Orekit",
      "LangChain RAG over Neo4j vector DB — operators query multi-step satellite command sequences via LLM",
      "Real-time telemetry ingestion via ELK Stack; hyperspectral mineral classification ML pipeline",
    ],
  },
  {
    name: "Smart Library SaaS",
    icon: "📚",
    description: "Live operations center for 15+ library installations processing 1–2M events/day via RabbitMQ. Multi-branch dashboard with real-time event stream, kiosk monitoring, and RabbitMQ routing visualisation.",
    tags: ["Node.js", "ExpressJS", "RabbitMQ", "AWS", "PostgreSQL", "WebSocket"],
    link: "/projects/library",
    highlight: false,
    period: "Mar 2021 – May 2022",
    role: "Backend Software Developer",
    highlights: [
      "1–2M events/day via RabbitMQ across 15+ library installations with smart kiosks and gates",
      "Full AWS deployment — EC2, SNS, SES, S3, Cognito — owned and operated from day one",
      "WebSocket real-time sync, PostgreSQL persistence, RBAC-secured REST APIs",
    ],
  },
  {
    name: "Loan Genie",
    icon: "💳",
    description: "AI-powered loan approval pipeline — 90%+ accuracy across 6 XGBoost models. RAG document processing via LlamaIndex/LlamaParse. Weeks-to-minutes processing time.",
    tags: ["FastAPI", "XGBoost", "LangChain", "LlamaIndex", "Groq API", "Celery", "ZenML"],
    link: "/projects/loan-genie",
    highlight: false,
    period: "Portfolio Project",
    highlights: [
      "90%+ approval accuracy across 6 XGBoost models trained on diverse loan application profiles",
      "RAG document pipeline via LlamaIndex/LlamaParse — reduces manual review from weeks to minutes",
      "Live Claude AI scorer below — submit real parameters and get an instant structured assessment",
    ],
  },
  {
    name: "Enterprise Demand Forecasting",
    icon: "📈",
    description: "50+ stores, 10K+ SKUs, 200K+ daily transactions. LightGBM → TFT upgrade delivering $2M+ annual savings, 92% stockout reduction, 35% accuracy improvement.",
    tags: ["Python", "LightGBM", "TFT", "Kedro", "MLflow", "Docker", "Kubernetes"],
    link: "/projects/demand-forecasting",
    highlight: false,
    period: "Portfolio Project",
    highlights: [
      "$2M+ annual savings from LightGBM → Temporal Fusion Transformer upgrade across 50+ stores",
      "92% stockout reduction and 35% accuracy improvement on 200K+ daily transactions",
      "Kedro + MLflow orchestration for reproducible, auditable ML pipelines at retail scale",
    ],
  },
  {
    name: "Smart City IoT Platform",
    icon: "🏙️",
    description: "City-scale IoT operations platform using Fiware framework with Camunda BPMN workflow engine. Node.js, React, PostgreSQL, MongoDB, MQTT.",
    tags: ["Node.js", "React", "Fiware", "Camunda", "MQTT", "MongoDB"],
    link: "/projects/city-iot",
    highlight: false,
    period: "Nov 2024 – Mar 2025",
    role: "Technical Lead",
    team: 7,
    highlights: [
      "City-scale IoT using Fiware framework + Camunda BPMN — air, traffic, energy, CCTV, noise sensors",
      "MQTT data ingestion from heterogeneous device networks; ERPNext integration for resource management",
      "Modular architecture enabling independent delivery across city service domains",
    ],
  },
  {
    name: "Golden Batch Optimiser",
    icon: "⚗️",
    description: "Manufacturing ML optimisation — recommends controllables for target product quality. 8–12% quality improvement. Optuna TPE + Differential Evolution, Kedro orchestration.",
    tags: ["Python", "Optuna", "MLflow", "Kedro", "XGBoost"],
    link: "/projects/golden-batch",
    highlight: false,
    period: "Nov 2025 – Present",
    role: "Technical Lead",
    team: 3,
    highlights: [
      "8–12% quality improvement in first 3 months via constraint-aware Optuna TPE optimisation",
      "Automated model retraining lifecycle from days of manual effort to under 2 hours via MLflow",
      "Kedro pipeline orchestration for reproducible batch recommendation across production runs",
    ],
  },
  {
    name: "RFID Warehouse System",
    icon: "📦",
    description: "Offline-first Android warehouse management with Realm DB — RFID, NFC, and barcode scanning on weak-connection devices with automatic conflict-resolution sync to MongoDB.",
    tags: ["Kotlin", "Android", "Realm DB", "MongoDB", "WebSocket", "RFID", "NFC"],
    link: null,
    highlight: false,
    period: "Oct 2022 – Apr 2023",
    role: "Senior Technical Staff Member",
    team: 10,
    highlights: [
      "Offline-first architecture with Realm DB — full functionality in dead-zone warehouse environments",
      "RFID, NFC, and barcode scanning with WebSocket real-time sync back to MongoDB on reconnect",
      "Delivered across full mobile SDLC for a 10-person team on Android/Kotlin and React Native",
    ],
  },
  {
    name: "StruXure+ IoT Ecosystem",
    icon: "🔌",
    description: "AWS IoT device ecosystem — Alexa skill integration, AWS Secure Tunnels eliminating on-site maintenance, full IaC on IoT Core, Lambda, API Gateway, and CloudFormation.",
    tags: ["AWS IoT Core", "Lambda", "Alexa SDK", "CloudFormation", "Serverless", "Node.js"],
    link: null,
    highlight: false,
    period: "Mar 2025 – Dec 2025",
    role: "Technical Lead",
    team: 3,
    highlights: [
      "90% reduction in IoT maintenance costs via AWS Secure Tunnels — eliminated on-site interventions",
      "Alexa skill driving 30% uplift in end-user engagement; full AWS PCA certificate lifecycle management",
      "Full IaC deployment with Serverless Framework across IoT Core, Lambda, API Gateway, S3",
    ],
  },
];

export const education = [
  {
    degree: "B.Tech – Computer Science & Engineering",
    institution: "Nitra Technical Campus, Ghaziabad (AKTU)",
    year: "2020",
  },
];

export type NodeType = "device" | "service" | "frontend" | "database" | "queue" | "ai" | "ml" | "cloud";

export interface ArchNode { id: string; label: string; type: NodeType; x: number; y: number }
export interface ArchEdge { from: string; to: string; label: string }

export interface ProjectDetail {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  year: string;
  role: string;
  techStack: string[];
  metrics: { label: string; value: string; detail: string }[];
  overview: string[];
  architecture: { nodes: ArchNode[]; edges: ArchEdge[] };
}

// Ordered navigation sequence
export const PROJECT_NAV_ORDER = [
  { slug: "library-saas",        href: "/projects/library",            name: "Smart Library SaaS",           icon: "📚" },
  { slug: "cubesat",             href: "/projects/cubesat",            name: "CubeSat Mission Control",       icon: "🛸" },
  { slug: "loan-genie",          href: "/projects/loan-genie",         name: "Loan Genie",                   icon: "💳" },
  { slug: "golden-batch",        href: "/projects/golden-batch",       name: "Golden Batch Analytics",        icon: "⚗️" },
  { slug: "city-iot",            href: "/projects/city-iot",           name: "Smart City IoT Platform",       icon: "🏙️" },
  { slug: "demand-forecasting",  href: "/projects/demand-forecasting", name: "Enterprise Demand Forecasting", icon: "📈" },
];

export const projectDetails: Record<string, ProjectDetail> = {
  "library-saas": {
    slug: "library-saas",
    name: "Smart Library SaaS",
    icon: "📚",
    tagline: "Event-driven operations platform processing 1–2M events/day across 15+ library installations",
    year: "2021–2022",
    role: "Backend Software Developer → sole backend owner",
    techStack: ["Node.js", "ExpressJS", "RabbitMQ", "PostgreSQL", "AWS EC2", "SNS", "SES", "Cognito", "WebSocket", "RBAC"],
    metrics: [
      { label: "Events/day", value: "2M+", detail: "via RabbitMQ event-driven architecture" },
      { label: "Installations", value: "15+", detail: "library sites onboarded" },
      { label: "Uptime", value: "99.9%", detail: "AWS EC2 + CloudWatch observability" },
      { label: "Latency", value: "<50ms", detail: "p95 event processing time" },
    ],
    overview: [
      "Built the backend infrastructure for a multi-site smart library management system deployed across 15+ library installations. Each site had smart kiosks for book checkout/return and RFID gates for member entry/exit — all generating a continuous stream of events that needed to be processed, stored, and acted on in real time.",
      "The core challenge was throughput: at peak, the system processed 1–2 million events per day across all installations. A RabbitMQ event-driven architecture was chosen over direct database writes — events were published to exchanges, routed to processing queues, and consumed by workers that handled persistence, notifications, and reporting asynchronously.",
      "AWS Cognito handled multi-tenant authentication with RBAC — each library admin could only see their own installation's data. A custom dynamic reporting service let library managers generate usage reports without touching the engineering team.",
    ],
    architecture: {
      nodes: [
        { id: "kiosk",   label: "Smart Kiosk",    type: "device",   x: 40,  y: 160 },
        { id: "gate",    label: "RFID Gate",       type: "device",   x: 40,  y: 280 },
        { id: "cognito", label: "AWS Cognito",     type: "cloud",    x: 200, y: 80  },
        { id: "api",     label: "Express API",     type: "service",  x: 200, y: 220 },
        { id: "mq",      label: "RabbitMQ",        type: "queue",    x: 380, y: 220 },
        { id: "worker",  label: "Event Worker",    type: "service",  x: 560, y: 160 },
        { id: "notif",   label: "SNS / SES",       type: "cloud",    x: 560, y: 300 },
        { id: "db",      label: "PostgreSQL",      type: "database", x: 740, y: 160 },
        { id: "report",  label: "Report Service",  type: "service",  x: 740, y: 300 },
      ],
      edges: [
        { from: "kiosk",   to: "api",    label: "HTTP"    },
        { from: "gate",    to: "api",    label: "HTTP"    },
        { from: "cognito", to: "api",    label: "Auth"    },
        { from: "api",     to: "mq",     label: "Publish" },
        { from: "mq",      to: "worker", label: "Consume" },
        { from: "worker",  to: "db",     label: "Persist" },
        { from: "worker",  to: "notif",  label: "Notify"  },
        { from: "db",      to: "report", label: "Query"   },
      ],
    },
  },

  "cubesat": {
    slug: "cubesat",
    name: "CubeSat Mission Control",
    icon: "🛸",
    tagline: "TT&C mission control for Genmat-01 CubeSat with LangChain RAG over Neo4j satellite command library",
    year: "2023–2024",
    role: "Technical Lead, team of 5–7",
    techStack: ["Python", "Flask", "FastAPI", "LangChain", "Neo4j", "PostgreSQL", "MongoDB", "Spring Boot", "Orekit", "ELK Stack"],
    metrics: [
      { label: "Mission",        value: "Genmat-01", detail: "CubeSat orbital spectra payload"         },
      { label: "RAG Source",     value: "Neo4j",     detail: "vector DB over satellite command library" },
      { label: "Telemetry",      value: "ELK Stack", detail: "real-time ingestion + monitoring"         },
      { label: "Orbital Engine", value: "Orekit",    detail: "Spring Boot orbital prediction APIs"      },
    ],
    overview: [
      "Mission control software for Genmat-01, a CubeSat carrying a hyperspectral imaging payload for mineral classification. The system handles the full TT&C (Telemetry, Tracking and Command) loop — ground station operators use it to monitor satellite health, plan passes, uplink command sequences, and analyse downlinked payload data.",
      "The most novel component is the RAG-based command assistant. Satellite command sequences are complex, multi-step, and safety-critical — an operator planning an imaging pass might need to consult 15–20 documents covering power budgets, antenna pointing constraints, payload warm-up sequences, and downlink windows. Rather than searching PDFs manually, operators query a LangChain agent backed by a Neo4j vector database containing the full command library.",
      "Orbital prediction runs via Spring Boot microservices wrapping Orekit (the European Space Agency's open-source orbital mechanics library). The Flask primary backend coordinates telemetry ingestion through ELK Stack, while a FastAPI service handles the ML inference pipeline for hyperspectral mineral classification.",
    ],
    architecture: {
      nodes: [
        { id: "sat",      label: "Genmat-01 CubeSat",  type: "device",   x: 40,  y: 220 },
        { id: "ground",   label: "Ground Station",      type: "device",   x: 200, y: 220 },
        { id: "flask",    label: "Flask Backend",        type: "service",  x: 380, y: 160 },
        { id: "elk",      label: "ELK Stack",            type: "service",  x: 380, y: 300 },
        { id: "orekit",   label: "Orekit/Spring Boot",  type: "service",  x: 560, y: 100 },
        { id: "fastapi",  label: "FastAPI Inference",   type: "service",  x: 560, y: 240 },
        { id: "langchain",label: "LangChain Agent",     type: "ai",       x: 560, y: 360 },
        { id: "neo4j",    label: "Neo4j Vector DB",     type: "database", x: 740, y: 360 },
        { id: "pg",       label: "PostgreSQL",          type: "database", x: 740, y: 160 },
        { id: "mongo",    label: "MongoDB",             type: "database", x: 740, y: 260 },
        { id: "ui",       label: "Mission Control UI",  type: "frontend", x: 900, y: 200 },
      ],
      edges: [
        { from: "sat",      to: "ground",    label: "RF Link"      },
        { from: "ground",   to: "flask",     label: "Telemetry"    },
        { from: "ground",   to: "elk",       label: "Ingest"       },
        { from: "flask",    to: "orekit",    label: "Predict"      },
        { from: "flask",    to: "fastapi",   label: "Classify"     },
        { from: "flask",    to: "langchain", label: "Query"        },
        { from: "langchain",to: "neo4j",     label: "Vector search"},
        { from: "flask",    to: "pg",        label: "Store"        },
        { from: "flask",    to: "mongo",     label: "Store"        },
        { from: "flask",    to: "ui",        label: "REST/WS"      },
      ],
    },
  },

  "loan-genie": {
    slug: "loan-genie",
    name: "Loan Genie",
    icon: "💳",
    tagline: "AI-powered loan approval pipeline — weeks to minutes, 90%+ accuracy across 6 XGBoost models",
    year: "2024",
    role: "Lead Engineer",
    techStack: ["FastAPI", "XGBoost", "LangChain", "LlamaIndex", "LlamaParse", "Groq API", "Celery", "Redis", "ZenML", "Docker"],
    metrics: [
      { label: "Processing Time", value: "Minutes", detail: "down from weeks of manual review"        },
      { label: "Accuracy",        value: "90%+",    detail: "across 6 XGBoost model ensemble"         },
      { label: "Models",          value: "6",       detail: "approval, fraud, eligibility + sub-scores"},
      { label: "Compliance",      value: "GDPR",    detail: "encrypted storage + audit logging"        },
    ],
    overview: [
      "Loan Genie replaces the weeks-long manual loan review process with an AI pipeline that takes an applicant's uploaded documents and returns a structured approval decision in minutes. The system combines traditional ML (XGBoost) for scoring with LLM-based document understanding for extraction.",
      "The pipeline has two phases. First, LlamaParse extracts structured data from uploaded loan documents (pay slips, bank statements, ITR filings) — documents that come in inconsistent formats across applicants. LangChain orchestrates the extraction workflow with fallback strategies when document quality is poor.",
      "Second, the extracted data feeds six XGBoost models: primary approval, fraud risk, income eligibility, debt-to-income ratio, employment stability, and credit behaviour. Each model produces a score and confidence interval. A final ensemble layer combines them into a human-readable decision — surfaced via Groq API for natural language reasoning.",
    ],
    architecture: {
      nodes: [
        { id: "upload",   label: "Document Upload",  type: "frontend", x: 40,  y: 220 },
        { id: "fastapi",  label: "FastAPI",           type: "service",  x: 200, y: 220 },
        { id: "redis",    label: "Redis Queue",       type: "queue",    x: 380, y: 300 },
        { id: "celery",   label: "Celery Worker",     type: "service",  x: 380, y: 160 },
        { id: "llama",    label: "LlamaParse",        type: "ai",       x: 560, y: 100 },
        { id: "langchain",label: "LangChain",         type: "ai",       x: 560, y: 220 },
        { id: "xgb",      label: "6× XGBoost",        type: "ml",       x: 560, y: 340 },
        { id: "groq",     label: "Groq API",          type: "ai",       x: 740, y: 160 },
        { id: "zenml",    label: "ZenML",             type: "service",  x: 740, y: 300 },
        { id: "result",   label: "Decision API",      type: "service",  x: 900, y: 220 },
      ],
      edges: [
        { from: "upload",    to: "fastapi",   label: "POST"       },
        { from: "fastapi",   to: "redis",     label: "Enqueue"    },
        { from: "redis",     to: "celery",    label: "Dequeue"    },
        { from: "celery",    to: "llama",     label: "Extract"    },
        { from: "celery",    to: "langchain", label: "Orchestrate"},
        { from: "langchain", to: "xgb",       label: "Score"      },
        { from: "langchain", to: "groq",      label: "Explain"    },
        { from: "xgb",       to: "result",    label: "Ensemble"   },
        { from: "groq",      to: "result",    label: "Narrate"    },
        { from: "zenml",     to: "xgb",       label: "Version"    },
      ],
    },
  },

  "golden-batch": {
    slug: "golden-batch",
    name: "Golden Batch Analytics",
    icon: "⚗️",
    tagline: "ML optimisation platform recommending manufacturing controllables for target product quality",
    year: "2025–Present",
    role: "Technical Lead, team of 3",
    techStack: ["Python", "XGBoost", "Optuna", "Differential Evolution", "Kedro", "MLflow", "FastAPI", "ZenML"],
    metrics: [
      { label: "Quality Improvement", value: "8–12%",      detail: "within first 3 months"                          },
      { label: "Accuracy Gain",       value: "15–20%",     detail: "sustained AUC/F1 improvement"                   },
      { label: "Retraining Time",     value: "<2hrs",      detail: "down from days of manual effort"                },
      { label: "Optimiser",           value: "Optuna TPE", detail: "+ Differential Evolution parallel search"       },
    ],
    overview: [
      "Golden Batch is an ML optimisation platform built for a manufacturing client. The goal: given a target product quality specification, recommend the optimal values for controllable process parameters (temperatures, pressures, blend ratios, timing) that will achieve it. Think of it as reverse ML — instead of predicting quality from inputs, it searches the input space to find what produces a target quality.",
      "The platform has two layers. An XGBoost quality prediction model is trained on historical batch records — it learns the relationship between controllables and output quality metrics. Optuna TPE (Tree-structured Parzen Estimator) and Differential Evolution then use this model as an objective function, searching the feasible parameter space under real manufacturing constraints (equipment limits, safety ranges, blend compatibility).",
      "Kedro pipelines orchestrate the full lifecycle: data ingestion → feature engineering → model training → optimisation run → recommendation generation. MLflow tracks every experiment, model version, and drift metric. When drift is detected, automated retraining kicks off — cutting what used to be days of manual analyst work to under two hours.",
    ],
    architecture: {
      nodes: [
        { id: "data",        label: "Batch Records",      type: "database", x: 40,  y: 220 },
        { id: "kedro",       label: "Kedro Pipeline",     type: "service",  x: 200, y: 220 },
        { id: "features",    label: "Feature Eng.",       type: "service",  x: 380, y: 140 },
        { id: "xgb",         label: "XGBoost Model",      type: "ml",       x: 380, y: 300 },
        { id: "mlflow",      label: "MLflow",             type: "service",  x: 560, y: 140 },
        { id: "optuna",      label: "Optuna TPE",         type: "ml",       x: 560, y: 260 },
        { id: "de",          label: "Diff. Evolution",    type: "ml",       x: 560, y: 360 },
        { id: "constraints", label: "Constraints",        type: "service",  x: 740, y: 260 },
        { id: "api",         label: "FastAPI",            type: "service",  x: 880, y: 220 },
      ],
      edges: [
        { from: "data",     to: "kedro",       label: "Ingest"       },
        { from: "kedro",    to: "features",    label: "Engineer"     },
        { from: "kedro",    to: "xgb",         label: "Train"        },
        { from: "xgb",      to: "mlflow",      label: "Track"        },
        { from: "xgb",      to: "optuna",      label: "Objective fn" },
        { from: "xgb",      to: "de",          label: "Objective fn" },
        { from: "optuna",   to: "constraints", label: "Validate"     },
        { from: "de",       to: "constraints", label: "Validate"     },
        { from: "constraints",to: "api",       label: "Recommend"    },
        { from: "mlflow",   to: "kedro",       label: "Drift→retrain"},
      ],
    },
  },

  "city-iot": {
    slug: "city-iot",
    name: "Smart City IoT Platform",
    icon: "🏙️",
    tagline: "City-scale IoT operations platform with MQTT device mesh and Camunda BPMN workflow engine",
    year: "2024–2025",
    role: "Technical Lead, team of 5–7",
    techStack: ["Node.js", "React", "PostgreSQL", "MongoDB", "MQTT", "Fiware", "Camunda BPMN", "ERPNext", "AWS IoT Core"],
    metrics: [
      { label: "Device Types",    value: "6",       detail: "traffic, weather, waste, lights, air, water" },
      { label: "Workflow Engine", value: "Camunda", detail: "BPMN dynamic O&M workflows"                  },
      { label: "Data Stores",     value: "2",       detail: "PostgreSQL + MongoDB hybrid"                  },
      { label: "Framework",       value: "Fiware",  detail: "open smart city standard"                    },
    ],
    overview: [
      "Designed and delivered a smart city IoT operations platform for city O&M (operations and maintenance) teams. The platform ingests telemetry from thousands of field devices — traffic sensors, weather stations, waste bins, street lights, air quality monitors, and water meters — and surfaces actionable insights to city operations staff.",
      "Device communication runs over MQTT with AWS IoT Core managing secure device connections, certificate rotation, and message routing. The Fiware framework (an EU open-source smart city standard) provides the data context broker layer — devices publish to Fiware entities, and the platform subscribes to entity changes.",
      "The most technically interesting piece was the Camunda BPMN integration. Rather than hardcoding response workflows (e.g. 'if waste bin > 80% full, dispatch collection'), city administrators could design and deploy their own BPMN workflows through a visual editor. A waste alert could trigger a multi-step process: notify supervisor → wait for acknowledgment → dispatch vehicle → confirm completion.",
    ],
    architecture: {
      nodes: [
        { id: "devices",  label: "IoT Devices",           type: "device",   x: 40,  y: 220 },
        { id: "mqtt",     label: "MQTT Broker",           type: "queue",    x: 200, y: 220 },
        { id: "iotcore",  label: "AWS IoT Core",          type: "cloud",    x: 200, y: 100 },
        { id: "fiware",   label: "Fiware Context Broker", type: "service",  x: 380, y: 220 },
        { id: "api",      label: "Node.js API",           type: "service",  x: 560, y: 160 },
        { id: "camunda",  label: "Camunda BPMN",          type: "service",  x: 560, y: 300 },
        { id: "pg",       label: "PostgreSQL",            type: "database", x: 740, y: 120 },
        { id: "mongo",    label: "MongoDB",               type: "database", x: 740, y: 240 },
        { id: "erp",      label: "ERPNext",               type: "service",  x: 740, y: 360 },
        { id: "ui",       label: "React Dashboard",       type: "frontend", x: 920, y: 160 },
      ],
      edges: [
        { from: "devices",  to: "mqtt",    label: "Publish"   },
        { from: "devices",  to: "iotcore", label: "TLS/MQTT"  },
        { from: "mqtt",     to: "fiware",  label: "Subscribe" },
        { from: "iotcore",  to: "fiware",  label: "Route"     },
        { from: "fiware",   to: "api",     label: "Notify"    },
        { from: "api",      to: "camunda", label: "Trigger"   },
        { from: "api",      to: "pg",      label: "Write"     },
        { from: "api",      to: "mongo",   label: "Write"     },
        { from: "camunda",  to: "erp",     label: "Dispatch"  },
        { from: "api",      to: "ui",      label: "REST/WS"   },
      ],
    },
  },

  "demand-forecasting": {
    slug: "demand-forecasting",
    name: "Enterprise Demand Forecasting",
    icon: "📈",
    tagline: "$2M+ annual savings — LightGBM → TFT upgrade across 50+ stores, 10K+ SKUs",
    year: "2023–2024",
    role: "Lead ML Engineer",
    techStack: ["Python", "LightGBM", "Temporal Fusion Transformer", "PyTorch", "Kedro", "MLflow", "FastAPI", "Docker", "Kubernetes"],
    metrics: [
      { label: "Annual Savings",    value: "$2M+", detail: "inventory optimisation"              },
      { label: "Stockout Reduction",value: "92%",  detail: "across 50+ stores"                  },
      { label: "Forecast Accuracy", value: "+35%", detail: "LightGBM → TFT improvement"         },
      { label: "Scale",             value: "6M+",  detail: "historical records, 200K+ daily txn" },
    ],
    overview: [
      "Enterprise demand forecasting system for a retail client with 50+ stores and 10,000+ SKUs. The problem: inaccurate demand forecasts were causing both stockouts (losing sales) and overstock (tying up capital). The client needed forecasts at store-SKU level, 8 weeks ahead, updated weekly.",
      "Phase 1 delivered a LightGBM model with 120+ engineered features: lag features, rolling statistics, calendar effects, promotions, store demographics, regional events, and weather. This achieved R² of 0.88 and SMAPE of 12–18% — a significant improvement over the client's existing statistical methods.",
      "Phase 2 upgraded the core model to a Temporal Fusion Transformer — a PyTorch architecture specifically designed for multi-horizon time series with mixed static and time-varying inputs. TFT's attention mechanism learns which historical windows matter most per SKU, handling the intermittent demand patterns that LightGBM struggled with. The result: wMAPE of 17.58%, a 4.3 pp improvement, translating to $2M+ annual savings and 92% stockout reduction.",
    ],
    architecture: {
      nodes: [
        { id: "data",    label: "Transaction Data",   type: "database", x: 40,  y: 220 },
        { id: "kedro",   label: "Kedro Pipeline",     type: "service",  x: 200, y: 220 },
        { id: "features",label: "120+ Features",      type: "service",  x: 380, y: 140 },
        { id: "lgbm",    label: "LightGBM",           type: "ml",       x: 560, y: 100 },
        { id: "tft",     label: "TFT (PyTorch)",      type: "ml",       x: 560, y: 240 },
        { id: "mlflow",  label: "MLflow",             type: "service",  x: 380, y: 320 },
        { id: "api",     label: "FastAPI",            type: "service",  x: 740, y: 170 },
        { id: "k8s",     label: "Kubernetes",         type: "cloud",    x: 740, y: 300 },
        { id: "prom",    label: "Prometheus/Grafana", type: "service",  x: 900, y: 300 },
        { id: "ui",      label: "Forecast Dashboard", type: "frontend", x: 900, y: 170 },
      ],
      edges: [
        { from: "data",    to: "kedro",   label: "Ingest"   },
        { from: "kedro",   to: "features",label: "Engineer" },
        { from: "features",to: "lgbm",   label: "Train"    },
        { from: "features",to: "tft",    label: "Train"    },
        { from: "lgbm",    to: "mlflow", label: "Track"    },
        { from: "tft",     to: "mlflow", label: "Track"    },
        { from: "tft",     to: "api",    label: "Serve"    },
        { from: "api",     to: "k8s",    label: "Deploy"   },
        { from: "k8s",     to: "prom",   label: "Metrics"  },
        { from: "api",     to: "ui",     label: "Forecasts"},
        { from: "mlflow",  to: "kedro",  label: "Drift→retrain"},
      ],
    },
  },

  "satellite": {
    slug: "satellite",
    name: "Satellite Tracker",
    icon: "🛰️",
    tagline: "Real-time SGP4 orbital propagation — 18 satellites, Mercator ground track, live TLE data",
    year: "2024",
    role: "Portfolio Project",
    techStack: ["Next.js", "satellite.js", "TypeScript", "Canvas 2D", "SGP4", "TLE"],
    metrics: [
      { label: "Satellites",    value: "18",    detail: "tracked simultaneously via SGP4"         },
      { label: "Update Rate",   value: "1s",    detail: "real-time orbital propagation"           },
      { label: "Orbit Types",   value: "3",     detail: "LEO · MEO · GEO"                         },
      { label: "Propagation",   value: "SGP4",  detail: "Simplified General Perturbations model"   },
    ],
    overview: [
      "A real-time satellite tracker built with satellite.js — an implementation of the SGP4 orbital propagation algorithm that computes satellite positions from TLE (Two-Line Element) data. The tracker renders 18 satellites on a Mercator projection, updating every second.",
      "The SGP4 algorithm models a satellite's orbit accounting for atmospheric drag, Earth's oblateness, and solar/lunar gravitational perturbations. Given a TLE set (the standard format for representing an orbit), it can predict where a satellite will be at any future time.",
      "Each satellite is rendered with its ground track projected onto a 2D world map. Click any satellite to inspect live position — latitude, longitude, altitude, orbital velocity, and orbital type (LEO/MEO/GEO).",
    ],
    architecture: {
      nodes: [
        { id: "tle",     label: "TLE Data",         type: "database", x: 40,  y: 200 },
        { id: "satjs",   label: "satellite.js SGP4", type: "service",  x: 220, y: 200 },
        { id: "worker",  label: "Propagation Loop",  type: "service",  x: 400, y: 200 },
        { id: "canvas",  label: "Canvas 2D",         type: "frontend", x: 580, y: 140 },
        { id: "mercator",label: "Mercator Projection",type: "service", x: 580, y: 280 },
        { id: "ui",      label: "Tracker UI",        type: "frontend", x: 760, y: 200 },
      ],
      edges: [
        { from: "tle",      to: "satjs",    label: "Parse"     },
        { from: "satjs",    to: "worker",   label: "Propagate" },
        { from: "worker",   to: "canvas",   label: "Position"  },
        { from: "worker",   to: "mercator", label: "Project"   },
        { from: "canvas",   to: "ui",       label: "Render"    },
        { from: "mercator", to: "ui",       label: "Map"       },
      ],
    },
  },
};
