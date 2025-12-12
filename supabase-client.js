
supabase-client.js
// supabase-client.js
// Configure your Supabase credentials here

const SUPABASE_URL = 'https://zgntstsqqphixyxicdvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbnRzdHNxcXBoaXh5eGljZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MTM2ODAsImV4cCI6MjA4MTA4OTY4MH0.Ul9h8VFit4OU4uAzIVQF0CNI-TrFsgzbqd3v2LyWDW4'; 

// Initialize Supabase client
const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        <p class="project-description">${project.description}</p>
        
        ${project.features && project.features.length > 0 ? `
          <ul class="features-list">
            ${project.features.map(feature => `<li>→ ${feature}</li>`).join('')}
          </ul>
        ` : ''}
        
        <div class="project-meta">
          ${project.client ? `<p><strong>Client:</strong> ${project.client}</p>` : ''}
          ${project.duration ? `<p><strong>Duration:</strong> ${project.duration}</p>` : ''}
          ${project.completed_date ? `<p><strong>Completed:</strong> ${new Date(project.completed_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>` : ''}
        </div>

        ${project.technologies && project.technologies.length > 0 ? `
          <div class="tech-stack">
            <strong>Technologies:</strong>
            <div class="tech-tags">
              ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${project.project_url ? `<a href="${project.project_url}" target="_blank" class="project-link">View Project →</a>` : ''}
      </div>
    </div>
  `).join('');
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
  // Load and render projects
  const projects = await fetchProjects();
  renderProjects(projects);

  // Load and render skills
  const skills = await fetchSkills();
  renderSkills(skills);

  // Load and render experience
  const experience = await fetchExperience();
  renderExperience(experience);
});