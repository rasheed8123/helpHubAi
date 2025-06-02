import React, { useState } from 'react';
import { Select, Button, Card, Spin, message } from 'antd';
import { DownloadOutlined, TranslationOutlined } from '@ant-design/icons';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const { Option } = Select;

const MultiLanguageSummary = ({ ticketId, originalSummary }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState({});

  // Fetch supported languages on component mount
  React.useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('/api/translation/languages');
        setLanguages(response.data);
      } catch (error) {
        message.error('Failed to fetch supported languages');
      }
    };
    fetchLanguages();
  }, []);

  const handleLanguageChange = async (value) => {
    setSelectedLanguage(value);
    if (value === 'en') {
      setTranslatedSummary(originalSummary);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/translation/translate', {
        text: originalSummary,
        targetLanguage: value
      });
      setTranslatedSummary(response.data.translatedText);
    } catch (error) {
      message.error('Failed to translate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Ticket Summary', 20, 20);
    
    // Add language info
    doc.setFontSize(12);
    doc.text(`Language: ${languages[selectedLanguage]}`, 20, 30);
    
    // Add summary content
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(translatedSummary, 170);
    doc.text(splitText, 20, 40);
    
    // Save the PDF
    doc.save(`ticket-summary-${ticketId}-${selectedLanguage}.pdf`);
  };

  return (
    <Card 
      title="Multi-language Summary" 
      extra={
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={!translatedSummary}
        >
          Download PDF
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          value={selectedLanguage}
          onChange={handleLanguageChange}
          suffixIcon={<TranslationOutlined />}
        >
          {Object.entries(languages).map(([code, name]) => (
            <Option key={code} value={code}>{name}</Option>
          ))}
        </Select>
      </div>

      <div style={{ minHeight: 200 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Translating..." />
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {translatedSummary || originalSummary}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MultiLanguageSummary; 