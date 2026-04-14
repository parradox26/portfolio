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
    name: "Satellite Tracker",
    description: "Real-time 3D orbital tracker for 6,000+ active satellites using live TLE data from Celestrak. SGP4 propagation, CesiumJS globe, pass prediction.",
    tags: ["Next.js", "CesiumJS", "satellite.js", "Three.js", "TypeScript"],
    link: "/satellite",
    highlight: true,
  },
  {
    name: "CubeSat Mission Control",
    description: "TT&C mission control for Genmat-01 CubeSat with RAG knowledge base — ground operators query multi-step satellite command sequences via LLM over Neo4j vector DB.",
    tags: ["Python", "Flask", "FastAPI", "LangChain", "Neo4j", "ELK Stack"],
    link: null,
    highlight: false,
  },
  {
    name: "Loan Genie",
    description: "AI-powered loan approval pipeline — 90%+ accuracy across 6 XGBoost models. RAG document processing via LlamaIndex/LlamaParse. Weeks-to-minutes processing time.",
    tags: ["FastAPI", "XGBoost", "LangChain", "LlamaIndex", "Groq API", "Celery", "ZenML"],
    link: null,
    highlight: false,
  },
  {
    name: "Enterprise Demand Forecasting",
    description: "50+ stores, 10K+ SKUs, 200K+ daily transactions. LightGBM → TFT upgrade delivering $2M+ annual savings, 92% stockout reduction, 35% accuracy improvement.",
    tags: ["Python", "LightGBM", "TFT", "Kedro", "MLflow", "Docker", "Kubernetes"],
    link: null,
    highlight: false,
  },
  {
    name: "Smart City IoT Platform",
    description: "City-scale IoT operations platform using Fiware framework with Camunda BPMN workflow engine. Node.js, React, PostgreSQL, MongoDB, MQTT.",
    tags: ["Node.js", "React", "Fiware", "Camunda", "MQTT", "MongoDB"],
    link: null,
    highlight: false,
  },
  {
    name: "Golden Batch Optimiser",
    description: "Manufacturing ML optimisation — recommends controllables for target product quality. 8–12% quality improvement. Optuna TPE + Differential Evolution, Kedro orchestration.",
    tags: ["Python", "Optuna", "MLflow", "Kedro", "XGBoost"],
    link: null,
    highlight: false,
  },
  {
    name: "RFID Warehouse System",
    description: "Offline-first Android app with Realm DB for warehouse supply chain — RFID, NFC, barcodes on weak-connection devices. Real-time MongoDB WebSocket sync.",
    tags: ["Kotlin", "Realm DB", "MongoDB", "WebSocket", "React Native"],
    link: null,
    highlight: false,
  },
];

export const education = [
  {
    degree: "B.Tech – Computer Science & Engineering",
    institution: "Nitra Technical Campus, Ghaziabad (AKTU)",
    year: "2020",
  },
];
