export const reviewed = '28 de septiembre de 2026';
export const sources = {
  ai: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
  literacy: 'https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers',
  transparency: 'https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act',
  gdpr: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj/spa',
};
const plans = (personal, business, api = []) => [
  ...personal.map(label => ({label, type:'personal'})),
  ...business.map(label => ({label, type:'business'})),
  ...api.map(label => ({label, type:'api'})),
  {label:'No sé qué plan o contrato tenemos', type:'unknown'},
];
export const providers = {
  chatgpt: {name:'ChatGPT', plans:plans(['Free','Plus','Pro'],['Business','Enterprise','Edu'],['API de OpenAI']), url:'https://openai.com/business-data/', note:'OpenAI declara que Business, Enterprise y API no usan datos para entrenar por defecto. Verifica el contrato, las excepciones, la retención y las integraciones; esto no acredita tu cumplimiento.'},
  claude: {name:'Claude', plans:plans(['Free','Pro','Max'],['Team','Enterprise'],['API de Anthropic']), url:'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training', note:'Anthropic distingue productos de consumo y comerciales. Los comerciales no entrenan con entradas y salidas por defecto, con excepciones como feedback o autorización. Pro y Max no equivalen a un contrato empresarial.'},
  gemini: {name:'Gemini', plans:plans(['Cuenta personal / gratuita','Google AI Pro / Ultra personal'],['Gemini en Google Workspace'],['Gemini API / AI Studio','Vertex AI']), url:'https://support.google.com/a/answer/15706919', note:'Distingue la aplicación personal, Workspace, AI Studio y Vertex AI. Las condiciones no son intercambiables: comprueba el servicio exacto, la cuenta y los conectores habilitados.'},
  copilot: {name:'Microsoft Copilot', plans:plans(['Copilot personal','Suscripción personal de pago'],['Copilot Chat con cuenta de trabajo y protección empresarial','Microsoft 365 Copilot'],['Copilot Studio / agente propio']), url:'https://learn.microsoft.com/en-us/microsoft-365/copilot/enterprise-data-protection', note:'Comprueba que la sesión tenga protección empresarial y términos aplicables. El nombre Copilot por sí solo no identifica el contrato. Revisa búsquedas web, agentes y accesos a Microsoft 365.'},
  mistral: {name:'Mistral / Le Chat', plans:plans(['Free','Pro'],['Team','Enterprise'],['API de Mistral','Modelo alojado por nuestra empresa']), url:'https://help.mistral.ai/en/collections/712281-data-governance', note:'Verifica las condiciones de Le Chat, API o alojamiento propio. Que el proveedor sea europeo no acredita por sí solo base jurídica, seguridad ni ausencia de transferencias.'},
  other: {name:'Otra IA / modelo local', plans:plans(['Cuenta individual'],['Contrato empresarial'],['API de un tercero','Alojamiento propio']), url:sources.gdpr, note:'Identifica al proveedor real y el lugar de ejecución. Un modelo local también requiere revisar accesos, registros, copias, telemetría y los datos que procesa.'},
};
export const uses = {internal:'Redacción, resúmenes o programación interna', chatbot:'Chatbot o agente que interactúa con personas', content:'Contenido público: textos, imágenes, voz o vídeo', consequential:'Selección de personal, crédito, educación o decisiones sobre personas', emotions:'Inferir emociones de empleados o alumnos', other:'Otro uso / no sé clasificarlo'};
export const dataTypes = {none:'Solo datos ficticios o realmente anónimos', personal:'Datos identificables de clientes, empleados o terceros', sensitive:'Salud, biometría, ideología u otros datos especialmente sensibles', unknown:'No sé; puede acceder a correo, archivos o conversaciones'};
export function controlsFor(a) {
  const controls = [
    ['inventory','Hemos documentado el uso, un responsable y nuestro papel (usuario profesional, proveedor o ambos).','AI Act'],
    ['training','El personal recibe orientación/formación adaptada al uso y tenemos constancia de las medidas.','AI Act'],
    ['human','Hay revisión humana real y un procedimiento para errores e incidentes.','AI Act'],
    ['security','Revisamos permisos, retención, borrado, entrenamiento, feedback y conectores.','Proveedor'],
  ];
  if(a.use==='chatbot') controls.push(['notice','Hemos evaluado el artículo 50 y el aviso de IA aparece al comenzar cuando corresponde.','AI Act']);
  if(a.use==='content') controls.push(['labels','Hemos evaluado marcado/divulgación de contenido sintético y responsabilidad editorial.','AI Act']);
  if(a.data!=='none' || ['consequential','emotions'].includes(a.use)) controls.push(
    ['basis','Documentamos finalidad, base jurídica y minimización; no confiamos solo en el consentimiento.','RGPD'],
    ['contract','Hemos identificado roles y verificado el encargo del art. 28 cuando procede y los subencargados.','RGPD'],
    ['rights','Informamos a las personas y podemos atender sus derechos.','RGPD'],
    ['transfers','Hemos revisado dónde se tratan los datos y las garantías de transferencias internacionales.','RGPD'],
    ['impact','Hemos evaluado si procede una EIPD y, si procede, realizado antes del tratamiento.','RGPD'],
  );
  if(a.data==='sensitive') controls.push(['special','Tenemos una condición del artículo 9, además de base del artículo 6, y medidas reforzadas.','RGPD']);
  if(a.use==='consequential') controls.push(['decisions','Hemos analizado el artículo 22 RGPD y las garantías de decisiones automatizadas significativas.','RGPD']);
  return controls.map(([id,label,area])=>({id,label,area}));
}
export function assess(a) {
  const provider=providers[a.provider];
  const plan=provider?.plans[a.plan];
  if(!provider || !plan || !uses[a.use] || !dataTypes[a.data]) throw new Error('Completa herramienta, plan, uso y datos.');
  const checked=new Set(a.controls || []);
  const pending=controlsFor(a).filter(c=>!checked.has(c.id));
  const ai=pending.filter(c=>c.area==='AI Act');
  const gdpr=pending.filter(c=>c.area==='RGPD');
  const high=['consequential','emotions','other'].includes(a.use);
  const personal=a.data!=='none' || ['consequential','emotions'].includes(a.use);
  const priority=[];
  if(plan.type==='unknown') priority.push('Identifica el plan y el contrato antes de interpretar las garantías del proveedor; las condiciones no están verificadas.');
  if(a.data==='none' && ['consequential','emotions'].includes(a.use)) priority.push('Revisa la respuesta sobre datos: decidir sobre personas o inferir sus emociones normalmente implica datos personales, aunque no escribas su nombre.');
  if(a.use==='emotions') priority.push('No despliegues este uso sin revisión especializada: inferir emociones en trabajo o educación puede ser una práctica prohibida; existen excepciones limitadas que deben verificarse.');
  if(a.use==='consequential') priority.push('Revisión especializada antes de decidir: puede ser alto riesgo según finalidad, función y alcance. Verifica la clasificación y el calendario aplicable; una revisión humana nominal no basta.');
  if(a.use==='other') priority.push('Clasifica el uso y vuestro papel antes de valorar obligaciones; este cuestionario no cubre todos los sectores ni prácticas prohibidas.');
  if(a.data==='unknown') priority.push('Haz un mapa de datos, archivos, historial y conectores. No se puede descartar el RGPD mientras no sepas qué información se trata.');
  if(a.data==='sensitive') priority.push('No añadas nuevos datos sensibles hasta validar necesidad, condición del artículo 9, seguridad y evaluación de impacto.');
  if(personal && ['personal','unknown'].includes(plan.type)) priority.push('Antes de introducir datos personales, verifica si el contrato y la configuración permiten este tratamiento. Pagar una cuenta individual no equivale a contratar un servicio empresarial.');
  if(plan.type==='api') priority.push('Una API o un modelo local no hereda automáticamente las garantías del chat: revisa proveedor de alojamiento, aplicación, registros y cadena contractual.');
  if(!checked.has('security')) priority.push('Revisa los ajustes y accesos del servicio: no usar datos para entrenar no significa que no se almacenen o no se comuniquen a terceros.');
  return {provider,plan,pending,priority,
    aiStatus: high?'Revisión especializada':ai.length?'Medidas pendientes de verificar':'Medidas declaradas; falta validación',
    gdprStatus: personal?(gdpr.length || high || a.data==='unknown' || a.data==='sensitive' || ['personal','unknown'].includes(plan.type)?'Tratamiento pendiente de revisar':'Garantías declaradas; falta validación'):'Sin datos personales declarados',
    gdprNote:personal?'Revisa artículos 5, 6, 9 cuando proceda, 13–22, 28, 32, 35 y 44 y siguientes. El resultado no acredita cumplimiento.':'El RGPD puede seguir aplicando a cuentas, metadatos o salidas identificables. Seudonimizar o borrar un nombre no garantiza anonimato.',
  };
}
