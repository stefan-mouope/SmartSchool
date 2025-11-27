// src/utils/generateClassBulletins.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface BulletinLine {
  id: number;
  matiere: string;
  moyenne: number | null;
  sequence1_note?: number | null;
  sequence2_note?: number | null;
  coefficient?: number | string;
  appreciation: string;
}

interface Student {
  id: number;
  nom: string;
  matricule: string;
}

type GenererBulletinFn = (payload: any) => Promise<any>;

export const generateClassBulletinsZip = async (
  students: Student[],
  matieres: { id: number; name: string }[],
  options: {
    classe_id: number;
    annee_id: number;
    classeLabel: string;
    anneeLabel: string;
    periodeLabel: string;
    selectedPeriod: 'sequence' | 'trimestre';
    periodNumber: number;
    genererBulletin: GenererBulletinFn;
    onProgress?: (current: number, total: number) => void;
  }
) => {
  const zip = new JSZip();

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const inscriptionId = student.id;

    try {
      const basePayload = {
        inscription_id: inscriptionId,
        classe_id: options.classe_id,
        annee_id: options.annee_id,
      };

      let lignesCompletes: BulletinLine[] = [];
      let moyenneGenerale: number | null = null;
      let moyenneClasse: number | null = null;
      let rang: string | null = null;
      let trimestre: number | null = null;
      let sequence: number | null = null;

      if (options.selectedPeriod === 'sequence') {
        // === SÉQUENCE ===
        const payload = { ...basePayload, sequence: options.periodNumber };
        const data = await options.genererBulletin(payload);
        const lignesAvecNotes = data.lignes || [];

        lignesCompletes = matieres.map((matiere) => {
          const ligne = lignesAvecNotes.find((l: any) =>
            l.matiere === matiere.name || l.matiere_id === matiere.id ||
            (typeof l.matiere === 'string' && l.matiere.includes(matiere.name))
          );

          return {
            id: ligne?.id || matiere.id,
            matiere: matiere.name,
            moyenne: ligne?.moyenne ?? null,
            coefficient: ligne?.coefficient || '-',
            appreciation: ligne?.appreciation || 'Non évalué',
          };
        });

        moyenneGenerale = data.moyenne_generale;
        moyenneClasse = data.moyenne_classe;
        rang = data.rang;
        sequence = options.periodNumber;
      } else {
        // === TRIMESTRE ===
        const payloadTrim = { ...basePayload, trimestre: options.periodNumber };
        const dataTrim = await options.genererBulletin(payloadTrim);
        const lignesTrim = dataTrim.lignes || [];

        const seq1Num = options.periodNumber * 2 - 1;
        const seq2Num = options.periodNumber * 2;

        const dataSeq1 = await options.genererBulletin({ ...basePayload, sequence: seq1Num });
        const dataSeq2 = await options.genererBulletin({ ...basePayload, sequence: seq2Num });

        const lignesSeq1 = dataSeq1.lignes || [];
        const lignesSeq2 = dataSeq2.lignes || [];

        lignesCompletes = matieres.map((matiere) => {
          const ligneTrim = lignesTrim.find((l: any) =>
            l.matiere === matiere.name || l.matiere_id === matiere.id
          );
          const ligneSeq1 = lignesSeq1.find((l: any) =>
            l.matiere === matiere.name || l.matiere_id === matiere.id
          );
          const ligneSeq2 = lignesSeq2.find((l: any) =>
            l.matiere === matiere.name || l.matiere_id === matiere.id
          );

          return {
            id: ligneTrim?.id || matiere.id,
            matiere: matiere.name,
            moyenne: ligneTrim?.moyenne ?? null,
            sequence1_note: ligneSeq1?.moyenne ?? null,
            sequence2_note: ligneSeq2?.moyenne ?? null,
            coefficient: ligneTrim?.coefficient || '-',
            appreciation: ligneTrim?.appreciation || 'Non évalué',
          };
        });

        moyenneGenerale = dataTrim.moyenne_generale;
        moyenneClasse = dataTrim.moyenne_classe;
        rang = dataTrim.rang;
        trimestre = options.periodNumber;
      }

      // === Génération du PDF ===
      const htmlContent = generateBulletinHTML({
        studentName: student.nom,
        matricule: student.matricule,
        classe: options.classeLabel,
        anneeScolaire: options.anneeLabel,
        periodeLabel: options.periodeLabel,
        lignes: lignesCompletes,
        moyenneGenerale,
        moyenneClasse,
        rang,
        trimestre,
        sequence,
      });

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, (pdfHeight - 20) / canvas.height);

      pdf.addImage(
        imgData,
        'PNG',
        (pdfWidth - canvas.width * ratio) / 2,
        10,
        canvas.width * ratio,
        canvas.height * ratio
      );

      const safeName = student.nom.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      zip.file(`${safeName}.pdf`, pdf.output('blob'));

      document.body.removeChild(tempDiv);

      options.onProgress?.(i + 1, students.length);
    } catch (err) {
      console.error(`Erreur pour ${student.nom}:`, err);
      // Continue avec les autres
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `Bulletins_${options.classeLabel}_${options.periodeLabel.replace(/\s+/g, '_')}.zip`);
};

// === Fonction qui génère le HTML identique à BulletinTemplate ===
const generateBulletinHTML = (props: {
  studentName: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
  periodeLabel: string;
  lignes: BulletinLine[];
  moyenneGenerale: number | null;
  moyenneClasse: number | null;
  rang: string | null;
  trimestre?: number | null;
  sequence?: number | null;
}): string => {
  const { studentName, matricule, classe, anneeScolaire, periodeLabel, lignes, moyenneGenerale, moyenneClasse, rang, trimestre } = props;

  const getMention = (moy: number | null) => {
    if (moy === null) return '-';
    if (moy >= 16) return 'Très Bien';
    if (moy >= 14) return 'Bien';
    if (moy >= 12) return 'Assez Bien';
    if (moy >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const avgSeq1 = trimestre ? lignes.reduce((a, l) => a + (l.sequence1_note || 0), 0) / lignes.filter(l => l.sequence1_note).length : null;
  const avgSeq2 = trimestre ? lignes.reduce((a, l) => a + (l.sequence2_note || 0), 0) / lignes.filter(l => l.sequence2_note).length : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Times New Roman', serif; padding: 30px; background: white; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 10px; text-align: center; }
    th { background: #2c3e50; color: white; }
    .highlight { background: #e8f4f8; font-weight: bold; }
    .box { border: 2px solid #2c3e50; padding: 15px; text-align: center; background: #ecf0f1; margin: 10px; }
    .big { font-size: 24px; font-weight b: bold; color: #e74c3c; }
  </style>
</head>
<body>
  <!-- En-tête, infos élève, etc. (tu peux copier-coller ton style exact ici) -->
  <h2 style="text-align:center">Bulletin - ${periodeLabel}</h2>
  <p><strong>Élève :</strong> ${studentName} | <strong>Classe :</strong> ${classe} | <strong>Année :</strong> ${anneeScolaire}</p>

  <table>
    <thead>
      <tr>
        <th>Matière</th>
        ${trimestre ? `<th>Seq ${trimestre * 2 - 1}</th><th>Seq ${trimestre * 2}</th><th>Moy. Trim.</th>` : `<th>Note /20</th>`}
        <th>Appréciation</th>
      </tr>
    </thead>
    <tbody>
      ${lignes.map(l => `
        <tr>
          <td style="text-align:left; padding-left:15px;">${l.matiere}</td>
          ${trimestre ? `
            <td>${l.sequence1_note?.toFixed(2) || '-'}</td>
            <td>${l.sequence2_note?.toFixed(2) || '-'}</td>
            <td class="highlight">${l.moyenne?.toFixed(2) || '-'}</td>
          ` : `<td>${l.moyenne?.toFixed(2) || '-'}</td>`}
          <td>${l.appreciation}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:15px;">
    ${trimestre ? `
      <div class="box"><div>Seq ${trimestre * 2 - 1}</div><div class="big">${avgSeq1?.toFixed(2) || '-'} /20</div></div>
      <div class="box"><div>Seq ${trimestre * 2}</div><div class="big">${avgSeq2?.toFixed(2) || '-'} /20</div></div>
    ` : ''}
    <div class="box"><div>Moyenne</div><div class="big">${moyenneGenerale?.toFixed(2) || '-'} /20</div></div>
    <div class="box"><div>Rang</div><div class="big">${rang || '-'}</div></div>
  </div>
</body>
</html>
  `.trim();
};