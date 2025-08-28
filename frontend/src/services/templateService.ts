import apiClient from './apiClient';

export interface Template {
  id: string;
  name: string;
  description: string;
  professions: string[];
  sections: string[];
  preview_image: string;
  category: string;
}

export interface TemplateContent {
  id: string;
  metadata: Template;
  content: {
    layout: string;
    font_family: string;
    accent_color: string;
    section_order: string[];
    styling: {
      header_style: string;
      section_spacing: string;
      bullet_style: string;
      emphasis: string;
    };
  };
  sample_content: any;
}

export interface TemplateListResponse {
  templates: Template[];
  total_count: number;
}

export interface TemplateSearchResponse {
  templates: Template[];
  query: string;
  total_count: number;
}

export interface CategoryListResponse {
  categories: string[];
  total_count: number;
}

export interface ProfessionListResponse {
  professions: string[];
  total_count: number;
}

class TemplateService {
  private cache = new Map<string, any>();
  private loadingStates = new Map<string, boolean>();

  async getAllTemplates(): Promise<TemplateListResponse> {
    const cacheKey = 'all_templates';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await apiClient.get('/templates');
      
      // Validate response data
      if (response.data && response.data.templates) {
        // Ensure all template data is properly formatted
        const validatedTemplates = response.data.templates.map((template: any) => ({
          id: String(template.id || ''),
          name: String(template.name || ''),
          description: String(template.description || ''),
          professions: Array.isArray(template.professions) 
            ? template.professions.map((p: any) => String(p))
            : [],
          sections: Array.isArray(template.sections)
            ? template.sections.map((s: any) => String(s))
            : [],
          preview_image: String(template.preview_image || ''),
          category: String(template.category || '')
        }));
        
        const validatedResponse = {
          ...response.data,
          templates: validatedTemplates
        };
        
        this.cache.set(cacheKey, validatedResponse);
        return validatedResponse;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  async getTemplatesByCategory(category: string): Promise<TemplateListResponse> {
    const cacheKey = `category_${category}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await apiClient.get(`/templates/category/${encodeURIComponent(category)}`);
    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getTemplatesByProfession(profession: string): Promise<TemplateListResponse> {
    const cacheKey = `profession_${profession}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await apiClient.get(`/templates/profession/${encodeURIComponent(profession)}`);
    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getTemplateContent(templateId: string): Promise<TemplateContent> {
    const cacheKey = `template_content_${templateId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await apiClient.get(`/templates/${templateId}`);
    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async searchTemplates(query: string): Promise<TemplateSearchResponse> {
    const response = await apiClient.get('/templates/search', {
      params: { query }
    });
    return response.data;
  }

  async getCategories(): Promise<CategoryListResponse> {
    const cacheKey = 'categories';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await apiClient.get('/templates/categories/list');
    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getProfessions(): Promise<ProfessionListResponse> {
    const cacheKey = 'professions';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await apiClient.get('/templates/professions/list');
    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  // Lazy loading with loading states
  async lazyLoadTemplate(templateId: string): Promise<TemplateContent> {
    if (this.loadingStates.get(templateId)) {
      // Template is already loading, wait for it
      return new Promise((resolve, reject) => {
        const checkLoading = () => {
          if (!this.loadingStates.get(templateId)) {
            const cached = this.cache.get(`template_content_${templateId}`);
            if (cached) {
              resolve(cached);
            } else {
              reject(new Error('Template loading failed'));
            }
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    this.loadingStates.set(templateId, true);
    try {
      const content = await this.getTemplateContent(templateId);
      this.loadingStates.set(templateId, false);
      return content;
    } catch (error) {
      this.loadingStates.set(templateId, false);
      throw error;
    }
  }

  // Preload templates for better UX
  async preloadTemplates(templateIds: string[]): Promise<void> {
    const promises = templateIds.map(id => this.lazyLoadTemplate(id));
    await Promise.allSettled(promises);
  }

  // Clear cache for specific template or all templates
  clearCache(templateId?: string): void {
    if (templateId) {
      this.cache.delete(`template_content_${templateId}`);
    } else {
      this.cache.clear();
    }
  }

  // Get loading state for a template
  isLoading(templateId: string): boolean {
    return this.loadingStates.get(templateId) || false;
  }
}

export const templateService = new TemplateService();
