
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  content: {
    fontSize: 12,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
});

interface CoverLetterPDFProps {
  coverLetter: string;
}

const CoverLetterPDF: React.FC<CoverLetterPDFProps> = ({ coverLetter }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Cover Letter</Text>
        <Text style={styles.content}>{coverLetter}</Text>
      </View>
    </Page>
  </Document>
);

export default CoverLetterPDF;
