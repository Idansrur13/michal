/**
 * ==========================================================================
 *  הגדרות העיצוב של המגדל — הקובץ שממנו משדרגים ומרחיבים
 * ==========================================================================
 *  כל מה שמופיע בפאנל ההגדרות בעמוד נטען מהקובץ הזה.
 *  כדי להוסיף סגנון / מצב תאורה / גוון זכוכית — פשוט מוסיפים אובייקט
 *  למערך המתאים, והוא יופיע אוטומטית בעמוד. אין צורך לגעת בשום קוד אחר.
 * ==========================================================================
 */

/* ---------- סגנונות אדריכליים ---------- */

export interface Setback {
  /** גובה יחסי שבו מתחילה הנסיגה (0 = קרקע, 1 = גג) */
  at: number
  /** מכפיל רוחב מעל הנסיגה (0.8 = הבניין מצטמצם ל-80%) */
  shrink: number
}

export interface TowerStyle {
  id: string
  label: string
  description: string
  /** סיבוב כולל של הבניין במעלות, מהקרקע עד הגג (0 = בניין ישר) */
  twist: number
  /** רוחב הגג ביחס לבסיס (1 = ישר, 0.5 = הגג צר בחצי) */
  taper: number
  /** מדרגות נסיגה בסגנון טרסות */
  setbacks: Setback[]
  /** מרפסות: 'alternate' = מתחלפות בצדדים, 'wrap' = לכל רוחב החזית, 'none' = בלי */
  balconies: 'alternate' | 'wrap' | 'none'
  /** צלעות אלומיניום אנכיות על החזית */
  fins: boolean
  /** גינות ירוקות על מדרגות הנסיגה */
  greenRoofs: boolean
  /** קומת פנטהאוז על הגג */
  penthouse: boolean
  /** טבעת כתר מוארת בראש המגדל */
  crownRing: boolean
}

export const TOWER_STYLES: TowerStyle[] = [
  {
    id: 'modern',
    label: 'מודרני',
    description: 'מגדל זכוכית נקי עם צלעות אלומיניום ומרפסות מתחלפות',
    twist: 0,
    taper: 1,
    setbacks: [],
    balconies: 'alternate',
    fins: true,
    greenRoofs: false,
    penthouse: true,
    crownRing: false,
  },
  {
    id: 'twist',
    label: 'טוויסט',
    description: 'מגדל מתפתל בהשראת אדריכלות עכשווית — כל קומה מסתובבת מעט',
    twist: 85,
    taper: 0.8,
    setbacks: [],
    balconies: 'none',
    fins: false,
    greenRoofs: false,
    penthouse: false,
    crownRing: true,
  },
  {
    id: 'terraces',
    label: 'טרסות',
    description: 'נסיגות מדורגות עם גינות ירוקות ומרפסות לכל רוחב החזית',
    twist: 0,
    taper: 1,
    setbacks: [
      { at: 0.38, shrink: 0.82 },
      { at: 0.72, shrink: 0.78 },
    ],
    balconies: 'wrap',
    fins: false,
    greenRoofs: true,
    penthouse: true,
    crownRing: false,
  },
  /* ➕ הוסיפו כאן סגנון חדש משלכם, למשל:
  {
    id: 'pyramid',
    label: 'פירמידה',
    description: 'מגדל מתחדד כלפי מעלה',
    twist: 0,
    taper: 0.35,
    setbacks: [],
    balconies: 'none',
    fins: false,
    greenRoofs: false,
    penthouse: false,
    crownRing: true,
  },
  */
]

export function getStyle(id: string): TowerStyle {
  return TOWER_STYLES.find((s) => s.id === id) ?? TOWER_STYLES[0]
}

/* ---------- מצבי תאורה (שעות היום) ---------- */

export interface TimeMode {
  id: string
  label: string
  /** צבע השמיים והערפל (hex) */
  sky: number
  /** צבע השמש */
  sun: number
  sunIntensity: number
  hemiIntensity: number
  fillIntensity: number
  /** איזה חלק מהחלונות דולק (0 עד 1) */
  litProb: number
  fogNear: number
  fogFar: number
}

export const TIME_MODES: TimeMode[] = [
  {
    id: 'day',
    label: 'יום',
    sky: 0x7ba3cf,
    sun: 0xfff4e0,
    sunIntensity: 2.3,
    hemiIntensity: 0.95,
    fillIntensity: 0.35,
    litProb: 0.06,
    fogNear: 150,
    fogFar: 420,
  },
  {
    id: 'sunset',
    label: 'שקיעה',
    sky: 0x0b1322,
    sun: 0xffb27a,
    sunIntensity: 1.6,
    hemiIntensity: 0.55,
    fillIntensity: 0.45,
    litProb: 0.45,
    fogNear: 110,
    fogFar: 300,
  },
  {
    id: 'night',
    label: 'לילה',
    sky: 0x060a13,
    sun: 0x8fa8d8,
    sunIntensity: 0.5,
    hemiIntensity: 0.3,
    fillIntensity: 0.25,
    litProb: 0.82,
    fogNear: 90,
    fogFar: 260,
  },
]

export function getTime(id: string): TimeMode {
  return TIME_MODES.find((t) => t.id === id) ?? TIME_MODES[1]
}

/* ---------- גווני זכוכית ---------- */

export interface GlassOption {
  id: string
  label: string
  /** הצבע בתלת־ממד (hex מספרי) */
  color: number
  /** הצבע של כפתור הבחירה בעמוד (CSS) */
  css: string
}

export const GLASS_OPTIONS: GlassOption[] = [
  { id: 'ocean', label: 'כחול אוקיינוס', color: 0x16344f, css: '#2e5b83' },
  { id: 'emerald', label: 'ירוק אמרלד', color: 0x0f3d33, css: '#1f6b58' },
  { id: 'champagne', label: 'זהב שמפניה', color: 0x4f4222, css: '#a3833c' },
  { id: 'graphite', label: 'גרפיט', color: 0x1b2026, css: '#3a4250' },
]

export function getGlass(id: string): GlassOption {
  return GLASS_OPTIONS.find((g) => g.id === id) ?? GLASS_OPTIONS[0]
}
