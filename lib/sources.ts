export const SOURCES = {
  psi: { title: "NASA PSI · combustion investigations", url: "https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation" },
  nasaCombustion: { title: "NASA Combustion Science", url: "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/" },
  issGuide: { title: "Researcher’s Guide to ISS Combustion Science", url: "https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/" },
  challenge: { title: "NASA Space Apps 2026 challenge brief", url: "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/" },
  eField: { title: "NASA · E-FIELD Flames", url: "https://science.nasa.gov/biological-physical/investigations/e-field-flames/" },
  luciResults: { title: "NASA NTRS · LUCI flammability results", url: "https://ntrs.nasa.gov/citations/20250010653" },
  luciFlight: { title: "NASA · LUCI simulated lunar-gravity flight", url: "https://www.nasa.gov/centers-and-facilities/glenn/nasa-fire-safety-test-took-on-reduced-gravity/" },
  fm2: { title: "NASA · Flammability of Materials on the Moon (FM²)", url: "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/" },
  electricFieldGravity: { title: "NASA NTRS · electrical aspects of microgravity combustion", url: "https://ntrs.nasa.gov/citations/19990054083" },
  moonGravity: { title: "NASA · Moon gravity", url: "https://science.nasa.gov/moon/top-moon-questions/" },
  marsGravity: { title: "NASA · Mars fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1" },
  scienceCasts: { title: "NASA ScienceCasts · Fire in Space", url: "https://www.youtube.com/watch?v=W1oXykoz9zg" },
  apollo1: { title: "NASA · Apollo 1", url: "https://sma.nasa.gov/sma-disciplines/accllp/apollo-1" },
  apollo13: { title: "NASA · Apollo 13", url: "https://sma.nasa.gov/sma-disciplines/accllp/apollo-13" },
  mir: { title: "NASA · Mir fire", url: "https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/" },
  spinoffTanks: { title: "NASA Spinoff · Firefighter air tanks", url: "https://spinoff.nasa.gov/node/9582" },
  spinoffDetector: { title: "NASA Spinoff · Fire detector", url: "https://spinoff.nasa.gov/node/9407" },
  spinoffClothing: { title: "NASA Spinoff · Firefighter clothing", url: "https://spinoff.nasa.gov/node/9918" },
  fineMist: { title: "NASA Spinoff · fine-water-mist extinguisher", url: "https://spinoff.nasa.gov/Spinoff2020/ip_5.html" },
  mistTechPort: { title: "NASA TechPort · portable fine-water-mist extinguisher", url: "https://techport.nasa.gov/projects/8685" },
} as const;

export type SourceKey = keyof typeof SOURCES;
