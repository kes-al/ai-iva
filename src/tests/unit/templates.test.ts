import { describe, it, expect } from 'vitest';
import {
  SLIDE_TEMPLATES,
  getTemplateById,
  getTemplateSlots,
  createEmptySlideData,
} from '@/lib/templates';

describe('Templates', () => {
  describe('SLIDE_TEMPLATES', () => {
    it('contains all 6 required templates', () => {
      expect(SLIDE_TEMPLATES.length).toBe(6);

      const templateIds = SLIDE_TEMPLATES.map((t) => t.id);
      expect(templateIds).toContain('title-slide');
      expect(templateIds).toContain('content-image-split');
      expect(templateIds).toContain('full-image-overlay');
      expect(templateIds).toContain('three-column');
      expect(templateIds).toContain('data-chart-focus');
      expect(templateIds).toContain('bullet-list');
    });

    it('each template has required fields', () => {
      SLIDE_TEMPLATES.forEach((template) => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(Array.isArray(template.slots)).toBe(true);
        expect(template.slots.length).toBeGreaterThan(0);
      });
    });

    it('each slot has required fields', () => {
      SLIDE_TEMPLATES.forEach((template) => {
        template.slots.forEach((slot) => {
          expect(slot.id).toBeTruthy();
          expect(slot.type).toBeTruthy();
          expect(slot.label).toBeTruthy();
          expect(typeof slot.required).toBe('boolean');
          expect(slot.position).toBeDefined();
          expect(slot.position.x).toBeGreaterThanOrEqual(0);
          expect(slot.position.y).toBeGreaterThanOrEqual(0);
          expect(slot.position.width).toBeGreaterThan(0);
          expect(slot.position.height).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('getTemplateById', () => {
    it('returns correct template for valid ID', () => {
      const template = getTemplateById('title-slide');
      expect(template?.name).toBe('Title Slide');
    });

    it('returns undefined for invalid ID', () => {
      const template = getTemplateById('nonexistent');
      expect(template).toBeUndefined();
    });
  });

  describe('getTemplateSlots', () => {
    it('returns slots for valid template', () => {
      const slots = getTemplateSlots('title-slide');
      expect(slots.length).toBeGreaterThan(0);
      expect(slots.find((s) => s.id === 'headline')).toBeDefined();
    });

    it('returns empty array for invalid template', () => {
      const slots = getTemplateSlots('nonexistent');
      expect(slots).toEqual([]);
    });
  });

  describe('createEmptySlideData', () => {
    it('creates slide data with null slots', () => {
      const slideData = createEmptySlideData('title-slide');

      expect(slideData.templateId).toBe('title-slide');
      expect(slideData.slots.headline).toBeNull();
      expect(slideData.slots.subhead).toBeNull();
    });

    it('handles invalid template gracefully', () => {
      const slideData = createEmptySlideData('nonexistent');

      expect(slideData.templateId).toBe('nonexistent');
      expect(Object.keys(slideData.slots).length).toBe(0);
    });

    it('creates slots for all template slots', () => {
      const slideData = createEmptySlideData('three-column');
      const template = getTemplateById('three-column');

      template?.slots.forEach((slot) => {
        expect(slideData.slots).toHaveProperty(slot.id);
      });
    });
  });

  describe('Template-specific tests', () => {
    it('title-slide has headline and subhead slots', () => {
      const template = getTemplateById('title-slide');
      const slotIds = template?.slots.map((s) => s.id);

      expect(slotIds).toContain('headline');
      expect(slotIds).toContain('subhead');
    });

    it('content-image-split has ISI slot', () => {
      const template = getTemplateById('content-image-split');
      const slotIds = template?.slots.map((s) => s.id);

      expect(slotIds).toContain('isi');
    });

    it('three-column has 3 column slots', () => {
      const template = getTemplateById('three-column');
      const slotIds = template?.slots.map((s) => s.id);

      expect(slotIds).toContain('column1-title');
      expect(slotIds).toContain('column2-title');
      expect(slotIds).toContain('column3-title');
    });

    it('bullet-list has bullets slot', () => {
      const template = getTemplateById('bullet-list');
      const slotIds = template?.slots.map((s) => s.id);

      expect(slotIds).toContain('bullets');
    });

    it('data-chart-focus has chart slot', () => {
      const template = getTemplateById('data-chart-focus');
      const slotIds = template?.slots.map((s) => s.id);

      expect(slotIds).toContain('chart');
    });
  });
});
