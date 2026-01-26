import { describe, it, expect } from 'vitest'
import {
  processContentForDisplay,
  extractHeadings,
} from '@/lib/content-processor'

describe('Content Processor', () => {
  describe('processContentForDisplay', () => {
    it('should add IDs to headings without existing IDs', () => {
      const html = '<h1>Hello World</h1>'
      const result = processContentForDisplay(html)

      expect(result).toBe('<h1 id="hello-world">Hello World</h1>')
    })

    it('should not modify headings that already have IDs', () => {
      const html = '<h1 id="existing-id">Hello World</h1>'
      const result = processContentForDisplay(html)

      expect(result).toBe('<h1 id="existing-id">Hello World</h1>')
    })

    it('should handle multiple heading levels', () => {
      const html = `
        <h1>Title</h1>
        <h2>Section</h2>
        <h3>Subsection</h3>
        <h4>Detail</h4>
        <h5>More Detail</h5>
        <h6> Deepest</h6>
      `
      const result = processContentForDisplay(html)

      expect(result).toContain('<h1 id="title">Title</h1>')
      expect(result).toContain('<h2 id="section">Section</h2>')
      expect(result).toContain('<h3 id="subsection">Subsection</h3>')
      expect(result).toContain('<h4 id="detail">Detail</h4>')
      expect(result).toContain('<h5 id="more-detail">More Detail</h5>')
      expect(result).toContain('<h6 id="deepest">Deepest</h6>')
    })

    it('should handle special characters in headings', () => {
      const html = '<h2>Hello @ World! Test #123</h2>'
      const result = processContentForDisplay(html)

      expect(result).toContain('<h2')
      expect(result).toContain('id=')
    })

    it('should ensure unique IDs for duplicate headings', () => {
      const html = `
        <h2>Introduction</h2>
        <p>Some content</p>
        <h2>Introduction</h2>
      `
      const result = processContentForDisplay(html)

      expect(result).toContain('<h2 id="introduction">Introduction</h2>')
      expect(result).toContain('<h2 id="introduction-1">Introduction</h2>')
    })

    it('should handle multiple duplicate headings', () => {
      const html = `
        <h2>Test</h2>
        <h2>Test</h2>
        <h2>Test</h2>
        <h2>Test</h2>
      `
      const result = processContentForDisplay(html)

      expect(result).toContain('id="test"')
      expect(result).toContain('id="test-1"')
      expect(result).toContain('id="test-2"')
      expect(result).toContain('id="test-3"')
    })

    it('should preserve heading attributes', () => {
      const html = '<h2 class="text-primary">Heading</h2>'
      const result = processContentForDisplay(html)

      expect(result).toContain('class="text-primary"')
      expect(result).toContain('id="heading"')
    })

    it('should handle headings with inline HTML', () => {
      const html = '<h2>This is <strong>bold</strong> text</h2>'
      const result = processContentForDisplay(html)

      expect(result).toContain('<h2')
      expect(result).toContain('id=')
      expect(result).toContain('<strong>bold</strong>')
    })

    it('should handle empty headings', () => {
      const html = '<h2></h2>'
      const result = processContentForDisplay(html)

      expect(result).toContain('<h2')
      expect(result).toContain('id="heading"')
    })

    it('should return empty string for empty input', () => {
      expect(processContentForDisplay('')).toBe('')
    })

    it('should handle mixed content with headings and non-headings', () => {
      const html = `
        <p>This is a paragraph.</p>
        <h2>This is a heading</h2>
        <p>This is another paragraph.</p>
      `
      const result = processContentForDisplay(html)

      expect(result).toContain('<p>This is a paragraph.</p>')
      expect(result).toContain('<h2 id="this-is-a-heading">This is a heading</h2>')
      expect(result).toContain('<p>This is another paragraph.</p>')
    })

    it('should handle numbers in headings', () => {
      const html = '<h2>Chapter 1: The Beginning</h2>'
      const result = processContentForDisplay(html)

      expect(result).toContain('id="chapter-1-the-beginning"')
    })
  })

  describe('extractHeadings', () => {
    it('should extract headings with IDs', () => {
      const html = '<h1 id="main-title">Hello World</h1>'
      const result = extractHeadings(html)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        level: 1,
        text: 'Hello World',
        id: 'main-title',
      })
    })

    it('should extract headings without IDs and generate them', () => {
      const html = '<h2>Hello World</h2>'
      const result = extractHeadings(html)

      expect(result).toHaveLength(1)
      expect(result[0].level).toBe(2)
      expect(result[0].text).toBe('Hello World')
      expect(result[0].id).toBe('hello-world')
    })

    it('should extract all heading levels', () => {
      const html = `
        <h1>Title</h1>
        <h2>Section</h2>
        <h3>Subsection</h3>
        <h4>Detail</h4>
        <h5>More Detail</h5>
        <h6>Deepest</h6>
      `
      const result = extractHeadings(html)

      expect(result).toHaveLength(6)
      expect(result[0].level).toBe(1)
      expect(result[1].level).toBe(2)
      expect(result[2].level).toBe(3)
      expect(result[3].level).toBe(4)
      expect(result[4].level).toBe(5)
      expect(result[5].level).toBe(6)
    })

    it('should return empty array for empty input', () => {
      expect(extractHeadings('')).toEqual([])
    })

    it('should return empty array for content without headings', () => {
      const html = '<p>This is just a paragraph.</p>'
      const result = extractHeadings(html)

      expect(result).toEqual([])
    })

    it('should handle headings with inline HTML', () => {
      const html = '<h2>This is <em>important</em> content</h2>'
      const result = extractHeadings(html)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('This is important content')
    })

    it('should handle empty headings', () => {
      const html = '<h2></h2>'
      const result = extractHeadings(html)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Untitled')
    })

    it('should ensure unique IDs for duplicate headings', () => {
      const html = `
        <h2>Introduction</h2>
        <h2>Introduction</h2>
      `
      const result = extractHeadings(html)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('introduction')
      expect(result[1].id).toBe('introduction-1')
    })

    it('should extract headings in order', () => {
      const html = `
        <h1>Title</h1>
        <h3>Subsection</h3>
        <h2>Section</h2>
      `
      const result = extractHeadings(html)

      expect(result[0].level).toBe(1)
      expect(result[1].level).toBe(3)
      expect(result[2].level).toBe(2)
    })

    it('should handle special characters in headings', () => {
      const html = '<h2>Hello @ World! Test #123</h2>'
      const result = extractHeadings(html)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Hello @ World! Test #123')
    })
  })
})
