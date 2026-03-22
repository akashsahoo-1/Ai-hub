"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FileText, StickyNote, Youtube, Briefcase, ArrowRight, Sparkles } from "lucide-react";

function MouseGlow() {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60 mix-blend-screen"
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.12), transparent 40%)`,
      }}
    />
  );
}

function MagneticButton({ children, onClick, className }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2);
    y.set(middleY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className={className}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

function ProjectCard({ project, index }: { project: any, index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    x.set(0);
    y.set(0);
  };

  const Icon = project.icon;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        delay: index * 0.15
      } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      style={{
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      onClick={() => window.open(project.url, "_blank")}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl cursor-pointer transition-all duration-300 hover:bg-white/[0.04] ${project.borderHover} ${project.glow} overflow-hidden`}
    >
      <div className={`absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br ${project.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`} />
      
      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out_forwards] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6" style={{ transform: "translateZ(30px)" }}>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${project.color} shadow-lg shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold text-white transition-all duration-300">
              {project.title}
            </h3>
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed font-medium">
            {project.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PremiumDashboard() {
  const projects = [
    {
      title: "Resume Builder",
      description: "Generate professional resumes tailored for specific roles with intelligent AI suggestions.",
      icon: FileText,
      url: "https://ai-resume-maker-blush.vercel.app",
      color: "from-blue-500 to-cyan-400",
      glow: "hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]",
      borderHover: "hover:border-blue-500/40"
    },
    {
      title: "Notes Saver",
      description: "Organize, format, and safely store all your important study or meeting notes automatically.",
      icon: StickyNote,
      url: "https://notes-saver-rust.vercel.app",
      color: "from-purple-500 to-indigo-400",
      glow: "hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]",
      borderHover: "hover:border-purple-500/40"
    },
    {
      title: "YouTube Summarizer",
      description: "Quickly summarize long YouTube videos and extract key points using advanced AI transcription.",
      icon: Youtube,
      url: "https://ai-youtube-summarizer-wheat.vercel.app",
      color: "from-pink-500 to-rose-400",
      glow: "hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)]",
      borderHover: "hover:border-pink-500/40"
    },
    {
      title: "Job Search",
      description: "Find the best job matches based on your parsed resume and land your dream career fast.",
      icon: Briefcase,
      url: "https://job-search-brown-ten.vercel.app",
      color: "from-emerald-500 to-teal-400",
      glow: "hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]",
      borderHover: "hover:border-emerald-500/40"
    },
  ];

  const scrollToTools = () => {
    document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden relative selection:bg-purple-500/30 font-sans">
      <MouseGlow />

      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-24">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            AI Hub
          </span>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          onClick={scrollToTools} 
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Explore Tools
        </motion.button>
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Animated Hero Section */}
        <section className="py-12 md:py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 min-h-[80vh]">
          
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Version 2.0 is now live</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
                Welcome to <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  AI Hub
                </span>
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-gray-300">
                Your all-in-one AI productivity platform
              </p>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Create resumes, save notes, summarize YouTube videos, and discover jobs — all in one unified, seamlessly integrated place.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 relative z-20"
            >
              <MagneticButton 
                onClick={scrollToTools}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gradient-to-r hover:from-white hover:to-gray-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.6)]"
              >
                Explore Tools
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
              <MagneticButton 
                onClick={() => window.open("https://github.com", "_blank")}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full bg-white/5 text-white font-medium border border-white/10 hover:bg-white/10 transition-all opacity-90 hover:opacity-100"
              >
                View Documentation
              </MagneticButton>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
            className="flex-1 w-full max-w-xl lg:max-w-none relative"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-[1px] shadow-2xl shadow-purple-500/20 group hover:shadow-purple-500/30 transition-shadow duration-700"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] flex flex-col pointer-events-none">
                <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-orange-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                </div>
                
                <div className="p-6 space-y-6 flex-1 bg-gradient-to-b from-white/[0.02] to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-6 w-32 bg-white/10 rounded-md animate-pulse" />
                      <div className="h-2 w-20 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-center p-4">
                        <div className="h-2 w-1/3 bg-white/20 rounded-full mb-3" />
                        <div className="h-3 w-2/3 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
        </section>

        {/* Dynamic Tool Cards Section */}
        <section id="tools-section" className="py-24 relative z-10 border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white tracking-tight">
              Powerful Apps, Single Destination
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Select one of our specialized AI tools below to instantly jump into the application.
            </p>
          </motion.div>

          {/* Cards wrapped in motion stagger */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
          >
            {projects.map((project, idx) => (
              <ProjectCard key={project.title} project={project} index={idx} />
            ))}
          </motion.div>
        </section>

        <footer className="py-12 flex flex-col items-center justify-center gap-4 text-gray-500 text-sm border-t border-white/5">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4 text-gray-400" />
          </div>
          <p className="font-medium tracking-wide">© {new Date().getFullYear()} AI Hub Ecosystem. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
}
