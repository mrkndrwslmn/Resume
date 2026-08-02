// supabase-client.js
// Configure your Supabase credentials here

const SUPABASE_URL = 'https://zgntstsqqphixyxicdvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbnRzdHNxcXBoaXh5eGljZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MTM2ODAsImV4cCI6MjA4MTA4OTY4MH0.Ul9h8VFit4OU4uAzIVQF0CNI-TrFsgzbqd3v2LyWDW4'; 

// Initialize Supabase client (wait for window.supabase to be available)
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FETCH FUNCTIONS
// ============================================

async function fetchProjects() {
  try {
    const { data: projects, error: projectsError } = await client
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (projectsError) throw projectsError;

    // Fetch features and technologies for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const { data: features } = await client
          .from('project_features')
          .select('feature_text')
          .eq('project_id', project.id)
          .order('display_order', { ascending: true });

        const { data: technologies } = await client
          .from('project_technologies')
          .select('technology_name')
          .eq('project_id', project.id)
          .order('display_order', { ascending: true });

        return {
          ...project,
          features: [...new Set(features?.map(f => f.feature_text) || [])],
          technologies: [...new Set(technologies?.map(t => t.technology_name) || [])].filter(tech => tech.toLowerCase() !== 'web development')
        };
      })
    );

    return projectsWithDetails;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

async function fetchSkills() {
  try {
    const { data, error } = await client
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

async function fetchExperience() {
  try {
    const { data, error } = await client
      .from('experience')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching experience:', error);
    return [];
  }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderFeaturedProjects(projects) {
  const container = document.getElementById('featured-projects-container');
  if (!container) return;

  const featuredProjects = projects.slice(0, 4);

  container.innerHTML = featuredProjects.map(project => `
    <div class="soft-card bg-black border-2 border-black flex flex-col group hover:bg-[var(--accent-color)] transition-colors duration-300">
      <div class="relative w-full aspect-video rounded-xl overflow-hidden mb-6 border-2 border-transparent group-hover:border-black transition-colors">
        ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />` : '<div class="w-full h-full bg-gray-800"></div>'}
      </div>
      <h3 class="text-3xl font-black font-display text-white group-hover:text-black uppercase mb-2 leading-tight">${project.title}</h3>
      <p class="text-gray-400 group-hover:text-black font-medium text-sm mb-6 flex-grow">${project.short_description || project.description.substring(0, 100) + '...'}</p>
      
      ${project.technologies && project.technologies.length > 0 ? `
        <div class="flex flex-wrap gap-2 mb-6">
          ${project.technologies.slice(0, 3).map(tech => `<span class="px-2 py-1 bg-white/10 group-hover:bg-black/10 text-white group-hover:text-black text-xs font-bold uppercase rounded-md">${tech}</span>`).join('')}
          ${project.technologies.length > 3 ? `<span class="px-2 py-1 bg-white/10 group-hover:bg-black/10 text-white group-hover:text-black text-xs font-bold uppercase rounded-md">+${project.technologies.length - 3}</span>` : ''}
        </div>
      ` : ''}
      
      <a href="project-detail.html?id=${project.id}" class="inline-flex items-center text-white group-hover:text-black font-bold uppercase text-sm group/btn">
        View Case Study <span class="ml-2 bg-[var(--accent-color)] group-hover:bg-black text-black group-hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover/btn:translate-x-2">↗</span>
      </a>
    </div>
  `).join('');
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;

  container.innerHTML = projects.map((project, index) => {
    const num = (index + 1).toString().padStart(2, '0');
    const year = project.completed_date ? new Date(project.completed_date).getFullYear() : '';
    
    return `
    <div class="group border-b-2 border-black py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[var(--accent-color)] transition-colors duration-300 px-4 -mx-4">
      <div class="flex items-start gap-6 md:w-1/2">
        <span class="text-2xl font-black font-display text-gray-400 group-hover:text-black">${num}</span>
        <div>
          <h3 class="text-3xl md:text-4xl font-black font-display uppercase mb-2 group-hover:text-black leading-none">${project.title}</h3>
          <p class="text-gray-600 font-medium group-hover:text-black/80 max-w-md">${project.short_description || project.description.substring(0, 100) + '...'}</p>
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 md:w-1/2 mt-4 md:mt-0">
        <div class="flex flex-wrap gap-2">
          ${project.technologies && project.technologies.length > 0 ? project.technologies.slice(0, 3).map(tech => `<span class="px-2 py-1 border border-black text-black text-xs font-bold uppercase rounded-md group-hover:bg-black group-hover:text-white transition-colors">${tech}</span>`).join('') : ''}
        </div>
        
        <div class="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
          <span class="font-mono font-bold text-gray-500 group-hover:text-black">${year}</span>
          <a href="project-detail.html?id=${project.id}" class="pill-btn bg-black text-white border-black hover:bg-white hover:text-black whitespace-nowrap text-sm group-hover:bg-white group-hover:text-black group-hover:border-black hover:!bg-black hover:!text-white">
            View Case Study ↗
          </a>
        </div>
      </div>
    </div>
  `}).join('');
}

async function fetchProjectById(projectId) {
  try {
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectError) throw projectError;

    // Fetch features and technologies for the project
    const { data: features } = await client
      .from('project_features')
      .select('feature_text')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true });

    const { data: technologies } = await client
      .from('project_technologies')
      .select('technology_name')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true });

    // Fetch project images
    const { data: images, error: imagesError } = await client
      .from('project_images')
      .select('image_url, caption, is_thumbnail')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true });

    if (imagesError) {
      console.error('Error fetching project images:', imagesError);
    } else {
      console.log('Fetched images for project:', project.id, images);
    }

    return {
      ...project,
      features: [...new Set(features?.map(f => f.feature_text) || [])],
      technologies: [...new Set(technologies?.map(t => t.technology_name) || [])].filter(tech => tech.toLowerCase() !== 'web development'),
      images: images || []
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

function renderProjectDetail(project) {
  const container = document.getElementById('project-detail-container');
  if (!container || !project) return;

  const thumbnailImage = project.image_url;
  const galleryImages = project.images?.filter(img => !img.is_thumbnail) || [];

  container.innerHTML = `
    <!-- Header -->
    <div class="mb-16">
      <h1 class="text-6xl md:text-8xl font-black font-display uppercase leading-none mb-6">${project.title}</h1>
      ${project.short_description ? `<p class="text-2xl font-medium max-w-3xl leading-relaxed">${project.short_description}</p>` : ''}
    </div>

    <!-- Hero Image Mockup -->
    ${thumbnailImage ? `
    <div class="mockup-browser w-full shadow-2xl">
      <div class="mockup-browser-header">
        <div class="mockup-dot"></div><div class="mockup-dot"></div><div class="mockup-dot"></div>
      </div>
      <img src="${thumbnailImage}" alt="${project.title}" class="w-full h-auto object-cover" />
    </div>
    ` : ''}

    <!-- Info Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y-2 border-black my-16">
      ${project.client ? `<div><p class="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Client</p><p class="font-bold text-lg">${project.client}</p></div>` : ''}
      ${project.duration ? `<div><p class="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Timeline</p><p class="font-bold text-lg">${project.duration}</p></div>` : ''}
      ${project.completed_date ? `<div><p class="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Year</p><p class="font-bold text-lg font-mono">${new Date(project.completed_date).getFullYear()}</p></div>` : ''}
      ${project.project_url ? `<div><p class="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Live Link</p><a href="${project.project_url}" target="_blank" class="font-bold text-lg underline hover:text-[var(--accent-dark)]">Visit Demo ↗</a></div>` : ''}
    </div>

    <!-- Narrative & Stack -->
    <div class="grid md:grid-cols-12 gap-16 mb-16">
      <div class="md:col-span-8 space-y-6">
        <h3 class="text-3xl font-black font-display uppercase">The System</h3>
        <div class="text-lg font-medium leading-relaxed space-y-4">
          <p>${project.description.replace(/\\n/g, '<br/>')}</p>
        </div>
        
        ${project.features && project.features.length > 0 ? `
          <h3 class="text-3xl font-black font-display uppercase mt-12 mb-6">Key Features</h3>
          <ul class="space-y-4">
            ${project.features.map(feature => `<li class="flex items-start gap-4"><span class="text-[var(--accent-dark)] font-bold mt-1">■</span><span class="text-lg font-medium">${feature}</span></li>`).join('')}
          </ul>
        ` : ''}
      </div>

      <div class="md:col-span-4">
        ${project.technologies && project.technologies.length > 0 ? `
          <div class="bg-black text-white p-8 rounded-3xl border-2 border-black">
            <h3 class="text-2xl font-black font-display uppercase mb-6 text-[var(--accent-color)]">Tech Stack</h3>
            <div class="flex flex-wrap gap-3">
              ${project.technologies.map(tech => `<span class="px-4 py-2 border border-white/20 rounded-lg font-bold text-sm uppercase">${tech}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Gallery -->
    ${galleryImages.length > 0 ? `
      <div class="mt-24">
        <h3 class="text-4xl font-black font-display uppercase mb-12 text-center">System Views</h3>
        <div class="space-y-16">
          ${galleryImages.map(img => `
            <div>
              <div class="mockup-browser shadow-xl">
                <div class="mockup-browser-header">
                  <div class="mockup-dot"></div><div class="mockup-dot"></div><div class="mockup-dot"></div>
                </div>
                <img src="${img.image_url}" alt="${img.caption || project.title}" class="w-full h-auto object-cover" />
              </div>
              ${img.caption ? `<p class="text-center font-medium text-gray-500 mt-4 uppercase tracking-wide text-sm">${img.caption}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  const grouped = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grouped).map(([category, categorySkills]) => `
    <div class="mb-8">
      <h3 class="text-xl font-bold uppercase tracking-widest text-black mb-4 border-b-2 border-black pb-2">${category}</h3>
      <div class="flex flex-wrap gap-3">
        ${categorySkills.map(skill => `
          <div class="px-4 py-2 border-2 border-black rounded-lg bg-white text-black font-bold flex items-center gap-2 hover:bg-black hover:text-[var(--accent-color)] transition-colors">
            ${skill.skill_name}
            ${skill.proficiency_level ? `<span class="text-xs opacity-50 bg-gray-200 text-black px-2 py-0.5 rounded-sm ml-1">${skill.proficiency_level}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderExperience(experience) {
  const container = document.getElementById('experience-container');
  if (!container) return;

  container.innerHTML = experience.map((exp, index) => {
    const start = exp.start_date ? new Date(exp.start_date).getFullYear() : '';
    let end = exp.end_date ? new Date(exp.end_date).getFullYear() : (exp.is_current ? 'PRESENT' : '');
    
    // Fix for degrees spanning one year
    if (start && start === end && exp.title.toLowerCase().includes('bachelor')) {
      end = 'PRESENT';
    }
    
    const dateStr = start ? (start === end ? start : `${start} — ${end}`) : '';

    return `
    <div class="relative pl-8 md:pl-0 border-l-2 md:border-l-0 border-black md:grid md:grid-cols-4 md:gap-8 pb-12 group">
      <!-- Timeline dot for mobile -->
      <div class="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-black md:hidden group-hover:bg-[var(--accent-color)] group-hover:border-2 group-hover:border-black transition-colors"></div>
      
      <!-- Date Column -->
      <div class="md:col-span-1 md:text-right mb-2 md:mb-0 md:pr-8 md:border-r-2 md:border-black relative">
        <span class="font-mono font-bold text-gray-500 uppercase tracking-widest">${dateStr}</span>
        <!-- Timeline dot for desktop -->
        <div class="hidden md:block absolute right-[-9px] top-2 w-4 h-4 rounded-full bg-black group-hover:bg-[var(--accent-color)] group-hover:border-2 group-hover:border-black transition-colors"></div>
      </div>
      
      <!-- Content Column -->
      <div class="md:col-span-3">
        <h3 class="text-2xl font-black font-display uppercase leading-tight mb-2">${exp.title}</h3>
        ${exp.company ? `<p class="text-[var(--accent-dark)] font-bold uppercase tracking-wide text-sm mb-4">${exp.company}</p>` : ''}
        ${exp.description ? `<p class="font-medium text-gray-700 leading-relaxed max-w-2xl">${exp.description.replace(/\\n/g, '<br/>')}</p>` : ''}
      </div>
    </div>
  `}).join('');
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load and render featured projects on home page
  const featuredProjectsContainer = document.getElementById('featured-projects-container');
  const featuredProjectsLoading = document.getElementById('featured-projects-loading');
  
  if (featuredProjectsContainer) {
    const projects = await fetchProjects();
    if (featuredProjectsLoading) featuredProjectsLoading.style.display = 'none';
    renderFeaturedProjects(projects);
  }

  // Load and render projects list
  const projectsContainer = document.getElementById('projects-container');
  const projectsLoading = document.getElementById('projects-loading');
  const projectsEmpty = document.getElementById('projects-empty');
  let allProjectsData = [];
  
  if (projectsContainer) {
    allProjectsData = await fetchProjects();
    if (projectsLoading) projectsLoading.style.display = 'none';
    
    if (allProjectsData.length === 0 && projectsEmpty) {
      projectsEmpty.classList.remove('hidden');
    } else {
      renderProjects(allProjectsData);
    }

    // Filter functionality
    const filterBtns = document.querySelectorAll('#projects-filter button');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update active class
        filterBtns.forEach(b => {
          b.classList.remove('bg-black', 'text-white');
          b.classList.add('bg-white', 'text-black');
        });
        e.target.classList.remove('bg-white', 'text-black');
        e.target.classList.add('bg-black', 'text-white');

        const filterVal = e.target.getAttribute('data-filter');
        if (filterVal === 'all') {
          renderProjects(allProjectsData);
          return;
        }

        const filtered = allProjectsData.filter(p => {
          const cat = p.category ? p.category.toLowerCase() : '';
          const tags = p.technologies ? p.technologies.map(t=>t.toLowerCase()) : [];
          if (filterVal === 'web') return cat.includes('web') || tags.includes('react') || tags.includes('laravel');
          if (filterVal === 'mobile') return cat.includes('mobile') || tags.includes('flutter');
          if (filterVal === 'ai') return cat.includes('ai') || tags.includes('rag') || tags.includes('python');
          return false;
        });

        if (filtered.length === 0 && projectsEmpty) {
          projectsContainer.innerHTML = '';
          projectsEmpty.classList.remove('hidden');
        } else {
          if (projectsEmpty) projectsEmpty.classList.add('hidden');
          renderProjects(filtered);
        }
      });
    });
  }

  // Load and render project detail
  const projectDetailContainer = document.getElementById('project-detail-container');
  const projectDetailLoading = document.getElementById('project-detail-loading');
  
  if (projectDetailContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (projectId) {
      const project = await fetchProjectById(projectId);
      if (projectDetailLoading) projectDetailLoading.style.display = 'none';
      
      if (project) {
        renderProjectDetail(project);
      } else {
        projectDetailContainer.innerHTML = '<div class="error-message"><p>Project not found.</p><a href="projects.html" class="back-link">← Back to Projects</a></div>';
      }
    } else {
      if (projectDetailLoading) projectDetailLoading.style.display = 'none';
      projectDetailContainer.innerHTML = '<div class="error-message"><p>No project ID provided.</p><a href="projects.html" class="back-link">← Back to Projects</a></div>';
    }
  }

  // Load and render skills
  const skillsContainer = document.getElementById('skills-container');
  const skillsLoading = document.getElementById('skills-loading');
  
  if (skillsContainer) {
    const skills = await fetchSkills();
    if (skillsLoading) skillsLoading.style.display = 'none';
    renderSkills(skills);
  }

  // Load and render experience
  const experienceContainer = document.getElementById('experience-container');
  const experienceLoading = document.getElementById('experience-loading');
  
  if (experienceContainer) {
    const experience = await fetchExperience();
    if (experienceLoading) experienceLoading.style.display = 'none';
    renderExperience(experience);
  }
});