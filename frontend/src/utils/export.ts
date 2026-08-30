import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

export const exportToDocx = async (title: string, content: string, citations?: Array<{ text: string; source: string; score: number }>) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Generated Response',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: content,
        }),
        ...(citations && citations.length > 0 ? [
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: 'Citations',
            heading: HeadingLevel.HEADING_2,
          }),
          ...citations.map((citation, i) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `${i + 1}. `,
                  bold: true,
                }),
                new TextRun({
                  text: `${citation.text.substring(0, 200)}...`,
                }),
                new TextRun({
                  text: ` (Source: ${citation.source}, Score: ${citation.score.toFixed(2)})`,
                  italics: true,
                }),
              ],
            })
          ),
        ] : []),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPdf = (title: string, content: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  doc.setFontSize(12);
  const splitContent = doc.splitTextToSize(content, 170);
  doc.text(splitContent, 20, 40);
  
  doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};
