import { CreateResumeDto } from '../dto/create-resume.dto';
import { UpdateResumeDto } from '../dto/update-resume.dto';

/**
 * Maps the application's Resume DTO to RenderCV's YAML structure.
 */
export function mapResumeToRenderCV(resume: any): any {
  const personal = resume.personalInfo || {};
  
  // Extract social networks specifically for RenderCV v2.7
  const socialNetworks: any[] = [];
  if (personal.linkedIn) {
    const username = personal.linkedIn
      .replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')
      .replace(/\/$/, '');
    if (username) socialNetworks.push({ network: 'LinkedIn', username });
  }
  if (personal.github) {
    const username = personal.github
      .replace(/https?:\/\/(www\.)?github\.com\//, '')
      .replace(/\/$/, '');
    if (username) socialNetworks.push({ network: 'GitHub', username });
  }

  return {
    cv: {
      name: resume.resumeName || 'Your Name',
      location: personal.location || undefined,
      email: personal.email?.includes('@') ? personal.email : undefined,
      phone: personal.phone || undefined,
      website: personal.website?.startsWith('http') ? personal.website : undefined,
      social_networks: socialNetworks.length > 0 ? socialNetworks : undefined,
      sections: {
        summary: resume.summary?.trim() ? [resume.summary.trim()] : undefined,
        education: resume.education
          ?.filter((edu: any) => edu.institution?.trim())
          ?.map((edu: any) => ({
            institution: edu.institution?.trim() || 'Unnamed Institution',
            area: edu.fieldOfStudy?.trim() || undefined,
            degree: edu.degree?.trim() || undefined,
            start_date: edu.startDate?.trim() || undefined,
            end_date: edu.endDate?.trim() || undefined,
            location: edu.location?.trim() || undefined,
            summary: edu.description?.trim() || undefined,
          })),
        experience: resume.experience
          ?.filter((exp: any) => exp.company?.trim() || exp.role?.trim())
          ?.map((exp: any) => ({
            company: exp.company?.trim() || 'Unnamed Company',
            position: exp.role?.trim() || 'Position',
            location: exp.location?.trim() || undefined,
            start_date: exp.startDate?.trim() || undefined,
            end_date: (exp.endDate?.trim() || (exp.current ? 'present' : undefined)) || undefined,
            summary: (exp.summary?.trim() || exp.description?.trim()) || undefined,
            highlights: (() => {
              const highlightsArr = Array.isArray(exp.highlights) ? exp.highlights : 
                                  Array.isArray(exp.achievements) ? exp.achievements : [];
              
              let items: string[] = [];
              if (highlightsArr.length > 0) {
                items = highlightsArr.map((s: any) => String(s).trim());
              } else {
                const achievementsStr = exp.achievements || exp.highlights || '';
                if (typeof achievementsStr === 'string' && achievementsStr.trim()) {
                  items = achievementsStr.split('\n').map((s: string) => s.trim()).filter((s: string) => s !== '');
                }
              }

              // Strip manual bullet points to avoid double bullets in RenderCV
              return items.map(item => item.replace(/^[•\-\*\s]+/, '').trim()).filter(item => item !== '');
            })(),
          })),
        projects: resume.projects
          ?.filter((proj: any) => proj.name?.trim())
          ?.map((proj: any) => ({
            name: proj.name?.trim() || 'Unnamed Project',
            location: undefined,
            start_date: undefined,
            end_date: undefined,
            summary: proj.description?.trim() || undefined,
            highlights: proj.technologies ? [`Built with: ${proj.technologies.join(', ')}`] : [],
          })),
        skills: resume.skills ? Object.entries(resume.skills).map(([category, items]) => ({
          label: category,
          details: Array.isArray(items) ? items.join(', ') : String(items),
        })) : undefined,
      },
    },
    design: {
      theme: (() => {
        const theme = (resume.template || 'classic').toLowerCase();
        if (['classic', 'engineeringclassic', 'engineeringresumes', 'moderncv', 'sb2nov'].includes(theme)) {
          return theme;
        }
        if (theme.includes('modern')) return 'moderncv';
        if (theme.includes('sb2nov')) return 'sb2nov';
        if (theme.includes('engineering')) return 'engineeringresumes';
        return 'classic';
      })(),
    },
    settings: {
      render_command: {
        output_folder: 'rendercv_output',
      },
    },
  };
}
