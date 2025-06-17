import type { Project } from '../types/appTypes';

export const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) return savedKey;
  }
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return apiKey || '';
};

export const loadProjects = (): Project[] => {
  try {
    const savedProjectsData = localStorage.getItem('promptProjects');
    if (!savedProjectsData) return [];
    
    const savedProjects = JSON.parse(savedProjectsData);
    return Object.values(savedProjects).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      history: p.history.map((h: any) => ({...h, timestamp: new Date(h.timestamp)})),
      workflows: p.workflows?.map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt),
        steps: w.steps.map((s: any) => ({
          ...s,
          position: s.position || { x: 100, y: 100 },
          conditions: s.conditions || []
        })),
        executions: w.executions?.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          steps: e.steps.map((s: any) => ({
            ...s,
            executedAt: new Date(s.executedAt)
          }))
        })) || []
      })) || []
    }));
  } catch (e) {
    console.error("Failed to parse projects from localStorage", e);
    return [];
  }
};

export const saveProjects = (projects: Project[]) => {
  if (projects.length > 0) {
    const projectsToSave = Object.fromEntries(projects.map(p => [p.id, p]));
    localStorage.setItem('promptProjects', JSON.stringify(projectsToSave));
  }
};

export const getActiveProjectId = (): string | null => {
  return localStorage.getItem('activeProjectId');
};

export const setActiveProjectId = (id: string) => {
  localStorage.setItem('activeProjectId', id);
};

export const getDarkModePreference = (): boolean => {
  return localStorage.getItem('darkMode') === 'true';
};

export const setDarkModePreference = (darkMode: boolean) => {
  localStorage.setItem('darkMode', darkMode.toString());
};

