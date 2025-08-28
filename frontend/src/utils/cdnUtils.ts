interface CDNConfig {
  enabled: boolean;
  baseUrl: string;
  assets: {
    images: {
      path: string;
      formats: string[];
      optimization: {
        quality: number;
        formats: string[];
        sizes: number[];
      };
    };
    templates: {
      path: string;
      previews: string;
      thumbnails: string;
    };
    fonts: {
      path: string;
      families: string[];
    };
    icons: {
      path: string;
      sprite: string;
    };
  };
  caching: {
    images: {
      maxAge: number;
      immutable: boolean;
    };
    fonts: {
      maxAge: number;
      immutable: boolean;
    };
    templates: {
      maxAge: number;
      immutable: boolean;
    };
  };
  compression: {
    enabled: boolean;
    algorithms: string[];
  };
}

class CDNUtils {
  private config: CDNConfig | null = null;
  private supportsWebP: boolean = false;
  private supportsAvif: boolean = false;

  constructor() {
    this.detectImageSupport();
  }

  private async loadConfig(): Promise<CDNConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await fetch('/cdn-config.json');
      this.config = await response.json();
      return this.config!;
    } catch (error) {
      console.warn('Failed to load CDN config, using defaults');
      return this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): CDNConfig {
    return {
      enabled: false,
      baseUrl: '',
      assets: {
        images: {
          path: '/images',
          formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
          optimization: {
            quality: 85,
            formats: ['webp', 'avif'],
            sizes: [320, 640, 1280, 1920]
          }
        },
        templates: {
          path: '/templates',
          previews: '/templates/previews',
          thumbnails: '/templates/thumbnails'
        },
        fonts: {
          path: '/fonts',
          families: ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Segoe UI']
        },
        icons: {
          path: '/icons',
          sprite: '/icons/sprite.svg'
        }
      },
      caching: {
        images: { maxAge: 31536000, immutable: true },
        fonts: { maxAge: 31536000, immutable: true },
        templates: { maxAge: 86400, immutable: false }
      },
      compression: {
        enabled: true,
        algorithms: ['gzip', 'brotli']
      }
    };
  }

  private detectImageSupport(): void {
    // Detect WebP support
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      this.supportsWebP = webP.height === 2;
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

    // Detect AVIF support
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      this.supportsAvif = avif.height === 2;
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }

  async getImageUrl(
    path: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    } = {}
  ): Promise<string> {
    const config = await this.loadConfig();
    
    if (!config.enabled) {
      return path;
    }

    const { width, height, quality = config.assets.images.optimization.quality, format = 'auto' } = options;
    
    // Determine best format
    let selectedFormat = format;
    if (format === 'auto') {
      if (this.supportsAvif) {
        selectedFormat = 'avif';
      } else if (this.supportsWebP) {
        selectedFormat = 'webp';
      } else {
        selectedFormat = 'jpg';
      }
    }

    // Build CDN URL
    let url = `${config.baseUrl}${config.assets.images.path}${path}`;
    
    // Add query parameters for optimization
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality !== config.assets.images.optimization.quality) {
      params.append('q', quality.toString());
    }
    if (selectedFormat !== 'auto') {
      params.append('f', selectedFormat);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  async getTemplatePreviewUrl(templateId: string, size: 'thumbnail' | 'preview' = 'preview'): Promise<string> {
    const config = await this.loadConfig();
    
    if (!config.enabled) {
      return `/templates/${templateId}-${size}.png`;
    }

    const path = size === 'thumbnail' 
      ? config.assets.templates.thumbnails 
      : config.assets.templates.previews;
    
    return `${config.baseUrl}${path}/${templateId}.png`;
  }

  async getFontUrl(fontFamily: string, weight: string = '400', style: string = 'normal'): Promise<string> {
    const config = await this.loadConfig();
    
    if (!config.enabled) {
      return `/fonts/${fontFamily}-${weight}-${style}.woff2`;
    }

    return `${config.baseUrl}${config.assets.fonts.path}/${fontFamily}-${weight}-${style}.woff2`;
  }

  async getIconUrl(iconName: string): Promise<string> {
    const config = await this.loadConfig();
    
    if (!config.enabled) {
      return `/icons/${iconName}.svg`;
    }

    return `${config.baseUrl}${config.assets.icons.path}/${iconName}.svg`;
  }

  async preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      img.src = url;
    });
  }

  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url));
    await Promise.allSettled(promises);
  }

  // Lazy loading with intersection observer
  createLazyImageLoader(
    selector: string,
    options: {
      rootMargin?: string;
      threshold?: number;
    } = {}
  ): void {
    const { rootMargin = '50px', threshold = 0.1 } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      },
      { rootMargin, threshold }
    );

    document.querySelectorAll(selector).forEach((img) => {
      observer.observe(img);
    });
  }

  // Generate responsive image srcset
  async generateSrcSet(
    basePath: string,
    sizes: number[] = [320, 640, 1280, 1920]
  ): Promise<string> {
    const urls = await Promise.all(
      sizes.map(async (size) => {
        const url = await this.getImageUrl(basePath, { width: size });
        return `${url} ${size}w`;
      })
    );
    
    return urls.join(', ');
  }

  // Get optimal image size based on container
  getOptimalImageSize(containerWidth: number, pixelRatio: number = 1): number {
    const config = this.config?.assets.images.optimization.sizes || [320, 640, 1280, 1920];
    const targetWidth = containerWidth * pixelRatio;
    
    return config.find(size => size >= targetWidth) || config[config.length - 1];
  }
}

export const cdnUtils = new CDNUtils();
