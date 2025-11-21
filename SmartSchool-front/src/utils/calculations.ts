export const calculerMoyenne = (inter1: string, inter2: string, exam: string): string => {
  const i1 = parseFloat(inter1) || 0;
  const i2 = parseFloat(inter2) || 0;
  const ex = parseFloat(exam) || 0;
  if (i1 === 0 && i2 === 0 && ex === 0) return '';
  return ((i1 + i2 + ex * 2) / 4).toFixed(2);
};

export const getAppreciation = (moyenne: string): string => {
  const moy = parseFloat(moyenne);
  if (!moy) return '';
  if (moy >= 16) return 'Excellent';
  if (moy >= 14) return 'Très bien';
  if (moy >= 12) return 'Bien';
  if (moy >= 10) return 'Passable';
  return 'Insuffisant';
};

export const getAppreciationColor = (appreciation: string): string => {
  switch (appreciation) {
    case 'Excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
    case 'Très bien':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
    case 'Bien':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200';
    case 'Passable':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
    case 'Insuffisant':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
    default:
      return 'bg-muted/30';
  }
};
