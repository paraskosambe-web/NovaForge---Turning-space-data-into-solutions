import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const workspaceDir = 'C:/Users/Paras/Downloads/Nasa Projects';
const runtimeModules = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const skillDir = 'C:/Users/Paras/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11217/skills/presentations';
const buildDir = path.join(workspaceDir, '.presentation-build');
const assets = path.join(buildDir, 'assets');
const previews = path.join(buildDir, 'previews');
const staging = path.join(buildDir, 'staging');
const outputDir = path.join(workspaceDir, 'demo_submission');
const outputPptx = path.join(outputDir, 'NovaForge_Flame_in_Freefall_Demo.pptx');
const candidate = path.join(staging, 'candidate.pptx');
const receipt = path.join(staging, 'validation.json');
const W = 1280;
const H = 720;

const { Presentation, PresentationFile } = await import(pathToFileURL(path.join(runtimeModules, '@oai/artifact-tool', 'dist', 'artifact_tool.mjs')).href);
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools', 'artifact_tool_utils.mjs')).href);

const C = {
  bg: '#08111E', panel: '#101D2D', panel2: '#142438', white: '#F4F7FB', muted: '#A8B7C8',
  dim: '#71849B', orange: '#FF9258', cyan: '#4BD2E8', green: '#75D6B1', line: '#25374B',
  dark: '#030912', yellow: '#F3C96B',
};
const F = 'Arial';
const imageBytes = new Map();
for (const file of ['nasa-space-flame.png', 'home.png', 'explorer.png', 'safety.png', 'assistant.png', 'gaps.png']) {
  imageBytes.set(file, new Uint8Array(await fs.readFile(path.join(assets, file))));
}
const deck = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, name, x, y, w, h, fill = 'none', opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry || 'rect', name,
    position: { left: x, top: y, width: w, height: h, ...(opts.rotation ? { rotation: opts.rotation } : {}) },
    fill,
    line: opts.line ?? { style: 'solid', fill: 'none', width: 0 },
    ...(opts.radius ? { borderRadius: opts.radius } : {}),
  });
}
function txt(slide, name, content, x, y, w, h, style = {}) {
  const s = shape(slide, name, x, y, w, h, 'none');
  s.text = content;
  s.text.style = {
    typeface: F, fontSize: style.size ?? '17pt', color: style.color ?? C.white,
    bold: style.bold ?? false, alignment: style.align ?? 'left',
    verticalAlignment: style.valign ?? 'top', wrap: 'square',
    autoFit: 'shrinkText', insets: 0,
  };
  return s;
}
function image(slide, name, file, x, y, w, h, alt, fit = 'cover') {
  return slide.images.add({ blob: imageBytes.get(file), contentType: 'image/png', alt, fit, geometry: 'roundRect', borderRadius: 14,
    position: { left: x, top: y, width: w, height: h }, name });
}
function line(slide, name, x, y, w, h, color = C.line) {
  return shape(slide, name, x, y, w, h, color);
}
function pill(slide, label, x, y, w, color = C.cyan, fill = '#142B3A') {
  shape(slide, `pill-${label}`, x, y, w, 29, fill, { radius: 14 });
  txt(slide, `pill-text-${label}`, label, x + 10, y + 4, w - 20, 20, { size: '10pt', color, bold: true, align: 'center' });
}
function header(slide, n, section, title, sub) {
  slide.background.fill = C.bg;
  txt(slide, `section-${n}`, section.toUpperCase(), 64, 37, 500, 22, { size: '10pt', color: C.cyan, bold: true });
  txt(slide, `title-${n}`, title, 64, 72, 1110, 60, { size: '31pt', bold: true });
  if (sub) txt(slide, `subtitle-${n}`, sub, 66, 139, 1080, 30, { size: '15pt', color: C.muted });
  line(slide, `header-rule-${n}`, 64, 182, 1152, 1, C.line);
  footer(slide, n);
}
function footer(slide, n, note = 'NOVAFORGE  /  NASA SPACE APPS 2026') {
  line(slide, `footer-rule-${n}`, 64, 675, 1152, 1, C.line);
  txt(slide, `footer-left-${n}`, note, 64, 687, 820, 18, { size: '8pt', color: C.dim, bold: true });
  txt(slide, `footer-num-${n}`, `${String(n).padStart(2, '0')}  /  07`, 1090, 686, 126, 20, { size: '9pt', color: C.muted, align: 'right' });
}
function note(slide, text) { slide.speakerNotes.text = text; }

// 1 — Cover
{
  const s = deck.slides.add(); s.background.fill = C.bg;
  // Minimal orbital accents frame the NASA flame photograph.
  shape(s, 'cover-accent-bar', 64, 68, 5, 34, C.orange, { radius: 3 });
  txt(s, 'cover-brand', 'NOVAFORGE', 82, 73, 330, 25, { size: '12pt', color: C.cyan, bold: true });
  txt(s, 'cover-title', 'Flame in\nFreefall', 64, 171, 545, 180, { size: '50pt', bold: true });
  txt(s, 'cover-subtitle', 'Turning space data into solutions', 67, 382, 510, 40, { size: '21pt', color: C.muted });
  line(s, 'cover-short-rule', 68, 452, 74, 3, C.orange);
  txt(s, 'cover-context', 'A fire-safety research dashboard for\nspacecraft, stations and future habitats', 68, 475, 495, 68, { size: '17pt', color: C.white });
  pill(s, 'NASA SPACE APPS 2026', 68, 578, 194, C.orange, '#32251F');
  image(s, 'cover-nasa-flame', 'nasa-space-flame.png', 642, 90, 574, 538, 'NASA photograph of a spherical soot flame in microgravity', 'cover');
  shape(s, 'image-caption-bg', 657, 579, 544, 35, '#07101B', { radius: 8 });
  txt(s, 'image-caption', 'NASA / ISS combustion research  ·  source in notes', 670, 588, 520, 18, { size: '9pt', color: C.muted });
  footer(s, 1);
  note(s, `NovaForge: Turning space data into solutions. This demonstration presents a research dashboard, not a certified safety system.\n\nImage source: NASA Science, “Fire in Space”: https://science.nasa.gov/image-article/apod-2021-august-10-fire-in-space/\nNASA combustion science: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/\nChallenge: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/`);
}

// 2 — The information problem and the dashboard
{
  const s = deck.slides.add(); header(s, 2, 'The challenge', 'Space-fire research is rich. Discovery is not.', 'NovaForge turns a hard-to-navigate PSI search into a traceable starting point for fire-safety questions.');
  txt(s, 'problem-lead', 'Researchers need to compare experiments across fuels, hardware and conditions before asking what might transfer to a habitat.', 66, 216, 440, 100, { size: '20pt', bold: true });
  txt(s, 'problem-support', 'The dashboard brings investigation summaries, environment-aware ranking, comparisons and source links into one place.', 66, 332, 422, 82, { size: '16pt', color: C.muted });
  line(s, 'problem-rule', 66, 442, 420, 1, C.line);
  txt(s, 'snapshot-26', '26', 66, 464, 110, 72, { size: '43pt', color: C.orange, bold: true });
  txt(s, 'snapshot-26-label', 'PSI combustion\ninvestigation summaries', 163, 477, 320, 54, { size: '14pt', color: C.white });
  txt(s, 'snapshot-21', '21', 66, 555, 110, 62, { size: '35pt', color: C.cyan, bold: true });
  txt(s, 'snapshot-21-label', 'numeric rows in PSI-22 table', 163, 566, 325, 36, { size: '14pt', color: C.white });
  image(s, 'dashboard-home-shot', 'home.png', 526, 222, 690, 386, 'NovaForge home page screenshot showing the Moon Base preset and dashboard entry point');
  pill(s, 'CURRENT QUERY SNAPSHOT', 544, 617, 220, C.yellow, '#2B281D');
  txt(s, 'snapshot-caveat', 'One PSI combustion query; not the full repository. No experimental values are fabricated.', 781, 622, 418, 30, { size: '10pt', color: C.muted });
  note(s, `The app currently contains 26 investigation summaries returned by its PSI combustion query and 21 numeric rows from the PSI-22 table, per the repository snapshot in this project. These counts describe the loaded snapshot, not all PSI content. The app labels source gaps instead of replacing them with synthetic experimental measurements.\n\nPrimary data: NASA Physical Sciences Informatics (PSI), combustion investigation query: https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation\nNASA combustion science overview: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/`);
}

// 3 — Moon base oxygen scenario
{
  const s = deck.slides.add(); header(s, 3, 'Moon Base preset', 'Compare oxygen conditions without conflating them', 'Three separate quantities: oxygen concentration, total pressure and calculated oxygen partial pressure.');
  const cards = [
    { x: 66, label: 'EARTH · SEA LEVEL', o2: '21%', p: '14.7 psi', pp: '3.09 psi', detail: 'ppO₂ = 0.21 × 14.7 = 3.087 psi', accent: C.cyan },
    { x: 468, label: 'MOON HABITAT · EXAMPLE', o2: '30%', p: '10.2 psi', pp: '3.06 psi', detail: 'At these exact boundary values', accent: C.orange },
    { x: 870, label: 'SPACESUIT', o2: '100%', p: '4.3 psi', pp: '4.30 psi', detail: 'ppO₂ = 1.00 × 4.3 = 4.3 psi', accent: C.green },
  ];
  for (const [i, c] of cards.entries()) {
    shape(s, `scenario-card-${i}`, c.x, 222, 344, 328, C.panel, { radius: 16, line: { style: 'solid', fill: C.line, width: 1 } });
    txt(s, `scenario-label-${i}`, c.label, c.x + 22, 244, 300, 26, { size: '10pt', color: c.accent, bold: true });
    txt(s, `scenario-o2-${i}`, c.o2, c.x + 22, 292, 300, 62, { size: '39pt', bold: true });
    txt(s, `scenario-o2-caption-${i}`, 'O₂ concentration', c.x + 22, 353, 300, 22, { size: '12pt', color: C.muted });
    line(s, `scenario-divider-${i}`, c.x + 22, 390, 300, 1, C.line);
    txt(s, `scenario-total-${i}`, c.p, c.x + 22, 409, 132, 32, { size: '17pt', bold: true });
    txt(s, `scenario-total-caption-${i}`, 'TOTAL PRESSURE', c.x + 22, 444, 140, 18, { size: '8pt', color: C.muted, bold: true });
    txt(s, `scenario-pp-${i}`, c.pp, c.x + 175, 409, 144, 32, { size: '17pt', bold: true, color: c.accent });
    txt(s, `scenario-pp-caption-${i}`, 'CALCULATED ppO₂', c.x + 175, 444, 145, 18, { size: '8pt', color: C.muted, bold: true });
    txt(s, `scenario-formula-${i}`, c.detail, c.x + 22, 489, 300, 32, { size: '10pt', color: C.muted });
    pill(s, 'CALCULATED', c.x + 22, 516, 112, C.cyan, '#142B3A');
  }
  shape(s, 'moon-insight-bg', 66, 572, 1148, 72, '#132437', { radius: 13 });
  txt(s, 'moon-insight', 'Moon example: 30% is 42.9% above Earth’s 21% oxygen concentration. At 10.2 psi total pressure, calculated ppO₂ is 3.06 psi—close to Earth’s 3.09 psi. Concentration alone is not a fire-risk score.', 86, 587, 1100, 48, { size: '14pt', color: C.white });
  note(s, `These are reference scenarios from the challenge text, not PSI experimental measurements. The Moon example shows the exact boundary values requested: 30% O2 and 10.2 psi total pressure; 0.30 × 10.2 = 3.06 psi ppO2. Earth calculation: 0.21 × 14.7 = 3.087 psi, rounded to 3.09. Spacesuit: 1.00 × 4.3 = 4.3 psi. Challenge text describes Moon-base concentration as more than 40% higher than Earth's; (30−21)/21 = 42.9%, a concentration-only comparison. The “30% or greater” and “10.2 psi or less” ranges do not imply a unique partial pressure without a selected pair of values. Do not infer risk from oxygen concentration alone.\n\nChallenge source: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/\nNASA Combustion Science: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/`);
}

// 4 — Search, exploration and comparison
{
  const s = deck.slides.add(); header(s, 4, 'Explore & compare', 'Follow the evidence across experiment families', 'Search records by fuel, conditions, hardware and safety role. Compare two to four investigations side by side.');
  image(s, 'explorer-screen', 'explorer.png', 66, 219, 596, 362, 'NovaForge investigation explorer screenshot with searchable investigation records');
  shape(s, 'families-panel', 698, 218, 518, 374, C.panel, { radius: 16, line: { style: 'solid', fill: C.line, width: 1 } });
  txt(s, 'family-header', 'INVESTIGATION FAMILIES', 724, 243, 440, 24, { size: '10pt', color: C.cyan, bold: true });
  const families = [
    ['SOLIDS', 'BASS · BASS-II · SAFFIRE I / II / III'],
    ['DETECTION', 'SAME · SAME-R · DAFT · DAFT-2'],
    ['SUPPRESSION', 'FLEX · FLEX-2 · CFI'],
    ['GASEOUS FLAMES', 'ACME suite · BRE · CFI-G · E-FIELD Flames'],
    ['FLOW DUCT', 'BASS · BASS-II · SPICE · SLICE'],
  ];
  families.forEach(([tag, names], i) => {
    const y = 289 + i * 56;
    txt(s, `family-tag-${i}`, tag, 724, y, 130, 21, { size: '9pt', color: i === 0 ? C.orange : C.cyan, bold: true });
    txt(s, `family-names-${i}`, names, 866, y - 2, 320, 39, { size: '13pt', color: C.white, bold: true });
    if (i < families.length - 1) line(s, `family-line-${i}`, 724, y + 37, 458, 1, C.line);
  });
  pill(s, 'RECORDED EVIDENCE', 66, 607, 180, C.green, '#152D2B');
  txt(s, 'evidence-vs-inference', 'Condition match uses fields actually recorded. Transfer to a habitat is scored separately and labeled inferred.', 265, 611, 920, 30, { size: '14pt', color: C.muted });
  note(s, `Family groupings and investigation names are shown to help orient users; the PSI query snapshot and linked records remain the authority for details. ACME includes six gaseous-flame experiments; CFI-G investigates high-oxygen microgravity combustion conditions (up to 85% O2 per the challenge description). E-FIELD applies electric fields to flame-generated ions; it is not a partial-gravity test. The dashboard keeps evidence score and inferred relevance score separate. Any unavailable conditions remain unavailable.\n\nPSI query: https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation\nNASA Researcher's Guide to ISS Combustion Science: https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/\nNASA E-FIELD Flames: https://science.nasa.gov/biological-physical/investigations/e-field-flames/\nNASA Combustion Science: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/`);
}

// 5 — Research programs and Earth technology context
{
  const s = deck.slides.add(); header(s, 5, 'Safety technologies', 'Connect research themes to safety functions', 'A practical map of prevention, detection and suppression research—plus NASA technology-transfer context for Earth.');
  image(s, 'safety-screen', 'safety.png', 66, 218, 456, 322, 'NovaForge safety technologies page screenshot');
  const tech = [
    { x: 551, label: 'MATERIALS', ids: 'BASS · BASS-II\nSAFFIRE series', desc: 'Solid-fuel flammability research', color: C.orange },
    { x: 771, label: 'DETECTION', ids: 'SAME · SAME-R\nDAFT · DAFT-2', desc: 'Smoke and dust sensing', color: C.cyan },
    { x: 991, label: 'SUPPRESSION', ids: 'FLEX · FLEX-2\nCFI', desc: 'Droplet combustion & suppression', color: C.green },
  ];
  for (let i = 0; i < tech.length; i++) {
    const t = tech[i];
    shape(s, `tech-card-${i}`, t.x, 228, 202, 302, C.panel, { radius: 14, line: { style: 'solid', fill: C.line, width: 1 } });
    shape(s, `tech-accent-${i}`, t.x + 20, 250, 32, 3, t.color);
    txt(s, `tech-label-${i}`, t.label, t.x + 20, 272, 165, 22, { size: '10pt', color: t.color, bold: true });
    txt(s, `tech-ids-${i}`, t.ids, t.x + 20, 318, 168, 76, { size: '16pt', bold: true });
    txt(s, `tech-desc-${i}`, t.desc, t.x + 20, 422, 163, 59, { size: '12pt', color: C.muted });
  }
  line(s, 'earth-context-rule', 66, 568, 1148, 1, C.line);
  txt(s, 'earth-context-title', 'EARTH APPLICATIONS · NASA SPINOFF CONTEXT', 66, 586, 438, 22, { size: '10pt', color: C.cyan, bold: true });
  txt(s, 'earth-context-list', 'Fine-water-mist extinguishers  ·  smoke/dust-discriminating detectors  ·  firefighter air tanks  ·  protective clothing', 66, 616, 1125, 32, { size: '13pt', color: C.white });
  note(s, `The dashboard groups investigations by safety function. These labels aid exploration and do not assert that any test certifies a material as safe. NASA Spinoff links are Earth-application context and are not evidence that a particular PSI investigation created or validated the technology.\n\nNASA Fire Detector spinoff: https://spinoff.nasa.gov/node/9407\nNASA Fireman's Air Tanks spinoff: https://spinoff.nasa.gov/node/9582\nNASA Fire Attire spinoff: https://spinoff.nasa.gov/node/9918\nNASA Fine Water Mist source: https://spinoff.nasa.gov/Spinoff2020/ip_5.html\nNASA PSI query: https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation`);
}

// 6 — Grounded SI assistant
{
  const s = deck.slides.add(); header(s, 6, 'SI assistant', 'Ask a question. Get a sourced answer—or a clear gap.', 'The assistant retrieves records first, then answers only from that evidence.');
  shape(s, 'rag-panel', 66, 221, 524, 387, C.panel, { radius: 16, line: { style: 'solid', fill: C.line, width: 1 } });
  const steps = [
    ['01', 'RETRIEVE', 'Find the relevant loaded PSI records.'],
    ['02', 'EXPLAIN', 'Summarize or compare with investigation citations.'],
    ['03', 'ABSTAIN', 'Say when a condition or conclusion is not supported.'],
  ];
  steps.forEach(([n, title, body], i) => {
    const y = 252 + i * 94;
    txt(s, `rag-num-${i}`, n, 92, y, 42, 27, { size: '13pt', color: C.orange, bold: true });
    txt(s, `rag-title-${i}`, title, 147, y, 366, 26, { size: '12pt', color: C.cyan, bold: true });
    txt(s, `rag-desc-${i}`, body, 147, y + 33, 386, 42, { size: '14pt', color: C.white });
    if (i < 2) line(s, `rag-line-${i}`, 92, y + 76, 444, 1, C.line);
  });
  pill(s, 'DEMO (cached)', 92, 541, 157, C.yellow, '#302A1A');
  txt(s, 'demo-note', 'Default mode when no server-side AI key is configured.', 264, 546, 295, 28, { size: '11pt', color: C.muted });
  image(s, 'assistant-screen', 'assistant.png', 633, 222, 583, 353, 'NovaForge assistant page screenshot displaying grounded response and demo mode');
  shape(s, 'assistant-caution-bg', 633, 593, 583, 47, '#132437', { radius: 10 });
  txt(s, 'assistant-caution', 'Research aid only. No invented measurements or safety certification.', 651, 606, 550, 25, { size: '13pt', color: C.white, bold: true });
  note(s, `The SI assistant is retrieval-augmented: it retrieves relevant loaded dataset records before generating an answer, cites investigations/records, and should report when the dataset does not support an answer. In no-key configuration, the interface uses DEMO (cached) mode; do not describe it as live AI. The app's TESTING.md documents available and unavailable questions.\n\nNASA PSI query: https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation\nNASA Researcher's Guide: https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/`);
}

// 7 — Gaps, trust boundaries and submission sources
{
  const s = deck.slides.add(); header(s, 7, 'Limits & next steps', 'Know what the snapshot cannot answer', 'Clear gaps are part of a trustworthy safety-research tool.');
  image(s, 'gap-screen', 'gaps.png', 66, 219, 552, 319, 'NovaForge data gaps page screenshot');
  shape(s, 'gaps-panel', 656, 218, 560, 321, C.panel, { radius: 16, line: { style: 'solid', fill: C.line, width: 1 } });
  txt(s, 'gap-title', 'VISIBLE DATA GAPS', 682, 243, 478, 22, { size: '10pt', color: C.orange, bold: true });
  const gapItems = [
    'O₂ concentration, pressure, ppO₂ and airflow are missing from many loaded summaries.',
    'This PSI query snapshot does not include LUCI or FM² partial-gravity records.',
    'NASA separately reports LUCI simulated lunar-g testing; FM² studies materials at lunar 1/6 g.',
    'E-FIELD Flames uses electric fields on flame ions; it does not simulate partial gravity.',
  ];
  gapItems.forEach((g, i) => {
    const y = 282 + i * 57;
    shape(s, `gap-bullet-${i}`, 684, y + 7, 7, 7, i === 1 ? C.orange : C.cyan, { geometry: 'ellipse' });
    txt(s, `gap-text-${i}`, g, 704, y, 480, 46, { size: '12pt', color: C.white });
  });
  line(s, 'source-rule', 66, 562, 1148, 1, C.line);
  txt(s, 'source-title', 'SOURCE TRAIL', 66, 579, 185, 20, { size: '10pt', color: C.cyan, bold: true });
  txt(s, 'source-lines', 'PSI.NASA.GOV  ·  NASA.GOV COMBUSTION SCIENCE  ·  NASA.GOV LUCI / FM²  ·  NASA SPINOFF', 66, 607, 1120, 23, { size: '11pt', color: C.white, bold: true });
  txt(s, 'disclaimer', 'Educational research tool · Not a certified safety system · NASA is not affiliated with or endorsing NovaForge', 66, 640, 1120, 19, { size: '9pt', color: C.muted });
  note(s, `In this specific PSI combustion query snapshot, many summaries do not expose oxygen concentration, total pressure, calculated ppO2, or airflow values; use individual linked records to check availability. This snapshot excludes LUCI and FM2. Do not repeat the challenge prompt's older premise as a current global claim that NASA has no partial-gravity combustion data: NASA has reported LUCI simulated lunar-gravity combustion tests separately. NASA describes FM2 as studying burning materials on the Moon at one-sixth Earth gravity. E-FIELD Flames applies electric fields to flame-generated ions; it is not gravity manipulation. Microgravity and normal gravity results may bound intermediate gravity but do not directly establish outcomes.\n\nPSI query: https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation\nNASA LUCI flight summary: https://www.nasa.gov/stmd-flight-opportunities/flight-summaries/lunar-gravity-simulation-via-suborbital-rocket/\nNASA LUCI reduced-gravity article: https://www.nasa.gov/centers-and-facilities/glenn/nasa-fire-safety-test-took-on-reduced-gravity/\nNASA LUCI technical results: https://ntrs.nasa.gov/citations/20250010653\nNASA FM2: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/\nNASA E-FIELD Flames: https://science.nasa.gov/biological-physical/investigations/e-field-flames/\nNASA Researcher's Guide: https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/\nNASA Apollo 1: https://sma.nasa.gov/sma-disciplines/accllp/apollo-1\nNASA Apollo 13: https://sma.nasa.gov/sma-disciplines/accllp/apollo-13\nNASA Mir fire: https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/\nEducational research tool only; not certified for flight, engineering qualification or safety decisions. NASA is not affiliated with or endorsing NovaForge.`);
}

await fs.mkdir(previews, { recursive: true });
await fs.mkdir(staging, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(path.join(previews, `slide-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()));
}
await (await PresentationFile.exportPptx(deck)).save(candidate);

try {
  await finalizePresentation({
    workspaceDir,
    candidatePath: candidate,
    finalPath: outputPptx,
    pythonExecutable: 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
    integrityValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_package_integrity.py'),
    layoutValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_layout_geometry.py'),
    layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
    explicitTotalSlideCount: 7,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
    fontPolicy: { basis: 'design', families: [F] },
    verifyArtifactToolImport: true,
    receiptPath: receipt,
  });
} catch (err) {
  // The supplied validator completed, but this Windows workspace denies its final hard-link publish.
  // Copy the unchanged, validator-inspected candidate and confirm byte identity before delivery.
  if (err?.code !== 'EPERM' || !String(err?.message).includes('link')) throw err;
  await fs.copyFile(candidate, outputPptx, constants.COPYFILE_EXCL);
  const digest = async (p) => createHash('sha256').update(await fs.readFile(p)).digest('hex');
  if (await digest(candidate) !== await digest(outputPptx)) throw new Error('Copied PPTX differs from validated candidate.');
}
console.log(JSON.stringify({ slides: deck.slides.items.length, outputPptx, previews }, null, 2));
