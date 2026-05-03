/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Cpu, 
  Code2, 
  Database, 
  Terminal, 
  Layers, 
  GraduationCap,
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";

// Types
interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
  type: 'web' | 'iot' | 'software';
}

const PROJECTS: Project[] = [
  {
    id: "smart-power",
    title: "Smart Power Analytics",
    desc: "Machine Learning platform for supervision of electrical networks: anomaly detection, predictive maintenance, and energy optimization.",
    tags: ["FastAPI", "InfluxDB", "MQTT", "React"],
    type: "iot"
  },
  {
    id: "drilling-mgmt",
    title: "Drilling Operations Tracker",
    desc: "Management software for tracking and planning drilling operations, developed with a robust OOP architecture.",
    tags: ["C++", "OOP", "Algorithms"],
    type: "software"
  },
  {
    id: "vehicle-rental",
    title: "EcoDrive Rental Platform",
    desc: "Full web application with reservation management, payments, and client portal for vehicle logistics.",
    tags: ["PHP", "JavaScript", "SQL", "Tailwind"],
    type: "web",
    demoUrl: "#"
  }
];

const SKILL_GROUPS = [
  {
    name: "Engineering & Dev",
    skills: ["Python", "C++", "JavaScript", "PHP", "Bash", "SQL", "C"]
  },
  {
    name: "Frameworks & Backend",
    skills: ["FastAPI", "Django", "Laravel", "React", "Next.js", "REST API", "Android Dev"]
  },
  {
    name: "IoT & Data Systems",
    skills: ["Modbus RTU/TCP", "MQTT TLS", "InfluxDB", "PostgreSQL", "MySQL", "Network Admin"]
  },
  {
    name: "Theory & Analysis",
    skills: ["Probability Theory", "Statistics", "Linear Algebra", "Numerical Analysis", "UML", "Information Theory"]
  }
];

export default function App() {
  const [activeProject, setActiveProject] = useState<Project | null>(PROJECTS[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100 } 
    }
  };

  const sketchBorder = "border-[1.5px] border-ink/40 rounded shadow-[4px_4px_0px_0px_rgba(30,33,36,0.05)]";

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-slate-100">
      
      {/* Hidden SVG Filters */}
      <svg className="hidden">
        <filter id="hand-drawn">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </svg>

      <motion.div 
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
        className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen"
      >
        
        {/* --- SIDEBAR --- */}
        <aside className="p-10 flex flex-col gap-12 bg-white border-r border-slate-100 relative">
          
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Main Profile Photo in Sidebar */}
            <div className="relative group w-40 h-40 -rotate-1 mx-auto lg:mx-0">
               <div className="bg-white border-[1px] border-ink/40 p-1.5 pb-6 shadow-xl relative" style={{ filter: 'url(#hand-drawn)' }}>
                  <div className="aspect-square overflow-hidden border border-ink/10 grayscale contrast-125">
                    <img 
                      src="/src/profile.jpg" 
                      alt="Baye Mor Gaye"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                         (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300";
                      }}
                    />
                  </div>
                  <div className="absolute bottom-1 left-0 w-full text-center">
                    <span className="font-sketch text-[8px] text-slate-400 opacity-60">Verified_GAYENSIS</span>
                  </div>
               </div>
               {/* Sketchy shadow element */}
               <div className="absolute -inset-1 border border-dashed border-ink/10 -rotate-2 -z-10 pointer-events-none" />
            </div>

            <div className="relative space-y-2">
              <h1 className="text-4xl font-display italic leading-[0.9] text-slate-900">
                Baye Mor <br />
                <span className="font-hand text-slate-600 not-italic text-5xl">Gaye</span>
              </h1>
              <div className="absolute -bottom-2 left-0 w-12 h-[2px] bg-ink/10" style={{ filter: 'url(#hand-drawn)' }} />
              <p className="text-[11px] font-mono leading-relaxed text-slate-400 font-medium">
                <span className="text-slate-600 font-bold uppercase tracking-widest">Full-Stack & IoT</span>
              </p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-300">[[ contact ]]</h3>
            <div className="space-y-3">
              {[
                { icon: MapPin, label: "Dakar, Sénégal" },
                { icon: Mail, label: "adounake@gmail.com", href: "mailto:adounake@gmail.com" },
                { icon: Linkedin, label: "gayensis09", href: "https://www.linkedin.com/in/gayensis09" },
                { icon: Github, label: "GAYENSIS09", href: "https://github.com/GAYENSIS09" },
              ].map((item, idx) => (
                <a key={idx} href={item.href} className="flex items-center gap-3 text-xs hover:text-ink transition-colors group">
                  <item.icon size={12} className="text-slate-300 group-hover:text-ink transition-colors" />
                  <span className="font-medium underline decoration-slate-100 underline-offset-4 group-hover:decoration-slate-300">{item.label}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Languages */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-300">[[ languages ]]</h3>
            <div className="grid gap-2">
              {[
                { name: "Français", level: "100%" },
                { name: "Wolof", level: "100%" },
                { name: "Anglais", level: "65%" },
              ].map(lang => (
                <div key={lang.name} className="flex justify-between items-center text-[11px]">
                   <span className="font-hand text-sm tracking-tight">{lang.name}</span>
                   <span className="text-[9px] font-mono text-slate-300">{lang.level}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills Area */}
          <motion.div variants={itemVariants} className="space-y-6">
            {SKILL_GROUPS.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{group.name}</h4>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {group.skills.map(skill => (
                    <span key={skill} className="font-sketch text-xs text-slate-500 hover:text-ink transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="lg:p-16 p-8 overflow-y-auto max-h-screen bg-blueprint">
          
          <div className="max-w-3xl space-y-20">
            {/* Mission Statement */}
            <section>
              <motion.p variants={itemVariants} className="text-2xl font-light italic leading-relaxed text-slate-500 font-hand">
                "Étudiant en informatique à l'UCAD, je me consacre à l'ingénierie de systèmes où l'IA et l'IoT convergent. Mon objectif est de bâtir des ponts entre le <span className="text-ink not-italic font-sans font-bold hand-underline">Silicium</span> et le <span className="text-ink not-italic font-sans font-bold hand-underline">Code</span> pour créer des solutions robustes à fort impact sociétal."
              </motion.p>
            </section>

            {/* Expériences */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <h2 className="font-display text-4xl italic">Journal Technique</h2>
                <div className="h-[1px] flex-1 bg-ink/5" />
              </div>

              {[
                {
                  title: "Full-Stack IoT & Energy Data Engineer",
                  company: "Beta Energy Afrique",
                  date: "Fév 2026 – Avr 2026",
                  bullets: ["Design de Backends FastAPI performants (REST/WS)", "Ingénierie IoT : Modbus RTU/TCP & MQTT Pipelines", "Analyse de séries temporelles InfluxDB & React Dashboards"]
                },
                {
                  title: "Ingénieur Full Stack",
                  company: "Beta Energy Afrique",
                  date: "Juin 2025 – Nov 2025",
                  bullets: ["Développement de l'ERP 'BEA' (Stocks, Finance, Projets)", "Intégration API REST Laravel & MySQL Architecture", "Automatisation du déploiement via scripts Bash/Linux"]
                }
              ].map((exp, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className={`p-10 bg-white/40 ${sketchBorder} hover:bg-white/60 transition-all group`}
                  style={{ filter: 'url(#hand-drawn)' }}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight uppercase font-sans group-hover:text-ink transition-colors">{exp.title}</h3>
                      <p className="font-hand text-lg text-slate-400">{exp.company}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-300 border border-slate-100 px-2 py-1 rounded">REF_{exp.date}</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3 items-start text-slate-500">
                        <span className="text-xs mt-1 text-ink opacity-30">#</span>
                        <span className="text-[13px] font-medium leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </section>

            {/* Formation */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <h2 className="font-display text-4xl italic">Formation</h2>
                <div className="h-[1px] flex-1 bg-ink/5" />
              </div>

              {[
                {
                  school: "Université Cheikh Anta Diop (UCAD)",
                  degree: "Licence en Informatique",
                  date: "2023 – 2026",
                  details: "Spécialisation en systèmes distribués et IA."
                },
                {
                  school: "Lycée Lamine Gueye",
                  degree: "Baccalauréat S1 (Sciences Exactes)",
                  date: "2022 – 2023",
                  details: "Mention Très Bien. Focus : Mathématiques & Physique."
                }
              ].map((edu, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  className="flex flex-col md:flex-row justify-between md:items-center py-6 border-b border-ink/5 group"
                >
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-ink transition-colors">{edu.school}</h3>
                    <p className="font-hand text-xl text-slate-500">{edu.degree}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-300">{edu.date}</span>
                </motion.div>
              ))}
            </section>

            {/* Labs (Interactive Section) */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <h2 className="font-display text-4xl italic underline decoration-ink/5 underline-offset-4">Projets & Démos</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8 items-start">
                {/* Active View */}
                <div 
                  className={`aspect-video bg-white/80 ${sketchBorder} flex items-center justify-center p-12 text-center group relative cursor-pointer hover:bg-white transition-all`}
                  style={{ filter: 'url(#hand-drawn)' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeProject?.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <div className="w-16 h-16 mx-auto rounded-full border border-ink/10 flex items-center justify-center text-ink/40 group-hover:bg-ink group-hover:text-white transition-all shadow-inner">
                        {activeProject?.type === 'iot' ? <Cpu size={32} /> : <Monitor size={32} />}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-display italic tracking-tight">{activeProject?.title}</h3>
                        <p className="font-hand text-lg text-slate-400 max-w-sm mx-auto">{activeProject?.desc}</p>
                      </div>
                      <div className="flex justify-center gap-3">
                         <button className="px-6 py-2 bg-ink text-white rounded-full text-[10px] font-bold uppercase hover:opacity-90 transition-all shadow-lg active:scale-95">Lancer l'aperçu</button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Subtle technical corner marks */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-ink/10" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-ink/10" />
                </div>

                {/* List selector */}
                <div className="space-y-3">
                  {PROJECTS.map((proj) => (
                    <button 
                      key={proj.id}
                      onClick={() => setActiveProject(proj)}
                      className={`w-full text-left p-4 border transition-all text-xs flex justify-between items-center ${
                        activeProject?.id === proj.id 
                        ? "border-ink bg-white shadow-lg translate-x-[-8px]" 
                        : "border-transparent text-slate-400 hover:text-ink"
                      }`}
                    >
                      <span className="font-bold tracking-tight">{proj.title}</span>
                      {activeProject?.id === proj.id && <ArrowRight size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-20 pb-10 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
              <div className="font-sketch text-xs">Architectural Digest // B.M. Gaye 2026</div>
              <div className="flex gap-6">
                 <Github size={16} className="hover:opacity-100 transition-opacity cursor-pointer" />
                 <Linkedin size={16} className="hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
            </footer>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
