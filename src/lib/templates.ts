import { SlideTemplate } from './types';

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Large centered headline with subhead and brand logo area',
    thumbnail: '/templates/title-slide.png',
    slots: [
      {
        id: 'headline',
        type: 'headline',
        label: 'Main Headline',
        required: true,
        position: { x: 10, y: 30, width: 80, height: 20 },
        placeholder: 'Enter your main title...',
      },
      {
        id: 'subhead',
        type: 'subhead',
        label: 'Subheadline',
        required: false,
        position: { x: 15, y: 52, width: 70, height: 10 },
        placeholder: 'Enter a subtitle...',
      },
    ],
  },
  {
    id: 'content-image-split',
    name: 'Content + Image',
    description: 'Split layout with text on left and image/chart on right',
    thumbnail: '/templates/content-image.png',
    slots: [
      {
        id: 'headline',
        type: 'headline',
        label: 'Headline',
        required: true,
        position: { x: 5, y: 5, width: 45, height: 10 },
        placeholder: 'Section headline...',
      },
      {
        id: 'body',
        type: 'body',
        label: 'Body Text',
        required: true,
        position: { x: 5, y: 18, width: 45, height: 55 },
        placeholder: 'Enter your main content here...',
      },
      {
        id: 'image',
        type: 'image',
        label: 'Image/Chart',
        required: false,
        position: { x: 52, y: 5, width: 43, height: 68 },
        placeholder: 'Upload or paste image URL...',
      },
      {
        id: 'isi',
        type: 'isi',
        label: 'ISI Section',
        required: false,
        position: { x: 0, y: 85, width: 100, height: 15 },
      },
    ],
  },
  {
    id: 'full-image-overlay',
    name: 'Full Image with Overlay',
    description: 'Full-bleed image with text overlay box',
    thumbnail: '/templates/full-image.png',
    slots: [
      {
        id: 'image',
        type: 'image',
        label: 'Background Image',
        required: true,
        position: { x: 0, y: 0, width: 100, height: 100 },
        placeholder: 'Upload full-bleed background image...',
      },
      {
        id: 'headline',
        type: 'headline',
        label: 'Overlay Headline',
        required: true,
        position: { x: 5, y: 60, width: 40, height: 10 },
        placeholder: 'Headline text...',
      },
      {
        id: 'body',
        type: 'body',
        label: 'Overlay Body',
        required: false,
        position: { x: 5, y: 72, width: 40, height: 15 },
        placeholder: 'Additional text...',
      },
      {
        id: 'isi',
        type: 'isi',
        label: 'ISI Section',
        required: false,
        position: { x: 0, y: 88, width: 100, height: 12 },
      },
    ],
  },
  {
    id: 'three-column',
    name: 'Three Column',
    description: 'Headline with three equal columns below for features or comparison',
    thumbnail: '/templates/three-column.png',
    slots: [
      {
        id: 'headline',
        type: 'headline',
        label: 'Main Headline',
        required: true,
        position: { x: 10, y: 5, width: 80, height: 10 },
        placeholder: 'Section headline...',
      },
      {
        id: 'column1-title',
        type: 'subhead',
        label: 'Column 1 Title',
        required: true,
        position: { x: 5, y: 20, width: 28, height: 8 },
        placeholder: 'Column 1 title...',
      },
      {
        id: 'column1-body',
        type: 'body',
        label: 'Column 1 Content',
        required: true,
        position: { x: 5, y: 30, width: 28, height: 45 },
        placeholder: 'Column 1 content...',
      },
      {
        id: 'column2-title',
        type: 'subhead',
        label: 'Column 2 Title',
        required: true,
        position: { x: 36, y: 20, width: 28, height: 8 },
        placeholder: 'Column 2 title...',
      },
      {
        id: 'column2-body',
        type: 'body',
        label: 'Column 2 Content',
        required: true,
        position: { x: 36, y: 30, width: 28, height: 45 },
        placeholder: 'Column 2 content...',
      },
      {
        id: 'column3-title',
        type: 'subhead',
        label: 'Column 3 Title',
        required: true,
        position: { x: 67, y: 20, width: 28, height: 8 },
        placeholder: 'Column 3 title...',
      },
      {
        id: 'column3-body',
        type: 'body',
        label: 'Column 3 Content',
        required: true,
        position: { x: 67, y: 30, width: 28, height: 45 },
        placeholder: 'Column 3 content...',
      },
      {
        id: 'isi',
        type: 'isi',
        label: 'ISI Section',
        required: false,
        position: { x: 0, y: 85, width: 100, height: 15 },
      },
    ],
  },
  {
    id: 'data-chart-focus',
    name: 'Data/Chart Focus',
    description: 'Large chart area with small headline and caption',
    thumbnail: '/templates/data-chart.png',
    slots: [
      {
        id: 'headline',
        type: 'headline',
        label: 'Chart Title',
        required: true,
        position: { x: 5, y: 3, width: 90, height: 8 },
        placeholder: 'Chart/data title...',
      },
      {
        id: 'chart',
        type: 'chart',
        label: 'Chart/Data Visualization',
        required: true,
        position: { x: 5, y: 13, width: 90, height: 55 },
        placeholder: 'Upload chart image or data...',
      },
      {
        id: 'caption',
        type: 'body',
        label: 'Caption/Source',
        required: false,
        position: { x: 5, y: 70, width: 90, height: 10 },
        placeholder: 'Source: ...',
      },
      {
        id: 'isi',
        type: 'isi',
        label: 'ISI Section',
        required: false,
        position: { x: 0, y: 85, width: 100, height: 15 },
      },
    ],
  },
  {
    id: 'bullet-list',
    name: 'Bullet List',
    description: 'Headline with bullet points and optional image',
    thumbnail: '/templates/bullet-list.png',
    slots: [
      {
        id: 'headline',
        type: 'headline',
        label: 'Headline',
        required: true,
        position: { x: 5, y: 5, width: 90, height: 10 },
        placeholder: 'Section headline...',
      },
      {
        id: 'bullets',
        type: 'bullet-list',
        label: 'Bullet Points',
        required: true,
        position: { x: 5, y: 18, width: 55, height: 55 },
        placeholder: 'Enter bullet points (one per line)...',
      },
      {
        id: 'image',
        type: 'image',
        label: 'Supporting Image',
        required: false,
        position: { x: 62, y: 18, width: 33, height: 55 },
        placeholder: 'Optional supporting image...',
      },
      {
        id: 'isi',
        type: 'isi',
        label: 'ISI Section',
        required: false,
        position: { x: 0, y: 85, width: 100, height: 15 },
      },
    ],
  },
];

export function getTemplateById(id: string): SlideTemplate | undefined {
  return SLIDE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateSlots(templateId: string) {
  const template = getTemplateById(templateId);
  return template?.slots ?? [];
}

export function createEmptySlideData(templateId: string): { templateId: string; slots: Record<string, null> } {
  const template = getTemplateById(templateId);
  if (!template) {
    return { templateId, slots: {} };
  }

  const slots: Record<string, null> = {};
  template.slots.forEach((slot) => {
    slots[slot.id] = null;
  });

  return { templateId, slots };
}
