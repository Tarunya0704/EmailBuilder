"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

const EmailBuilder = () => {
  const [template, setTemplate] = useState({
    title: '',
    content: '',
    imageUrl: '',
    footer: '',
    style: {
      titleColor: '#000000',
      contentColor: '#000000',
      fontSize: '16px',
      alignment: 'left'
    }
  });

  const [sections, setSections] = useState(['title', 'image', 'content', 'footer']);
  const [preview, setPreview] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/uploadImage', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setTemplate(prev => ({
        ...prev,
        imageUrl: data.url
      }));
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchEmailLayout();
    fetchSavedTemplates();
  }, []);

  const fetchEmailLayout = async () => {
    try {
      const response = await fetch('/api/emailLayout');
      const data = await response.json();
      setPreview(data.layout);
    } catch (error) {
      console.error('Failed to fetch layout:', error);
    }
  };

  const fetchSavedTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setSavedTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (response.ok) {
        alert('Template saved successfully!');
        fetchSavedTemplates();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      setSections(newSections);
    }
  };

  const renderSection = (section: string, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < sections.length - 1;

    return (
      <div key={section} className="relative p-4 border rounded mb-4">
        <div className="absolute right-2 top-2 flex gap-2">
          {canMoveUp && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => moveSection(index, 'up')}
            >
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
          )}
          {canMoveDown && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => moveSection(index, 'down')}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        {renderSectionContent(section)}
      </div>
    );
  };

  const renderSectionContent = (section: string) => {
    switch (section) {
      case 'title':
        return (
          <div className="space-y-4">
            <Input
              value={template.title}
              onChange={(e) => setTemplate({ ...template, title: e.target.value })}
              placeholder="Enter email title"
            />
            <Input
              type="color"
              value={template.style.titleColor}
              onChange={(e) => setTemplate({
                ...template,
                style: { ...template.style, titleColor: e.target.value }
              })}
            />
          </div>
        );
      case 'content':
        return (
          <div className="space-y-4">
            <Textarea
              value={template.content}
              onChange={(e) => setTemplate({ ...template, content: e.target.value })}
              placeholder="Enter email content"
              rows={6}
            />
            <div className="flex gap-4">
              <Input
                type="color"
                value={template.style.contentColor}
                onChange={(e) => setTemplate({
                  ...template,
                  style: { ...template.style, contentColor: e.target.value }
                })}
              />
              <Select
                value={template.style.fontSize}
                onChange={(e) => setTemplate({
                  ...template,
                  style: { ...template.style, fontSize: e.target.value }
                })}
              >
                <option value="14px">Small</option>
                <option value="16px">Medium</option>
                <option value="18px">Large</option>
              </Select>
              <Select
                value={template.style.alignment}
                onChange={(e) => setTemplate({
                  ...template,
                  style: { ...template.style, alignment: e.target.value }
                })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Select>
            </div>
          </div>
        );
      case 'image':
        return (
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {template.imageUrl && (
              <img
                src={template.imageUrl}
                alt="Template"
                className="mt-4 max-w-full h-auto"
              />
            )}
          </div>
        );
      case 'footer':
        return (
          <Input
            value={template.footer}
            onChange={(e) => setTemplate({ ...template, footer: e.target.value })}
            placeholder="Enter footer text"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-8">
        <Card>
          <CardContent className="p-6">
            {sections.map((section, index) => renderSection(section, index))}
            <div className="flex gap-4 mt-6">
              <Button onClick={handleSaveTemplate}>Save Template</Button>
              <Button onClick={handleDownload}>Download HTML</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex-1 p-8">
        <Card>
          <CardContent className="p-6">
            <div 
              className="preview-container"
              dangerouslySetInnerHTML={{ 
                __html: preview
                  .replace('{{title}}', template.title)
                  .replace('{{content}}', template.content)
                  .replace('{{imageUrl}}', template.imageUrl)
                  .replace('{{footer}}', template.footer)
              }} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailBuilder;