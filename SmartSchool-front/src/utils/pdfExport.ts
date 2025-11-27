// src/utils/pdfExport.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exporterBulletinPDF = async (
  element: HTMLElement,
  nomFichier: string
): Promise<void> => {
  if (!element) {
    alert('Élément du bulletin non trouvé !');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,                    // Haute qualité
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      // Très important : on veut que le canvas fasse exactement la taille du contenu
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // On calcule le ratio pour que le contenu remplisse TOUTE la largeur A4
    const ratio = pdfWidth / imgWidth;

    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // Si le contenu dépasse en hauteur → on ajoute des pages
    if (scaledHeight > pdfHeight) {
      // Mode "multi-page" (rarement nécessaire si ton bulletin est bien conçu)
      let positionY = 0;
      while (positionY < scaledHeight) {
        pdf.addImage(
          imgData,
          'PNG',
          0, // x
          -positionY, // on décale vers le haut
          scaledWidth,
          scaledHeight
        );

        positionY += pdfHeight;
        if (positionY < scaledHeight) {
          pdf.addPage();
        }
      }
    } else {
      // Cas normal : tout tient sur une page → centré verticalement
      const yPosition = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(
        imgData,
        'PNG',
        0,           // x = 0 → plein largeur
        yPosition,   // centré verticalement
        scaledWidth,
        scaledHeight
      );
    }

    pdf.save(nomFichier);
  } catch (err) {
    console.error('Erreur génération PDF:', err);
    alert('Erreur lors de la génération du PDF.');
  }
};