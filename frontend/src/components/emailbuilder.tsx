"use client"
import React, { useState, useEffect } from 'react';
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
          value={template.style[`${section}Color`]}
          onChange={(e) => onStyleChange(section, 'Color', e.target.value)}
          className="h-9 w-full"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Size</label>
        <Select
          value={template.style[`${section}Size`]}
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
          value={template.style[`${section}Alignment`]}
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
  });

  const [sections, setSections] = useState(['title', 'image', 'content', 'footer']);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const moveSection = (dragIndex, hoverIndex) => {
    const newSections = [...sections];
    const draggedItem = newSections[dragIndex];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedItem);
    setSections(newSections);
  };
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...template.sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setTemplate(prev => ({ ...prev, sections: newSections }));
  };
  
  const handleMoveDown = (index: number) => {
    if (index === template.sections.length - 1) return;
    const newSections = [...template.sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setTemplate(prev => ({ ...prev, sections: newSections }));
  };

  const handleStyleChange = (section, property, value) => {
    setTemplate(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [`${section}${property}`]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
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

      if (!response.ok) throw new Error('Upload failed');

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

  const renderSectionContent = (section) => {
    const components = {
      title: (
        <div className="space-y-4">
          <Input
            value={template.title}
            onChange={(e) => setTemplate({ ...template, title: e.target.value })}
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
            value={template.content}
            onChange={(e) => setTemplate({ ...template, content: e.target.value })}
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
            value={template.footer}
            onChange={(e) => setTemplate({ ...template, footer: e.target.value })}
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
          {template.imageUrl && (
            <div className="space-y-2">
              <img
                src={template.imageUrl}
                alt="Template"
                className="max-w-full h-auto rounded-lg"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTemplate(prev => ({ ...prev, imageUrl: '' }))}
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
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Background Color</label>
                <Input
                  type="color"
                  value={template.style.backgroundColor}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    style: { ...prev.style, backgroundColor: e.target.value }
                  }))}
                  className="h-9 w-32"
                />
              </div>
              
              {sections.map((section, index) => (
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
                  onClick={() => console.log('Save template:', template)}
                >
                  Save Template
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                >
                  Preview
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
                style={{ backgroundColor: template.style.backgroundColor }}
              >
                <div 
                  className="mb-6"
                  style={{
                    color: template.style.titleColor,
                    fontSize: template.style.titleSize,
                    textAlign: template.style.titleAlignment,
                  }}
                >
                  {template.title || <span className="text-gray-400">Email Title</span>}
                </div>
                
                {template.imageUrl && (
                  <img 
                    src={template.imageUrl} 
                    alt="Template" 
                    className="my-6 max-w-full rounded-lg" 
                  />
                )}
                
                <div 
                  className="mb-6"
                  style={{
                    color: template.style.contentColor,
                    fontSize: template.style.contentSize,
                    textAlign: template.style.contentAlignment,
                  }}
                >
                  {template.content || <span className="text-gray-400">Email Content</span>}
                </div>
                
                <div 
                  className="mt-8"
                  style={{
                    color: template.style.footerColor,
                    fontSize: template.style.footerSize,
                    textAlign: template.style.footerAlignment,
                  }}
                >
                  {template.footer || <span className="text-gray-400">Footer Text</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
};

export default EmailBuilder;

// import React, { useState, useEffect } from 'react';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { 
//   Card,
//   CardContent
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { GripVertical } from "lucide-react";

// // Define the DraggableSection component
// const DraggableSection = ({ id, index, moveSection, children }) => {
//   const [{ isDragging }, drag] = useDrag({
//     type: 'section',
//     item: { id, index },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   });

//   const [, drop] = useDrop({
//     accept: 'section',
//     hover: (item, monitor) => {
//       if (!item) return;
      
//       const dragIndex = item.index;
//       const hoverIndex = index;

//       if (dragIndex === hoverIndex) return;
//       moveSection(dragIndex, hoverIndex);
//       item.index = hoverIndex;
//     },
//   });

//   return (
//     <div
//       ref={(node) => drag(drop(node))}
//       className={`relative p-4 border rounded mb-4 ${
//         isDragging ? 'opacity-50 border-dashed' : ''
//       }`}
//     >
//       <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move">
//         <GripVertical className="h-5 w-5 text-gray-400" />
//       </div>
//       <div className="ml-8">{children}</div>
//     </div>
//   );
// };

// // Define the StyleControls component
// const StyleControls = ({ section, template, onStyleChange }) => {
//   const fontSizes = [
//     { label: 'Small', value: '14px' },
//     { label: 'Medium', value: '16px' },
//     { label: 'Large', value: '18px' },
//     { label: 'Extra Large', value: '24px' },
//   ];

//   const alignments = [
//     { label: 'Left', value: 'left' },
//     { label: 'Center', value: 'center' },
//     { label: 'Right', value: 'right' },
//   ];

//   return (
//     <div className="grid grid-cols-3 gap-4 mt-2">
//       <div>
//         <label className="text-sm text-gray-600 mb-1 block">Color</label>
//         <Input
//           type="color"
//           value={template.style[`${section}Color`]}
//           onChange={(e) => onStyleChange(section, 'Color', e.target.value)}
//           className="h-8 w-full"
//         />
//       </div>
//       <div>
//         <label className="text-sm text-gray-600 mb-1 block">Size</label>
//         <Select
//           value={template.style[`${section}Size`]}
//           onValueChange={(value) => onStyleChange(section, 'Size', value)}
//         >
//           <SelectTrigger>
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             {fontSizes.map(size => (
//               <SelectItem key={size.value} value={size.value}>
//                 {size.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <label className="text-sm text-gray-600 mb-1 block">Alignment</label>
//         <Select
//           value={template.style[`${section}Alignment`]}
//           onValueChange={(value) => onStyleChange(section, 'Alignment', value)}
//         >
//           <SelectTrigger>
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             {alignments.map(align => (
//               <SelectItem key={align.value} value={align.value}>
//                 {align.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     </div>
//   );
// };

// const EmailBuilder = () => {
//   const [template, setTemplate] = useState({
//     title: '',
//     content: '',
//     imageUrl: '',
//     footer: '',
//     style: {
//       titleColor: '#000000',
//       titleSize: '24px',
//       titleAlignment: 'left',
//       contentColor: '#000000',
//       contentSize: '16px',
//       contentAlignment: 'left',
//       footerColor: '#000000',
//       footerSize: '14px',
//       footerAlignment: 'center',
//       backgroundColor: '#ffffff',
//     }
//   });

//   const [sections, setSections] = useState(['title', 'image', 'content', 'footer']);
//   const [preview, setPreview] = useState('');
//   const [uploading, setUploading] = useState(false);

//   const moveSection = (dragIndex, hoverIndex) => {
//     const newSections = [...sections];
//     const draggedItem = newSections[dragIndex];
//     newSections.splice(dragIndex, 1);
//     newSections.splice(hoverIndex, 0, draggedItem);
//     setSections(newSections);
//   };

//   const handleStyleChange = (section, property, value) => {
//     setTemplate(prev => ({
//       ...prev,
//       style: {
//         ...prev.style,
//         [`${section}${property}`]: value
//       }
//     }));
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await fetch('/api/uploadImage', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) throw new Error('Upload failed');

//       const data = await response.json();
//       setTemplate(prev => ({
//         ...prev,
//         imageUrl: data.url
//       }));
//     } catch (error) {
//       console.error('Failed to upload image:', error);
//       alert('Failed to upload image. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const renderSectionContent = (section) => {
//     switch (section) {
//       case 'title':
//         return (
//           <div>
//             <Input
//               value={template.title}
//               onChange={(e) => setTemplate({ ...template, title: e.target.value })}
//               placeholder="Enter email title"
//               className="mb-2"
//             />
//             <StyleControls 
//               section="title" 
//               template={template} 
//               onStyleChange={handleStyleChange}
//             />
//           </div>
//         );
//       case 'content':
//         return (
//           <div>
//             <Textarea
//               value={template.content}
//               onChange={(e) => setTemplate({ ...template, content: e.target.value })}
//               placeholder="Enter email content"
//               rows={6}
//               className="mb-2"
//             />
//             <StyleControls 
//               section="content" 
//               template={template} 
//               onStyleChange={handleStyleChange}
//             />
//           </div>
//         );
//       case 'footer':
//         return (
//           <div>
//             <Input
//               value={template.footer}
//               onChange={(e) => setTemplate({ ...template, footer: e.target.value })}
//               placeholder="Enter footer text"
//               className="mb-2"
//             />
//             <StyleControls 
//               section="footer" 
//               template={template} 
//               onStyleChange={handleStyleChange}
//             />
//           </div>
//         );
//       case 'image':
//         return (
//           <div>
//             <div className="flex items-center gap-4">
//               <Input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 disabled={uploading}
//               />
//               {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
//             </div>
//             {template.imageUrl && (
//               <div className="mt-4">
//                 <img
//                   src={template.imageUrl}
//                   alt="Template"
//                   className="max-w-full h-auto"
//                 />
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="mt-2"
//                   onClick={() => setTemplate(prev => ({ ...prev, imageUrl: '' }))}
//                 >
//                   Remove Image
//                 </Button>
//               </div>
//             )}
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="flex min-h-screen bg-gray-100">
//         <div className="flex-1 p-8">
//           <Card>
//             <CardContent className="p-6">
//               <div className="mb-6">
//                 <label className="text-sm text-gray-600 mb-1 block">Background Color</label>
//                 <Input
//                   type="color"
//                   value={template.style.backgroundColor}
//                   onChange={(e) => setTemplate(prev => ({
//                     ...prev,
//                     style: { ...prev.style, backgroundColor: e.target.value }
//                   }))}
//                   className="h-8 w-32"
//                 />
//               </div>
              
//               {sections.map((section, index) => (
//                 <DraggableSection
//                   key={section}
//                   id={section}
//                   index={index}
//                   moveSection={moveSection}
//                 >
//                   {renderSectionContent(section)}
//                 </DraggableSection>
//               ))}
              
//               <div className="flex gap-4 mt-6">
//                 <Button onClick={() => console.log('Save template:', template)}>
//                   Save Template
//                 </Button>
//                 <Button variant="outline">Preview</Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
        
//         <div className="flex-1 p-8">
//           <Card>
//             <CardContent className="p-6">
//               <div 
//                 className="preview-container"
//                 style={{ backgroundColor: template.style.backgroundColor }}
//               >
//                 <div style={{
//                   color: template.style.titleColor,
//                   fontSize: template.style.titleSize,
//                   textAlign: template.style.titleAlignment,
//                 }}>
//                   {template.title}
//                 </div>
//                 {template.imageUrl && (
//                   <img src={template.imageUrl} alt="Template" className="my-4 max-w-full" />
//                 )}
//                 <div style={{
//                   color: template.style.contentColor,
//                   fontSize: template.style.contentSize,
//                   textAlign: template.style.contentAlignment,
//                 }}>
//                   {template.content}
//                 </div>
//                 <div style={{
//                   color: template.style.footerColor,
//                   fontSize: template.style.footerSize,
//                   textAlign: template.style.footerAlignment,
//                 }}>
//                   {template.footer}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </DndProvider>
//   );
// };

// export default EmailBuilder;