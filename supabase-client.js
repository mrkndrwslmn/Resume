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
          features: features?.map(f => f.feature_text) || [],
          technologies: technologies?.map(t => t.technology_name) || []
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

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;

  container.innerHTML = projects.map(project => `
    <div class="project-card">
      ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" class="project-image" />` : ''}
      <div class="project-content">
        <h3>${project.title}</h3>
        <p class="project-description">${project.short_description || project.description.substring(0, 150) + '...'}</p>
        
        ${project.technologies && project.technologies.length > 0 ? `
          <div class="tech-stack">
            <div class="tech-tags">
              ${project.technologies.slice(0, 3).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
              ${project.technologies.length > 3 ? `<span class="tech-tag">+${project.technologies.length - 3} more</span>` : ''}
            </div>
          </div>
        ` : ''}
        
        <div class="project-meta">
          ${project.client ? `<p><strong>Client:</strong> ${project.client}</p>` : ''}
          ${project.completed_date ? `<p><strong>Completed:</strong> ${new Date(project.completed_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>` : ''}
        </div>

        <a href="project-detail.html?id=${project.id}" class="project-link">View Details →</a>
      </div>
    </div>
  `).join('');
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

    return {
      ...project,
      features: features?.map(f => f.feature_text) || [],
      technologies: technologies?.map(t => t.technology_name) || []
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

function renderProjectDetail(project) {
  const container = document.getElementById('project-detail-container');
  if (!container || !project) return;

  container.innerHTML = `
    <div class="project-detail">
      ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" class="project-detail-image" />` : ''}
      
      <div class="project-header">
        <h1>${project.title}</h1>
        ${project.short_description ? `<p class="project-subtitle">${project.short_description}</p>` : ''}
      </div>

      <div class="project-info-grid">
        ${project.client ? `
          <div class="info-item">
            <h4>Client</h4>
            <p>${project.client}</p>
          </div>
        ` : ''}
        ${project.duration ? `
          <div class="info-item">
            <h4>Duration</h4>
            <p>${project.duration}</p>
          </div>
        ` : ''}
        ${project.completed_date ? `
          <div class="info-item">
            <h4>Completed</h4>
            <p>${new Date(project.completed_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        ` : ''}
        ${project.project_url ? `
          <div class="info-item">
            <h4>Live Project</h4>
            <p><a href="${project.project_url}" target="_blank" class="external-link">${project.project_url}</a></p>
          </div>
        ` : ''}
      </div>

      <div class="project-section">
        <h3>About This Project</h3>
        <p class="project-full-description">${project.description}</p>
      </div>

      ${project.features && project.features.length > 0 ? `
        <div class="project-section">
          <h3>Key Features</h3>
          <ul class="features-detail-list">
            ${project.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${project.technologies && project.technologies.length > 0 ? `
        <div class="project-section">
          <h3>Technologies Used</h3>
          <div class="tech-tags-detail">
            ${project.technologies.map(tech => `<span class="tech-tag-detail">${tech}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  // Group skills by category
  const grouped = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grouped).map(([category, categorySkills]) => `
    <div class="skills-category">
      <h4>${category}</h4>
      <ul class="skills-list">
        ${categorySkills.map(skill => `
          <li>${skill.skill_name} ${skill.proficiency_level ? `<span class="proficiency">${skill.proficiency_level}</span>` : ''}</li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

function renderExperience(experience) {
  const container = document.getElementById('experience-container');
  if (!container) return;

  container.innerHTML = experience.map(exp => `
    <div class="experience-item">
      <h4>${exp.title}</h4>
      <p class="date-range">
        ${exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''} 
        ${exp.end_date ? `- ${new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : (exp.is_current ? '- Present' : '')}
      </p>
      ${exp.description ? `<p>${exp.description}</p>` : ''}
    </div>
  `).join('');
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load and render projects list
  const projectsContainer = document.getElementById('projects-container');
  const projectsLoading = document.getElementById('projects-loading');
  const projectsEmpty = document.getElementById('projects-empty');
  
  if (projectsContainer) {
    const projects = await fetchProjects();
    if (projectsLoading) projectsLoading.style.display = 'none';
    
    if (projects.length === 0 && projectsEmpty) {
      projectsEmpty.classList.remove('hidden');
    } else {
      renderProjects(projects);
    }
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