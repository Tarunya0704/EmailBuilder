"use client"
import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical } from "lucide-react";

const DraggableSection = ({ id, index, moveSection, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'section',
    hover: (item, monitor) => {
      if (!item) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <Card className={`mb-6 ${isDragging ? 'opacity-50 border-dashed' : ''}`}>
      <CardContent className="p-6">
        <div ref={(node) => drag(drop(node))} className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-8">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const StyleControls = ({ section, template, onStyleChange }) => {
  const fontSizes = [
    { label: 'Small', value: '14px' },
    { label: 'Medium', value: '16px' },
    { label: 'Large', value: '18px' },
    { label: 'Extra Large', value: '24px' },
  ];

  const alignments = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Color</label>
        <Input
          type="color"
          value={template.config.style[`${section}Color`]}
          onChange={(e) => onStyleChange(section, 'Color', e.target.value)}
          className="h-9 w-full"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Size</label>
        <Select
          value={template.config.style[`${section}Size`]}
          onValueChange={(value) => onStyleChange(section, 'Size', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map(size => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Alignment</label>
        <Select
          value={template.config.style[`${section}Alignment`]}
          onValueChange={(value) => onStyleChange(section, 'Alignment', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {alignments.map(align => (
              <SelectItem key={align.value} value={align.value}>
                {align.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};


const EmailBuilder = () => {
  const [template, setTemplate] = useState({
    name: '',
    layout: 'default.html',
    config: {
      sections: ['title', 'image', 'content', 'footer'],
      title: '',
      content: '',
      imageUrl: '',
      footer: '',
      style: {
        titleColor: '#000000',
        titleSize: '24px',
        titleAlignment: 'left',
        contentColor: '#000000',
        contentSize: '16px',
        contentAlignment: 'left',
        footerColor: '#000000',
        footerSize: '14px',
        footerAlignment: 'center',
        backgroundColor: '#ffffff',
      }
    }
  });

  const [uploading, setUploading] = useState(false);
  const [templateId, setTemplateId] = useState<string>('');

  const moveSection = (dragIndex, hoverIndex) => {
    const newSections = [...template.config.sections];
    const draggedItem = newSections[dragIndex];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedItem);
    setTemplate(prev => ({
      ...prev,
      config: {
        ...prev.config,
        sections: newSections
      }
    }));
  };

  const handleStyleChange = (section, property, value) => {
    setTemplate(prev => ({
      ...prev,
      config: {
        ...prev.config,
        style: {
          ...prev.config.style,
          [`${section}${property}`]: value
        }
      }
    }));
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch(`${API_URL}/uploadImage`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Upload failed');
      }
  
      const data = await response.json();
      
      // Store the complete URL returned from the server
      if (data.url) {
        setTemplate(prev => ({
          ...prev,
          config: {
            ...prev.config,
            imageUrl: data.url // This should now be a complete URL
          }
        }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSaveTemplate = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/uploadEmailConfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.title || 'Untitled Template',
          layout: 'default.html',
          config: {
            variables: {
              title: template.title,
              content: template.content,
              footer: template.footer,
            },
            images: template.imageUrl ? [template.imageUrl] : [],
            styles: template.style
          }
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        setTemplateId(data.template._id);
        alert('Template saved successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    }
  };
  const handleDownloadTemplate = async () => {
    if (!templateId) {
      alert('Please save the template first');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/renderAndDownloadTemplate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name || 'email-template'}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const renderImagePreview = () => {
    if (!template.config.imageUrl) return null;

    return (
      <div className="space-y-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <img
            src={template.config.imageUrl}
            alt="Template preview"
            className="object-contain w-full h-full"
            onError={(e) => {
              console.error('Image failed to load:', template.config.imageUrl);
              // You can create a proper placeholder image in your public folder
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"%3E%3Cpath fill="%23ccc" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E';
            }}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setTemplate(prev => ({
            ...prev,
            config: {
              ...prev.config,
              imageUrl: ''
            }
          }))}
        >
          Remove Image
        </Button>
      </div>
    );
  };




  const renderSectionContent = (section) => {
    const components = {
      title: (
        <div className="space-y-4">
          <Input
            value={template.config.title}
            onChange={(e) => setTemplate(prev => ({
              ...prev,
              config: {
                ...prev.config,
                title: e.target.value
              }
            }))}
            placeholder="Enter email title"
            className="w-full"
          />
          <StyleControls 
            section="title" 
            template={template} 
            onStyleChange={handleStyleChange}
          />
        </div>
      ),
      content: (
        <div className="space-y-4">
          <Textarea
            value={template.config.content}
            onChange={(e) => setTemplate(prev => ({
              ...prev,
              config: {
                ...prev.config,
                content: e.target.value
              }
            }))}
            placeholder="Enter email content"
            rows={6}
            className="w-full"
          />
          <StyleControls 
            section="content" 
            template={template} 
            onStyleChange={handleStyleChange}
          />
        </div>
      ),
      footer: (
        <div className="space-y-4">
          <Input
            value={template.config.footer}
            onChange={(e) => setTemplate(prev => ({
              ...prev,
              config: {
                ...prev.config,
                footer: e.target.value
              }
            }))}
            placeholder="Enter footer text"
            className="w-full"
          />
          <StyleControls 
            section="footer" 
            template={template} 
            onStyleChange={handleStyleChange}
          />
        </div>
      ),
      image: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full"
            />
            {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
          </div>
          {template.config.imageUrl && (
  <div className="space-y-2">
    <img
      src={template.config.imageUrl}
      alt="Template"
      className="max-w-full h-auto rounded-lg"
      onError={(e) => {
        console.error('Image failed to load:', template.config.imageUrl);
        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%23ccc" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E';
      }}
    />
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setTemplate(prev => ({
        ...prev,
        config: {
          ...prev.config,
          imageUrl: ''
        }
      }))}
    >
      Remove Image
    </Button>
  </div>
)}
        </div>
      )
    };

    return components[section] || null;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen bg-gray-50 p-8 gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Email Template Builder</CardTitle>
              <Input
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Template Name"
                className="mt-2"
              />
            </CardHeader>
    
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Background Color</label>
                <Input
                  type="color"
                  value={template.config.style.backgroundColor}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      style: { ...prev.config.style, backgroundColor: e.target.value }
                    }
                  }))}
                  className="h-9 w-32"
                />
              </div>
              
              {template.config.sections.map((section, index) => (
                <DraggableSection
                  key={section}
                  id={section}
                  index={index}
                  moveSection={moveSection}
                >
                  {renderSectionContent(section)}
                </DraggableSection>
              ))}
              
              <div className="flex gap-4 pt-4">
                <Button 
                  className="w-full"
                  onClick={handleSaveTemplate}
                >
                  Save Template
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadTemplate}
                >
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
              
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="preview-container p-6 rounded-lg"
                style={{ backgroundColor: template.config.style.backgroundColor }}
              >
                <div 
                  className="mb-6"
                  style={{
                    color: template.config.style.titleColor,
                    fontSize: template.config.style.titleSize,
                    textAlign: template.config.style.titleAlignment,
                  }}
                >
                  {template.config.title || <span className="text-gray-400">Email Title</span>}
                </div>
                
                {template.config.imageUrl && (
  <div className="space-y-2">
    <img
      src={template.config.imageUrl}
      alt="Template"
      className="max-w-full h-auto rounded-lg"
      onError={(e) => {
        console.error('Image failed to load:', template.config.imageUrl);
        e.currentTarget.src = '/placeholder-image.png'; // Add a placeholder image
      }}
    />
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setTemplate(prev => ({
        ...prev,
        config: {
          ...prev.config,
          imageUrl: ''
        }
      }))}
    >
      Remove Image
    </Button>
  </div>
)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
};

export default EmailBuilder;

