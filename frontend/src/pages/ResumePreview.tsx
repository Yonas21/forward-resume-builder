import React, { useEffect, useState } from 'react';
import type { Resume } from '../types';
import { templates } from '../components/TemplateConfig';
import { FiDownload, FiPrinter, FiFileText, FiMaximize, FiMinimize, FiEdit } from 'react-icons/fi';
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(95);
  const [showPrintGuide, setShowPrintGuide] = useState(false);
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
          const pdfDoc = <ResumePDF resume={resumeToExport} sectionOrder={sectionOrder} color={color} font={font as any} />;
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

  // Get section order from localStorage or use default
  const [sectionOrder] = useState(() => {
    const stored = localStorage.getItem('sectionOrder');
    return stored ? JSON.parse(stored) : ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
  });

  // Find the selected template component
  const SelectedTemplate = templates.find(t => t.id === selectedTemplate)?.component || templates[0].component;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const togglePrintGuide = () => {
    setShowPrintGuide(!showPrintGuide);
  };

  return (
    <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'max-w-4xl mx-auto py-8 px-4'}`}>
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
      
      <div className="mb-6 no-print flex flex-wrap gap-3 sticky top-0 bg-white z-10 p-2 border-b border-gray-200">
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
          onClick={handleExportJson}
          className="flex items-center bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          <FiFileText className="mr-2" /> Export as JSON
        </button>
        <button
          onClick={toggleFullScreen}
          className="flex items-center bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
        >
          {isFullScreen ? <FiMinimize className="mr-2" /> : <FiMaximize className="mr-2" />}
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
        </button>
        <button
          onClick={togglePrintGuide}
          className="flex items-center bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
        >
          <FiDownload className="mr-2" /> {showPrintGuide ? 'Hide Print Guide' : 'Show Print Guide'}
        </button>
      </div>

      {showPrintGuide && (
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
      )}

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
            <label className="inline-flex items-center space-x-1">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
              <span className="text-xs text-gray-600">Grid</span>
            </label>
          </div>
          <div
            className={`bg-white shadow-lg ${!isFullScreen ? 'rounded-lg origin-top transform' : ''} print:shadow-none`}
            style={{ width: '816px', minHeight: '1056px', scale: `${zoom}%` as any }}
          >
            <div className={`${font}`} style={{ padding: pagePadding }}>
              <SelectedTemplate resume={resumeToDisplay} color={color} font={font} sectionOrder={sectionOrder} />
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
