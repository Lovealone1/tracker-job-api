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
      name: (() => {
        if (!resume.resumeName) return 'Your Name';
        const lines = resume.resumeName.split('\n');
        if (lines.length <= 1) return resume.resumeName;
        // Reemplazamos cualquier espacio (incluyendo los de teclados internacionales) por espacios inseparables en cada renglón,
        // y unimos los renglones con un espacio normal y un zero-width space para forzar el quiebre.
        return lines.map((line: string) => line.replace(/[^\S\n]/g, '\u00A0')).join('\u200B ');
      })(),
      location: personal.location || undefined,
      email: personal.email?.includes('@') ? personal.email : undefined,
      phone: personal.phone || undefined,
      website: personal.website?.startsWith('http') ? personal.website : undefined,
      social_networks: socialNetworks.length > 0 ? socialNetworks : undefined,
      sections: (() => {
        const sections: any = {};
        const lang = resume.language === 'es' ? 'es' : 'en';
        
        // Define titles based on language
        const titles: any = {
          en: {
            summary: 'Summary',
            education: 'Education',
            experience: 'Experience',
            projects: 'Projects',
            skills: 'Skills',
            publications: 'Publications',
            certifications: 'Certifications',
            honors: 'Honors and Awards',
            patents: 'Patents',
            talks: 'Invited Talks',
          },
          es: {
            summary: 'Resumen',
            education: 'Educación',
            experience: 'Experiencia',
            projects: 'Proyectos',
            skills: 'Habilidades técnicas',
            publications: 'Publicaciones',
            certifications: 'Certificaciones',
            honors: 'Honores y Premios',
            patents: 'Patentes',
            talks: 'Charlas Invitadas',
          }
        };

        const t = titles[lang];

        if (resume.summary?.trim()) {
          sections[t.summary] = [resume.summary.trim()];
        }

        if (resume.education?.length > 0) {
          sections[t.education] = resume.education
            ?.filter((edu: any) => edu.institution?.trim())
            ?.map((edu: any) => ({
              institution: edu.institution?.trim() || 'Unnamed Institution',
              area: edu.fieldOfStudy?.trim() || undefined,
              degree: edu.degree?.trim() || undefined,
              start_date: edu.startDate?.trim() || undefined,
              end_date: edu.endDate?.trim() || undefined,
              location: edu.location?.trim() || undefined,
              summary: edu.description?.trim() || undefined,
            }));
        }

        if (resume.experience?.length > 0) {
          sections[t.experience] = resume.experience
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
                return items.map(item => item.replace(/^[•\-\*\s]+/, '').trim()).filter(item => item !== '');
              })(),
            }));
        }

        if (resume.projects?.length > 0) {
          sections[t.projects] = resume.projects
            ?.filter((proj: any) => proj.name?.trim())
            ?.map((proj: any) => ({
              name: proj.name?.trim() || 'Unnamed Project',
              location: proj.location?.trim() || undefined,
              start_date: proj.startDate?.trim() || undefined,
              end_date: (proj.endDate?.trim() || (proj.current ? 'present' : undefined)) || undefined,
              summary: proj.description?.trim() || undefined,
              highlights: (() => {
                const highlightsArr = Array.isArray(proj.highlights) ? proj.highlights : [];
                let items: string[] = [];
                if (highlightsArr.length > 0) {
                  items = highlightsArr.map((s: any) => String(s).trim());
                } else if (proj.technologies?.length > 0) {
                   items = [`Built with: ${proj.technologies.join(', ')}`];
                }
                return items.map(item => item.replace(/^[•\-\*\s]+/, '').trim()).filter(item => item !== '');
              })(),
            }));
        }

        if (resume.publications?.length > 0) {
          sections[t.publications] = resume.publications
            ?.filter((pub: any) => pub.title?.trim())
            ?.map((pub: any) => ({
              title: pub.title?.trim() || 'Untitled Publication',
              authors: Array.isArray(pub.authors) ? pub.authors : (pub.authors ? [pub.authors] : []),
              doi: pub.doi?.trim() || undefined,
              journal: pub.journal?.trim() || pub.conference?.trim() || undefined,
              date: pub.date?.trim() || undefined,
              summary: pub.description?.trim() || undefined,
            }));
        }

        if (resume.certifications?.length > 0) {
          sections[t.certifications] = resume.certifications
            ?.filter((cert: any) => cert.name?.trim())
            ?.map((cert: any) => {
              const name = cert.name?.trim() || 'Unnamed Certification';
              const issuer = cert.issuer?.trim();
              const description = cert.description?.trim();
              
              return {
                name: name,
                date: cert.date?.trim() || undefined,
                summary: issuer ? (description ? `${issuer}\n\n${description}` : issuer) : description,
              };
            });
        }

        if (resume.honors?.length > 0) {
          sections[t.honors] = resume.honors
            ?.filter((honor: any) => honor.name?.trim())
            ?.map((honor: any) => ({
              name: honor.name?.trim() || 'Unnamed Honor',
              issuer: honor.issuer?.trim() || undefined,
              date: honor.date?.trim() || undefined,
              summary: honor.description?.trim() || undefined,
            }));
        }

        if (resume.patents?.length > 0) {
          sections[t.patents] = resume.patents
            ?.filter((patent: any) => patent.title?.trim())
            ?.map((patent: any) => ({
              title: patent.title?.trim() || 'Unnamed Patent',
              issuer: patent.issuer?.trim() || undefined,
              date: patent.date?.trim() || undefined,
              summary: patent.description?.trim() || undefined,
            }));
        }

        if (resume.talks?.length > 0) {
          sections[t.talks] = resume.talks
            ?.filter((talk: any) => talk.title?.trim())
            ?.map((talk: any) => ({
              title: talk.title?.trim() || 'Untitled Talk',
              venue: talk.venue?.trim() || talk.location?.trim() || undefined,
              date: talk.date?.trim() || undefined,
              summary: talk.description?.trim() || undefined,
            }));
        }

        if (resume.skills && Object.keys(resume.skills).length > 0) {
          sections[t.skills] = Object.entries(resume.skills).map(([category, items]) => ({
            label: category,
            details: Array.isArray(items) ? items.join(', ') : String(items),
          }));
        }

        return sections;
      })(),
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
      // Override templates for Spanish translation if using sb2nov
      ...(resume.language === 'es' ? {
        templates: {
          education_entry: {
            main_column: "**INSTITUTION**\n*DEGREE* *en* *AREA*\nSUMMARY\nHIGHLIGHTS"
          }
        }
      } : {})
    },
    locale: {
      language: resume.language === 'es' ? 'spanish' : 'english',
      ...(resume.language === 'es' ? {
        phrases: {
          degree_with_area: "DEGREE en AREA"
        }
      } : {})
    },
  };
}
