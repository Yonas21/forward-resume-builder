import React from 'react';
import './PreviewPage.css'; // Add appropriate CSS styles

const templates = [
    {
        id: 1,
        name: 'Professional Template',
        description: 'A clean and formal resume template for professional roles.',
        previewImage: 'path/to/professional-template.jpg',
    },
    {
        id: 2,
        name: 'Creative Template',
        description: 'A vibrant template for creative positions.',
        previewImage: 'path/to/creative-template.jpg',
    },
    {
        id: 3,
        name: 'Minimalist Template',
        description: 'A simple and elegant template for all professions.',
        previewImage: 'path/to/minimalist-template.jpg',
    },
];

const PreviewPage: React.FC = () => {
    return (
        <div className="preview-page">
            <h1>Resume Templates</h1>
            <div className="template-list">
                {templates.map(template => (
                    <div key={template.id} className="template-card">
                        <img src={template.previewImage} alt={`${template.name} preview`} />
                        <h2>{template.name}</h2>
                        <p>{template.description}</p>
                        <button>Select Template</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviewPage;
