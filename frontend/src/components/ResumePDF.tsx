import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  
  
} from '@react-pdf/renderer';
import type { Resume } from '../types';

// Register fonts (optional - you can use default fonts)
// Font.register({
//   family: 'Helvetica',
//   src: 'Helvetica',
// });

const createStyles = (accentColor: string, fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier') =>
  StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 40,
      fontSize: 10,
      fontFamily,
    },
    header: {
      marginBottom: 20,
      textAlign: 'center',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: accentColor || '#333333',
    },
    contactInfo: {
      fontSize: 10,
      color: '#666666',
      marginBottom: 2,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      color: accentColor || '#333333',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: 4,
    },
    summary: {
      fontSize: 10,
      lineHeight: 1.5,
      color: '#1f2937',
    },
    experienceItem: {
      marginBottom: 12,
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    companyPosition: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
    },
    date: {
      fontSize: 10,
      color: '#6b7280',
    },
    company: {
      fontSize: 10,
      color: '#374151',
      marginBottom: 2,
    },
    description: {
      fontSize: 9,
      lineHeight: 1.4,
      marginLeft: 8,
      color: '#1f2937',
    },
    bulletPoint: {
      marginBottom: 2,
    },
    educationItem: {
      marginBottom: 8,
    },
    educationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    institution: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#111827',
    },
    degree: {
      fontSize: 10,
      color: '#374151',
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    skillItem: {
      fontSize: 9,
      color: '#374151',
      marginRight: 8,
    },
    projectItem: {
      marginBottom: 10,
    },
    projectName: {
      fontSize: 11,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#111827',
    },
    projectDescription: {
      fontSize: 9,
      lineHeight: 1.4,
      color: '#1f2937',
      marginBottom: 2,
    },
    projectTech: {
      fontSize: 8,
      color: '#6b7280',
      fontStyle: 'italic',
    },
    certificationItem: {
      marginBottom: 6,
    },
    certificationName: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#111827',
    },
    certificationDetails: {
      fontSize: 8,
      color: '#6b7280',
    },
  });

interface ResumePDFProps {
  resume: Resume;
  sectionOrder?: string[];
  color?: string;
  font?: 'font-sans' | 'font-serif' | 'font-mono';
}

const ResumePDF: React.FC<ResumePDFProps> = ({ resume, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'], color = '#333333', font = 'font-sans' }) => {
  const pdfFont: 'Helvetica' | 'Times-Roman' | 'Courier' =
    font === 'font-serif' ? 'Times-Roman' : font === 'font-mono' ? 'Courier' : 'Helvetica';
  const styles = createStyles(color, pdfFont);
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'personal':
        return (
          <View style={styles.header}>
            <Text style={styles.name}>{resume.personal_info?.full_name || 'Your Name'}</Text>
            {resume.personal_info?.email ? (
              <Text style={styles.contactInfo}>{resume.personal_info.email}</Text>
            ) : null}
            {resume.personal_info?.phone ? (
              <Text style={styles.contactInfo}>{resume.personal_info.phone}</Text>
            ) : null}
            {resume.personal_info?.location ? (
              <Text style={styles.contactInfo}>{resume.personal_info.location}</Text>
            ) : null}
            {resume.personal_info?.linkedin && (
              <Text style={styles.contactInfo}>{resume.personal_info.linkedin}</Text>
            )}
            {resume.personal_info?.github && (
              <Text style={styles.contactInfo}>{resume.personal_info.github}</Text>
            )}
            {resume.personal_info?.website && (
              <Text style={styles.contactInfo}>{resume.personal_info.website}</Text>
            )}
          </View>
        );

      case 'summary':
        return resume.professional_summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{resume.professional_summary}</Text>
          </View>
        ) : null;

      case 'experience':
        return resume.experience && resume.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.companyPosition}>{exp.position}</Text>
                  <Text style={styles.date}>{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.description.map((desc, descIndex) => (
                  <Text key={descIndex} style={[styles.description, styles.bulletPoint]}>
                    • {desc}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null;

      case 'education':
        return resume.education && resume.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.institution}>{edu.institution}</Text>
                  <Text style={styles.date}>{edu.start_date} - {edu.end_date}</Text>
                </View>
                <Text style={styles.degree}>{edu.degree} in {edu.field_of_study}</Text>
                {edu.gpa && <Text style={styles.degree}>GPA: {edu.gpa}</Text>}
              </View>
            ))}
          </View>
        ) : null;

      case 'skills':
        return resume.skills && resume.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {resume.skills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  {skill.name} ({skill.level})
                </Text>
              ))}
            </View>
          </View>
        ) : null;

      case 'projects':
        return resume.projects && resume.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectDescription}>{project.description}</Text>
                {project.technologies && (
                  <Text style={styles.projectTech}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : null;

      case 'certifications':
        return resume.certifications && resume.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationDetails}>
                  {cert.issuing_organization} • {cert.issue_date}
                  {cert.expiration_date && ` • Expires: ${cert.expiration_date}`}
                </Text>
              </View>
            ))}
          </View>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
      </Page>
    </Document>
  );
};

export default ResumePDF;
