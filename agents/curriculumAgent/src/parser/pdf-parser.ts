import pdf from 'pdf-parse';
import fs from 'fs';

export class PDFParser {
    async parse(filePath: string) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
            metadata: data.metadata
        };
    }
}

export const pdfParser = new PDFParser();
