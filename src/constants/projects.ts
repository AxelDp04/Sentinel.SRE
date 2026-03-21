import * as LucideIcons from "lucide-react";

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: keyof typeof LucideIcons;
}

export const PROJECTS: Project[] = [
  {
    id: "arqovex",
    name: "ARQOVEX",
    description: "Marketplace de planos arquitectónicos y propiedades.",
    url: "https://arqovex.com",
    icon: "Home",
  },
  {
    id: "auditacar",
    name: "AuditaCar RD",
    description: "Plataforma de análisis de mercado de vehículos.",
    url: "https://auditacar.rd",
    icon: "Car",
  },
  {
    id: "agentscout",
    name: "AgentScout",
    description: "Herramienta de búsqueda inteligente de propiedades.",
    url: "https://agentscout.com",
    icon: "Search",
  },
];
