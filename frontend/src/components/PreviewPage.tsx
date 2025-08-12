import React from 'react';
import './PreviewPage.css'; // Add appropriate CSS styles
import { previewTemplates } from '../data/sample';

const PreviewPage: React.FC = () => {
    return (
        <div className="preview-page">
            <h1>Resume Templates</h1>
            <div className="template-list">
                {previewTemplates.map(template => (
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
