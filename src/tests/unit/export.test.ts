import { describe, it, expect, vi } from 'vitest';
import { exportIVA, downloadBlob } from '@/lib/export';
import { IVA } from '@/lib/types';
import JSZip from 'jszip';

const createMockIVA = (): IVA => ({
  metadata: {
    id: 'test-id',
    name: 'Test IVA',
    brand: 'Opdivo',
    therapeuticArea: 'Oncology',
    targetAudience: 'Oncologists',
    slideCount: 2,
    status: 'draft',
    createdAt: '2025-01-15T12:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z',
    isFavorite: false,
  },
  slides: [
    {
      templateId: 'title-slide',
      slots: {
        headline: 'Welcome to Opdivo',
        subhead: 'A breakthrough treatment',
      },
    },
    {
      templateId: 'content-image-split',
      slots: {
        headline: 'Efficacy Data',
        body: 'Clinical trial results show...',
        image: null,
        isi: 'Important Safety Information here',
      },
    },
  ],
});

describe('Export', () => {
  describe('exportIVA', () => {
    it('generates a valid zip blob', async () => {
      const iva = createMockIVA();
      const blob = await exportIVA(iva);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('includes manifest.json with correct metadata', async () => {
      const iva = createMockIVA();
      const blob = await exportIVA(iva);

      const zip = await JSZip.loadAsync(blob);
      const manifestFile = zip.file('manifest.json');
      expect(manifestFile).not.toBeNull();

      const manifestContent = await manifestFile!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest.name).toBe('Test IVA');
      expect(manifest.brand).toBe('Opdivo');
      expect(manifest.slideCount).toBe(2);
      expect(manifest.createdBy).toBe('IVA Builder');
    });

    it('includes index.html', async () => {
      const iva = createMockIVA();
      const blob = await exportIVA(iva);

      const zip = await JSZip.loadAsync(blob);
      const indexFile = zip.file('index.html');
      expect(indexFile).not.toBeNull();

      const content = await indexFile!.async('string');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('Test IVA');
    });

    it('includes slide HTML files', async () => {
      const iva = createMockIVA();
      const blob = await exportIVA(iva);

      const zip = await JSZip.loadAsync(blob);
      const slide1 = zip.file('slides/slide-1.html');
      const slide2 = zip.file('slides/slide-2.html');

      expect(slide1).not.toBeNull();
      expect(slide2).not.toBeNull();

      const slide1Content = await slide1!.async('string');
      expect(slide1Content).toContain('Welcome to Opdivo');
    });

    it('includes CSS file', async () => {
      const iva = createMockIVA();
      const blob = await exportIVA(iva);

      const zip = await JSZip.loadAsync(blob);
      const cssFile = zip.file('assets/css/styles.css');
      expect(cssFile).not.toBeNull();

      const content = await cssFile!.async('string');
      expect(content).toContain('.slide');
      expect(content).toContain('--bms-blue');
    });

    it('includes navigation JS file', async () => {
      const iva = createMockIVA();
      const blob = await exportIVA(iva);

      const zip = await JSZip.loadAsync(blob);
      const jsFile = zip.file('assets/js/navigation.js');
      expect(jsFile).not.toBeNull();

      const content = await jsFile!.async('string');
      expect(content).toContain('function nextSlide()');
      expect(content).toContain('function prevSlide()');
      expect(content).toContain('totalSlides = 2');
    });

    it('includes ISI file when slides have ISI content', async () => {
      const iva = createMockIVA();
      const blob = await exportIVA(iva);

      const zip = await JSZip.loadAsync(blob);
      const isiFile = zip.file('shared/isi.html');
      expect(isiFile).not.toBeNull();
    });

    it('escapes HTML in content', async () => {
      const iva = createMockIVA();
      iva.slides[0].slots.headline = '<script>alert("xss")</script>';
      const blob = await exportIVA(iva);

      const zip = await JSZip.loadAsync(blob);
      const slide1 = zip.file('slides/slide-1.html');
      const content = await slide1!.async('string');

      expect(content).not.toContain('<script>');
      expect(content).toContain('&lt;script&gt;');
    });
  });

  describe('downloadBlob', () => {
    it('creates and clicks a download link', () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const mockRevokeObjectURL = vi.fn();
      const mockClick = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      // Mock DOM methods
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      const blob = new Blob(['test'], { type: 'application/zip' });
      downloadBlob(blob, 'test.zip');

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockAnchor.download).toBe('test.zip');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });
});
