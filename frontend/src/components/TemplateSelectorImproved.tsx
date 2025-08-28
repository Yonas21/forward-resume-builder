import React, { useState, useEffect, useCallback } from 'react';
import { templateService } from '../services/templateService';
import type { Template, TemplateContent } from '../services/templateService';
import { LoadingSpinner } from './LoadingSpinner';

interface TemplateSelectorImprovedProps {
  onTemplateSelect: (template: TemplateContent) => void;
  selectedTemplateId?: string;
  userProfession?: string;
}

const TemplateSelectorImproved: React.FC<TemplateSelectorImprovedProps> = ({
  onTemplateSelect,
  selectedTemplateId,
  userProfession
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProfession, setSelectedProfession] = useState<string>('all');
  const [loadingTemplates, setLoadingTemplates] = useState<Set<string>>(new Set());
  const [previewTemplates, setPreviewTemplates] = useState<Set<string>>(new Set());

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [templatesData, categoriesData, professionsData] = await Promise.all([
          templateService.getAllTemplates(),
          templateService.getCategories(),
          templateService.getProfessions()
        ]);

        setTemplates(templatesData.templates);
        setCategories(categoriesData.categories);
        setProfessions(professionsData.professions);

        // Preload templates for user's profession if available
        if (userProfession) {
          const professionTemplates = await templateService.getTemplatesByProfession(userProfession);
          if (professionTemplates.templates.length > 0) {
            setSelectedProfession(userProfession);
            setTemplates(professionTemplates.templates);
          }
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [userProfession]);

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.professions.some(prof => prof.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesProfession = selectedProfession === 'all' || 
      template.professions.some(prof => prof.toLowerCase().includes(selectedProfession.toLowerCase()));

    return matchesSearch && matchesCategory && matchesProfession;
  });

  // Handle template selection with lazy loading
  const handleTemplateSelect = useCallback(async (template: Template) => {
    if (templateService.isLoading(template.id)) {
      return; // Already loading
    }

    setLoadingTemplates(prev => new Set(prev).add(template.id));
    
    try {
      const templateContent = await templateService.lazyLoadTemplate(template.id);
      onTemplateSelect(templateContent);
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoadingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    }
  }, [onTemplateSelect]);

  // Handle category filter
  const handleCategoryChange = useCallback(async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    
    try {
      if (category === 'all') {
        const allTemplates = await templateService.getAllTemplates();
        setTemplates(allTemplates.templates);
      } else {
        const categoryTemplates = await templateService.getTemplatesByCategory(category);
        setTemplates(categoryTemplates.templates);
      }
    } catch (error) {
      console.error('Error loading category templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle profession filter
  const handleProfessionChange = useCallback(async (profession: string) => {
    setSelectedProfession(profession);
    setLoading(true);
    
    try {
      if (profession === 'all') {
        const allTemplates = await templateService.getAllTemplates();
        setTemplates(allTemplates.templates);
      } else {
        const professionTemplates = await templateService.getTemplatesByProfession(profession);
        setTemplates(professionTemplates.templates);
      }
    } catch (error) {
      console.error('Error loading profession templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      try {
        const searchResults = await templateService.searchTemplates(query);
        setTemplates(searchResults.templates);
      } catch (error) {
        console.error('Error searching templates:', error);
      }
    } else {
      // Reset to all templates if search is cleared
      const allTemplates = await templateService.getAllTemplates();
      setTemplates(allTemplates.templates);
    }
  }, []);

  // Preload template preview on hover
  const handleTemplateHover = useCallback((templateId: string) => {
    if (!previewTemplates.has(templateId)) {
      setPreviewTemplates(prev => new Set(prev).add(templateId));
      templateService.lazyLoadTemplate(templateId).catch(console.error);
    }
  }, [previewTemplates]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Template</h2>
        <p className="text-gray-600">Select a professional template that matches your industry and experience level.</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates by name, description, or profession..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Profession Filter */}
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
            <select
              value={selectedProfession}
              onChange={(e) => handleProfessionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Professions</option>
              {professions.map(profession => (
                <option key={profession} value={profession}>{profession}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${
              selectedTemplateId === template.id ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => handleTemplateSelect(template)}
            onMouseEnter={() => handleTemplateHover(template.id)}
          >
            {/* Template Preview */}
            <div className="aspect-[3/4] bg-gray-100 rounded-t-lg relative overflow-hidden">
              {template.preview_image ? (
                <img
                  src={template.preview_image}
                  alt={template.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg"></div>
                    <p className="text-sm text-gray-500">Preview</p>
                  </div>
                </div>
              )}
              
              {/* Loading Overlay */}
              {loadingTemplates.has(template.id) && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
              
              {/* Professions */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.professions.slice(0, 2).map((profession, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {profession}
                  </span>
                ))}
                {template.professions.length > 2 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{template.professions.length - 2}
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">{template.category}</span>
                <span className="text-xs text-gray-500">{template.sections.length} sections</span>
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedTemplateId === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to find more templates.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectorImproved;
