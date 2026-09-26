// Retirar un slug solo después de la revisión editorial para publicarlo.
export const blogDrafts = [
  'plan-ia360-bono-ia-empresas',
  'preparar-proyecto-ia-pyme-costes-retorno',
];

export function isBlogDraft(path) {
  const pathname = new URL(path, 'https://aisecurity.es').pathname.replace(/\/$/, '');
  return blogDrafts.some(slug => pathname === `/blog/${slug}`);
}
