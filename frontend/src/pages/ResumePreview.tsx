import React, { useEffect, useState } from 'react';
import type { Resume } from '../types';
import { templates } from '../components/TemplateConfig';
import { FiDownload, FiPrinter, FiFileText, FiMinimize, FiEdit, FiFile } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import ResumePDF from '../components/ResumePDF';
import { useResumeStore } from '../store/resumeStore';
import { sampleResume } from '../data/sample';

const ResumePreview: React.FC = () => {
  const { resume: storeResume, fetchMyResume } = useResumeStore();

  useEffect(() => {
    fetchMyResume();
  }, [fetchMyResume]);
  const [selectedTemplate, setSelectedTemplate] = useState('data-analyst');
  const [font, setFont] = useState('font-sans');
  const [color, setColor] = useState('#333');
  const [fontSize, setFontSize] = useState('text-base');
  const [lineHeight, setLineHeight] = useState('leading-normal');
  const [spacing, setSpacing] = useState('normal');
  const [alignment, setAlignment] = useState('left');
  const [showBorders, setShowBorders] = useState(false);
  const [showShadows, setShowShadows] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(95);
  // const [showPrintGuide, setShowPrintGuide] = useState(false);
  const [pagePadding, setPagePadding] = useState<number>(() => {
    const stored = localStorage.getItem('pagePaddingPx');
    return stored ? parseInt(stored, 10) : 32;
  });
  const [showGrid, setShowGrid] = useState<boolean>(() => localStorage.getItem('showGridOverlay') === 'true');
  
  // Sample resume data for preview when no resume is available - Data Analyst template
  

  useEffect(() => {
    const storedFont = localStorage.getItem('resumeFont') || localStorage.getItem('selectedFont');
    const storedColor = localStorage.getItem('resumeColor') || localStorage.getItem('selectedColor');
    const storedTemplate = localStorage.getItem('selectedTemplate');

    if (storedFont) {
      setFont(storedFont);
    }

    if (storedColor) {
      setColor(storedColor);
    }

    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const resumeToExport = resumeToDisplay;
          const pdfDoc = <ResumePDF resume={resumeToExport} sectionOrder={sectionOrder} color={color} font={font as "font-sans" | "font-serif" | "font-mono"} />;
      const blob = await pdf(pdfDoc).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeToExport.personal_info?.full_name?.replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleExportJson = () => {
    if (!resumeToDisplay) return;

    const dataStr = JSON.stringify(resumeToDisplay, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${resumeToDisplay?.personal_info?.full_name?.replace(/\s+/g, '_')}_resume.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportDoc = () => {
    if (!resumeToDisplay) return;

    // Create HTML content for the resume
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resumeToDisplay.personal_info?.full_name || 'Resume'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 30px; }
          h3 { color: #1f2937; margin-bottom: 5px; }
          .contact-info { margin-bottom: 20px; }
          .section { margin-bottom: 25px; }
          .experience-item, .education-item, .project-item { margin-bottom: 15px; }
          .date { color: #6b7280; font-size: 0.9em; }
          .company, .institution { font-weight: bold; color: #374151; }
          .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }
          .skill-category { margin-bottom: 15px; }
          .skill-category h4 { color: #374151; margin-bottom: 5px; }
          .skill-item { display: inline-block; background: #f3f4f6; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <h1>${resumeToDisplay.personal_info?.full_name || '[Your Name]'}</h1>
        
        <div class="contact-info">
          ${resumeToDisplay.personal_info?.email ? `<div>Email: ${resumeToDisplay.personal_info.email}</div>` : ''}
          ${resumeToDisplay.personal_info?.phone ? `<div>Phone: ${resumeToDisplay.personal_info.phone}</div>` : ''}
          ${resumeToDisplay.personal_info?.location ? `<div>Location: ${resumeToDisplay.personal_info.location}</div>` : ''}
          ${resumeToDisplay.personal_info?.linkedin ? `<div>LinkedIn: ${resumeToDisplay.personal_info.linkedin}</div>` : ''}
          ${resumeToDisplay.personal_info?.github ? `<div>GitHub: ${resumeToDisplay.personal_info.github}</div>` : ''}
          ${resumeToDisplay.personal_info?.website ? `<div>Website: ${resumeToDisplay.personal_info.website}</div>` : ''}
        </div>

        ${resumeToDisplay.professional_summary ? `
        <div class="section">
          <h2>Professional Summary</h2>
          <p>${resumeToDisplay.professional_summary}</p>
        </div>
        ` : ''}

        ${resumeToDisplay.experience && resumeToDisplay.experience.length > 0 ? `
        <div class="section">
          <h2>Work Experience</h2>
          ${resumeToDisplay.experience.map(exp => `
            <div class="experience-item">
              <h3>${exp.position || ''}</h3>
              <div class="company">${exp.company || ''}</div>
              <div class="date">${exp.start_date || ''} - ${exp.is_current ? 'Present' : (exp.end_date || '')}</div>
              <ul>
                ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resumeToDisplay.education && resumeToDisplay.education.length > 0 ? `
        <div class="section">
          <h2>Education</h2>
          ${resumeToDisplay.education.map(edu => `
            <div class="education-item">
              <h3>${edu.institution || ''}</h3>
              <div>${edu.degree || ''}${edu.field_of_study ? `, ${edu.field_of_study}` : ''}</div>
              <div class="date">${edu.start_date || ''} - ${edu.end_date || ''}</div>
              ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resumeToDisplay.skills && resumeToDisplay.skills.length > 0 ? `
        <div class="section">
          <h2>Skills</h2>
          <div class="skills-grid">
            ${(() => {
              const grouped: { [key: string]: typeof resumeToDisplay.skills } = {};
              resumeToDisplay.skills.forEach((skill) => {
                if (!grouped[skill.category]) grouped[skill.category] = [];
                grouped[skill.category].push(skill);
              });
              return Object.entries(grouped).map(([category, skills]) => `
                <div class="skill-category">
                  <h4>${category}</h4>
                  ${skills.map((skill) => `
                    <span class="skill-item">${typeof skill === 'string' ? skill : (skill.name || '')}${(typeof skill !== 'string' && skill.level && skill.level !== 'intermediate') ? ` (${skill.level})` : ''}</span>
                  `).join('')}
                </div>
              `).join('');
            })()}
          </div>
        </div>
        ` : ''}

        ${resumeToDisplay.projects && resumeToDisplay.projects.length > 0 ? `
        <div class="section">
          <h2>Projects</h2>
          ${resumeToDisplay.projects.map(project => `
            <div class="project-item">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
              ${project.technologies && project.technologies.length > 0 ? `
                <div><strong>Technologies:</strong> ${project.technologies.join(', ')}</div>
              ` : ''}
              ${project.url ? `<div><strong>URL:</strong> <a href="${project.url}">${project.url}</a></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resumeToDisplay.certifications && resumeToDisplay.certifications.length > 0 ? `
        <div class="section">
          <h2>Certifications</h2>
          ${resumeToDisplay.certifications.map(cert => `
            <div class="education-item">
              <h3>${cert.name || ''}</h3>
              <div>${cert.issuing_organization || ''}</div>
              <div class="date">${cert.issue_date || ''}</div>
              ${cert.credential_id ? `<div>Credential ID: ${cert.credential_id}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </body>
      </html>
    `;

    // Create blob and download (export as HTML file for compatibility)
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeToDisplay.personal_info?.full_name?.replace(/\s+/g, '_') || 'resume'}_resume.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Decide whether to use sample or store data
  const isResumeEmpty = (r: Resume | null | undefined) => {
    if (!r) return true;
    const hasName = Boolean(r.personal_info?.full_name?.trim());
    const hasSummary = Boolean(r.professional_summary?.trim());
    const hasAnyList = (r.skills?.length || 0) > 0 || (r.experience?.length || 0) > 0 || (r.education?.length || 0) > 0 || (r.projects?.length || 0) > 0 || (r.certifications?.length || 0) > 0;
    return !(hasName || hasSummary || hasAnyList);
  };

  const resumeToDisplay = isResumeEmpty(storeResume) ? sampleResume : storeResume;
  
  // Show a banner if using sample data
  const isUsingSampleData = isResumeEmpty(storeResume);

  // Get section order from resume data or localStorage or use default
  const [sectionOrder] = useState(() => {
    // First try to get from resume data
    if (storeResume?.section_order && storeResume.section_order.length > 0) {
      return storeResume.section_order;
    }
    // Fallback to localStorage
    const stored = localStorage.getItem('sectionOrder');
    return stored ? JSON.parse(stored) : ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
  });

  // Find the selected template component
  const SelectedTemplate = templates.find(t => t.id === selectedTemplate)?.component || templates[0].component;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // const togglePrintGuide = () => {
  //   setShowPrintGuide(!showPrintGuide);
  // };

  return (
    <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'max-w-4xl mx-auto py-4 md:py-8 px-2 md:px-4'}`}>
      {isUsingSampleData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg no-print">
          <h3 className="font-bold text-lg mb-2 text-blue-700">Data Analyst Resume Template</h3>
          <p className="text-blue-700 mb-3">This is a sample Data Analyst resume template. Replace "Your Name" with your information to create your own professional resume.</p>
          <Link 
            to="/builder" 
            className="inline-flex items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            <FiEdit className="mr-2" /> Customize This Resume
          </Link>
        </div>
      )}
      
      <div className="mb-4 md:mb-6 no-print flex flex-wrap gap-2 md:gap-3 sticky top-0 bg-white z-10 p-2 border-b border-gray-200">
        <button
          onClick={handleExportPDF}
          className="flex items-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
        >
          <FiDownload className="mr-2" /> Export as PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          <FiPrinter className="mr-2" /> Print
        </button>
        <button
          onClick={handleExportDoc}
          className="flex items-center bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
        >
          <FiFile className="mr-2" /> Export as HTML
        </button>
        <button
          onClick={handleExportJson}
          className="flex items-center bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          <FiFileText className="mr-2" /> Export as JSON
        </button>
        {/* <button
          onClick={toggleFullScreen}
          className="flex items-center bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
        >
          {isFullScreen ? <FiMinimize className="mr-2" /> : <FiMaximize className="mr-2" />}
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
        </button> */}
        <Link
          to="/cover-letter"
          className="flex items-center bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
        >
          <FiFileText className="mr-2" /> Generate Cover Letter
        </Link>
        {/* <button
          onClick={togglePrintGuide}
          className="flex items-center bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
        >
          <FiDownload className="mr-2" /> {showPrintGuide ? 'Hide Print Guide' : 'Show Print Guide'}
        </button> */}
      </div>

      {/* {showPrintGuide && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 no-print">
          <h3 className="font-bold text-lg mb-2">Export Options:</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-red-700">Export as PDF (Recommended)</h4>
              <p className="text-sm text-gray-700">Click "Export as PDF" to download a professional PDF version of your resume. This creates a clean, formatted document perfect for job applications.</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700">Print</h4>
              <p className="text-sm text-gray-700">Use the browser's print function to print or save as PDF through the print dialog.</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-700">Export as JSON</h4>
              <p className="text-sm text-gray-700">Download your resume data as a JSON file for backup or to import into other systems.</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-blue-600">Tip: The "Export as PDF" option creates the most professional-looking document for job applications.</p>
        </div>
      )} */}

      <div className={`${!isFullScreen ? 'p-0' : 'p-4 mx-auto'} print:p-0 print:max-w-none`}>
        <div className="relative flex justify-center">
          <div className="no-print absolute -top-12 right-0 flex items-center space-x-2">
            <label htmlFor="preview-zoom" className="sr-only">Zoom</label>
            <select
              id="preview-zoom"
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value, 10))}
            >
              <option value={90}>90%</option>
              <option value={95}>95%</option>
              <option value={100}>100%</option>
              <option value={125}>125%</option>
              <option value={150}>150%</option>
            </select>
            <label htmlFor="preview-padding" className="sr-only">Padding</label>
            <input
              id="preview-padding"
              type="range"
              min={16}
              max={64}
              step={4}
              value={pagePadding}
              onChange={(e) => setPagePadding(parseInt(e.target.value, 10))}
            />
            <label htmlFor="preview-font-size" className="sr-only">Font Size</label>
            <select
              id="preview-font-size"
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              <option value="text-xs">XS</option>
              <option value="text-sm">S</option>
              <option value="text-base">M</option>
              <option value="text-lg">L</option>
              <option value="text-xl">XL</option>
            </select>
            <label htmlFor="preview-spacing" className="sr-only">Spacing</label>
            <select
              id="preview-spacing"
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="spacious">Spacious</option>
            </select>
            <label htmlFor="preview-line-height" className="sr-only">Line Height</label>
            <select
              id="preview-line-height"
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              value={lineHeight}
              onChange={(e) => setLineHeight(e.target.value)}
            >
              <option value="leading-tight">Tight</option>
              <option value="leading-normal">Normal</option>
              <option value="leading-relaxed">Relaxed</option>
              <option value="leading-loose">Loose</option>
            </select>
            <label htmlFor="preview-alignment" className="sr-only">Alignment</label>
            <select
              id="preview-alignment"
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            <label className="inline-flex items-center space-x-1">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
              <span className="text-xs text-gray-600">Grid</span>
            </label>
            <label className="inline-flex items-center space-x-1">
              <input type="checkbox" checked={showBorders} onChange={(e) => setShowBorders(e.target.checked)} />
              <span className="text-xs text-gray-600">Borders</span>
            </label>
            <label className="inline-flex items-center space-x-1">
              <input type="checkbox" checked={showShadows} onChange={(e) => setShowShadows(e.target.checked)} />
              <span className="text-xs text-gray-600">Shadows</span>
            </label>
          </div>
          <div
            className={`bg-white shadow-lg ${!isFullScreen ? 'rounded-lg origin-top transform' : ''} print:shadow-none`}
            style={{ width: '100%', maxWidth: '816px', minHeight: '1056px', scale: `${zoom}%` }}
          >
            <div className={`${font}`} style={{ padding: pagePadding }}>
              <SelectedTemplate 
                resume={resumeToDisplay} 
                color={color} 
                font={font} 
                sectionOrder={sectionOrder}
                fontSize={fontSize}
                lineHeight={lineHeight}
                spacing={spacing}
                alignment={alignment}
                showBorders={showBorders}
                showShadows={showShadows}
              />
            </div>
            {showGrid && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(59,130,246,0.08), rgba(59,130,246,0.08) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(59,130,246,0.08), rgba(59,130,246,0.08) 1px, transparent 1px, transparent 8px)'
                }}
              />
            )}
          </div>
          {isFullScreen && (
            <button 
              onClick={toggleFullScreen}
              className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg no-print"
            >
              <FiMinimize />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
