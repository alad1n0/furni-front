import React from "react";
import Barcode from "react-barcode";
import { createRoot } from "react-dom/client";

export interface LabelData {
    clientName: string;
    constructionSize: string;
    detailName?: string;
    serialNumber?: string;
}

interface LabelComponentProps {
    data: LabelData;
}

const LabelComponent: React.FC<LabelComponentProps> = ({ data }) => {
    const today = new Date().toLocaleDateString('uk-UA');

    return (
        <div style={{
            width: '150mm',
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px'
                }}>
                    <div>
        <span style={{
            fontWeight: 'bold',
            color: 'rgba(0,0,0,0.5)'
        }}>
    {data.clientName}
    </span>
                    </div>

                    <div>
    <span style={{
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.5)'
    }}>
    Система:
        </span>
                        <span style={{ color: 'rgba(0,0,0,0.5)' }}> SlimLine</span>
                    </div>

                    {data.detailName && (
                        <div>
            <span style={{
                fontWeight: 'bold',
                color: 'rgba(0,0,0,0.5)'
            }}>
        Деталь:
            </span>
                            <span style={{ color: 'rgba(0,0,0,0.5)' }}> {data.detailName}</span>
                        </div>
                    )}

                    <div>
        <span style={{
            fontWeight: 'bold',
            color: 'rgba(0,0,0,0.5)'
        }}>
    Розмір:
        </span>
                        <span style={{ color: 'rgba(0,0,0,0.5)' }}> {data.constructionSize}</span>
                    </div>

                    <div>
    <span style={{
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.5)'
    }}>
    Дата:
        </span>
                        <span style={{ color: 'rgba(0,0,0,0.5)' }}> {today}</span>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    minHeight: '120px',
                    minWidth: '200px'
                }}>
                    {data.serialNumber && (
                        <Barcode
                            value={data.serialNumber}
                            format="CODE128"
                            width={2}
                            height={60}
                            displayValue={true}
                            fontSize={12}
                            margin={4}
                            lineColor="#000000"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const renderLabelComponent = async (data: LabelData): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
        try {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            container.style.width = '150mm';
            document.body.appendChild(container);

            const root = createRoot(container);
            root.render(<LabelComponent data={data} />);

            setTimeout(() => {
                resolve(container);
            }, 300);
        } catch (error) {
            reject(error);
        }
    });
};

export const convertLabelToImage = async (element: HTMLElement): Promise<string> => {
    try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
            allowTaint: true
        });

        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Помилка при конвертації етикетки в зображення:', error);
        throw error;
    }
};

export const generateLabelFileName = (orderNumber: string, constructionNo: string, detailNo: string, detailName?: string): string => {
    const name = detailName ? `_${detailName.replace(/\s+/g, '_')}` : '';
    return `Label_${orderNumber}_C${constructionNo}_D${detailNo}${name}.png`;
};

export const downloadSingleLabel = async (data: LabelData, fileName: string): Promise<void> => {
    try {
        const element = await renderLabelComponent(data);

        const imageData = await convertLabelToImage(element);

        const link = document.createElement('a');
        link.href = imageData;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        document.body.removeChild(element);
    } catch (error) {
        console.error('Помилка при завантаженні етикетки:', error);
        throw error;
    }
};

export const printSingleLabel = (data: LabelData): void => {
    const today = new Date().toLocaleDateString('uk-UA');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Етикетка</title>
            <style>
                @page {
                    size: 100mm 25mm;
                    margin: 0;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                body {
                    width: 100mm;
                    height: 25mm;
                    overflow: hidden;
                    background: #fff;
                    font-family: Arial, sans-serif;
                }
                .label-wrapper {
                    width: 100mm;
                    height: 25mm;
                    display: flex;
                    align-items: center;
                    padding: 2mm 3mm;
                    gap: 3mm;
                    background: #ffffff;
                }
                .label-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5mm;
                    font-size: 6pt;
                    color: #000;
                    overflow: hidden;
                }
                .label-info .client {
                    font-weight: bold;
                    font-size: 7pt;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .label-info .row {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .label-info .row b {
                    font-weight: bold;
                }
                .label-barcode {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .label-barcode svg {
                    height: 18mm !important;
                    max-width: 38mm;
                }
            </style>
        </head>
        <body>
            <div class="label-wrapper">
                <div class="label-info">
                    <div class="client">${data.clientName}</div>
                    <div class="row"><b>Система:</b> SlimLine</div>
                    ${data.detailName ? `<div class="row"><b>Деталь:</b> ${data.detailName}</div>` : ''}
                    <div class="row"><b>Розмір:</b> ${data.constructionSize}</div>
                    <div class="row"><b>Дата:</b> ${today}</div>
                </div>
                ${data.serialNumber ? `<div class="label-barcode" id="barcode-container"></div>` : ''}
            </div>
            ${data.serialNumber ? `
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script>
                window.onload = function() {
                    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    document.getElementById('barcode-container').appendChild(svg);
                    JsBarcode(svg, '${data.serialNumber}', {
                        format: 'CODE128',
                        width: 1.2,
                        height: 50,
                        displayValue: true,
                        fontSize: 7,
                        margin: 2,
                        lineColor: '#000000'
                    });
                    setTimeout(function() { window.print(); window.close(); }, 300);
                };
            </script>
            ` : `
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); window.close(); }, 100);
                };
            </script>
            `}
        </body>
        </html>
    `);

    printWindow.document.close();
};

export const generateLabelForZip = async (data: LabelData): Promise<{ imageData: string; base64: string }> => {
    try {
        const element = await renderLabelComponent(data);

        const imageData = await convertLabelToImage(element);
        const base64 = imageData.split(',')[1];

        document.body.removeChild(element);

        return { imageData, base64 };
    } catch (error) {
        console.error('Помилка при генеруванні етикетки для архіву:', error);
        throw error;
    }
};

export const isLabelDataValid = (data: LabelData): boolean => {
    return !!(data.clientName && data.constructionSize);
};

export default LabelComponent;