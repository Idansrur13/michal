import { useState, type ChangeEvent, type FormEvent } from 'react'
import Building3D from './components/Building3D'

const H_MIN = 8
const H_MAX = 150
const W_MIN = 10
const W_MAX = 60

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

export default function App() {
  const [height, setHeight] = useState(54)
  const [width, setWidth] = useState(26)
  const [sent, setSent] = useState(false)

  const floors = Math.max(1, Math.round(height / 3))
  const depth = Math.round(width * 0.8)
  const floorArea = Math.round(width * depth * 0.82)
  const aptsPerFloor = Math.max(1, Math.floor(floorArea / 95))
  const totalApts = Math.max(1, aptsPerFloor * Math.max(1, floors - 1)) + 1

  const lowTop = Math.max(2, Math.floor(floors * 0.45))
  const midTop = Math.max(lowTop + 1, floors - 2)

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.valueAsNumber
    if (!Number.isNaN(value)) setHeight(value)
  }

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.valueAsNumber
    if (!Number.isNaN(value)) setWidth(value)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className='page'>
      <header className='nav'>
        <a className='brand' href='#top'>
          מגדל <span>מיכל</span>
        </a>
        <nav className='nav-links'>
          <a href='#specs'>מפרט ומידות</a>
          <a href='#apartments'>דירות</a>
          <a href='#contact'>צור קשר</a>
        </nav>
        <a className='btn btn-gold btn-small' href='#contact'>
          תיאום פגישה
        </a>
      </header>

      <section className='hero' id='top'>
        <Building3D
          height={clamp(height, H_MIN, H_MAX)}
          width={clamp(width, W_MIN, W_MAX)}
        />

        <div className='hero-overlay'>
          <div className='hero-copy'>
            <p className='kicker'>פרויקט מגורים יוקרתי | הרשמה מוקדמת</p>
            <h1>
              מגדל <em>מיכל</em>
            </h1>
            <p className='hero-sub'>
              {floors} קומות של שלמות אדריכלית מעל פארק עירוני. חזית זכוכית,
              מרפסות שמש ולובי בגובה כפול — הכול בהדמיה תלת־ממדית חיה מולכם.
            </p>
            <div className='hero-actions'>
              <a className='btn btn-gold' href='#apartments'>
                לצפייה בדירות
              </a>
              <a className='btn btn-ghost' href='#specs'>
                מפרט ומידות
              </a>
            </div>
            <p className='drag-hint'>
              🖱️ גררו לסיבוב הבניין · Ctrl + גלגלת (או צביטה) להתקרבות
            </p>
          </div>

          <aside className='config-panel'>
            <h2>מידות הפרויקט</h2>
            <p className='panel-sub'>שנו את המידות — ההדמיה מתעדכנת בזמן אמת</p>
            <div className='field'>
              <label htmlFor='height-input'>גובה הבניין (מטרים)</label>
              <div className='field-row'>
                <input
                  id='height-input'
                  type='range'
                  min={H_MIN}
                  max={H_MAX}
                  step={1}
                  value={clamp(height, H_MIN, H_MAX)}
                  onChange={handleHeightChange}
                />
                <input
                  type='number'
                  min={H_MIN}
                  max={H_MAX}
                  step={1}
                  value={height}
                  onChange={handleHeightChange}
                  onBlur={() => setHeight(clamp(height, H_MIN, H_MAX))}
                  aria-label='גובה הבניין במטרים'
                />
              </div>
            </div>
            <div className='field'>
              <label htmlFor='width-input'>רוחב חזית (מטרים)</label>
              <div className='field-row'>
                <input
                  id='width-input'
                  type='range'
                  min={W_MIN}
                  max={W_MAX}
                  step={1}
                  value={clamp(width, W_MIN, W_MAX)}
                  onChange={handleWidthChange}
                />
                <input
                  type='number'
                  min={W_MIN}
                  max={W_MAX}
                  step={1}
                  value={width}
                  onChange={handleWidthChange}
                  onBlur={() => setWidth(clamp(width, W_MIN, W_MAX))}
                  aria-label='רוחב הבניין במטרים'
                />
              </div>
            </div>
            <dl className='panel-stats'>
              <div>
                <dt>קומות</dt>
                <dd>{floors}</dd>
              </div>
              <div>
                <dt>דירות</dt>
                <dd>{totalApts}</dd>
              </div>
              <div>
                <dt>שטח קומה</dt>
                <dd>{floorArea} מ״ר</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className='stats-strip'>
        <div className='stat'>
          <strong>{floors}</strong>
          <span>קומות</span>
        </div>
        <div className='stat'>
          <strong>{totalApts}</strong>
          <span>דירות בפרויקט</span>
        </div>
        <div className='stat'>
          <strong>{height} מ׳</strong>
          <span>גובה המגדל</span>
        </div>
        <div className='stat'>
          <strong>2028</strong>
          <span>אכלוס משוער</span>
        </div>
      </section>

      <section className='section' id='specs'>
        <p className='kicker center'>מפרט טכני</p>
        <h2 className='section-title'>בנוי סביב איכות החיים שלכם</h2>
        <div className='cards'>
          <article className='card'>
            <div className='card-icon'>🏛️</div>
            <h3>לובי כפול מפואר</h3>
            <p>
              לובי כניסה בגובה כפול בעיצוב אדריכלי, עמדת קבלה ופינות ישיבה
              מרוהטות.
            </p>
          </article>
          <article className='card'>
            <div className='card-icon'>🛗</div>
            <h3>מעליות מהירות</h3>
            <p>
              שתי מעליות שבדיות מהירות עם בקרת יעדים חכמה וירידה ישירה לחניון.
            </p>
          </article>
          <article className='card'>
            <div className='card-icon'>🚗</div>
            <h3>חניון תת־קרקעי</h3>
            <p>שתי קומות חניה, עמדות טעינה לרכב חשמלי ומחסן צמוד לכל דירה.</p>
          </article>
          <article className='card'>
            <div className='card-icon'>💪</div>
            <h3>מועדון דיירים</h3>
            <p>
              חדר כושר מאובזר, לאונג׳ עבודה משותף וחדר אירועים לרשות הדיירים.
            </p>
          </article>
          <article className='card'>
            <div className='card-icon'>🌅</div>
            <h3>מרפסות שמש</h3>
            <p>מרפסות מרווחות בכל דירה עם נוף פתוח לפארק ולקו הרקיע העירוני.</p>
          </article>
          <article className='card'>
            <div className='card-icon'>🛡️</div>
            <h3>ממ״ד ובטיחות</h3>
            <p>ממ״ד בכל דירה, מערכות כיבוי מתקדמות ובקרת כניסה חכמה 24/7.</p>
          </article>
        </div>

        <div className='dims-table-wrap'>
          <h3 className='table-title'>מידות הפרויקט</h3>
          <table className='data-table'>
            <tbody>
              <tr>
                <th>גובה כולל</th>
                <td>{height} מ׳</td>
                <th>רוחב חזית</th>
                <td>{width} מ׳</td>
              </tr>
              <tr>
                <th>עומק המבנה</th>
                <td>{depth} מ׳</td>
                <th>שטח קומה טיפוסית</th>
                <td>{floorArea} מ״ר</td>
              </tr>
              <tr>
                <th>מספר קומות</th>
                <td>{floors}</td>
                <th>דירות בקומה</th>
                <td>{aptsPerFloor}</td>
              </tr>
              <tr>
                <th>גובה תקרה נטו</th>
                <td>2.90 מ׳</td>
                <th>סה״כ דירות</th>
                <td>{totalApts}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='section section-alt' id='apartments'>
        <p className='kicker center'>תמהיל הדירות</p>
        <h2 className='section-title'>דירה לכל שלב בחיים</h2>
        <div className='table-scroll'>
          <table className='data-table apartments-table'>
            <thead>
              <tr>
                <th>סוג דירה</th>
                <th>חדרים</th>
                <th>שטח בנוי</th>
                <th>שטח חוץ</th>
                <th>קומות</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>דירת גן</td>
                <td>4</td>
                <td>110 מ״ר</td>
                <td>גינה 60 מ״ר</td>
                <td>קרקע</td>
              </tr>
              <tr>
                <td>דירת 3 חדרים</td>
                <td>3</td>
                <td>78 מ״ר</td>
                <td>מרפסת 12 מ״ר</td>
                <td>1–{lowTop}</td>
              </tr>
              <tr>
                <td>דירת 4 חדרים</td>
                <td>4</td>
                <td>102 מ״ר</td>
                <td>מרפסת 15 מ״ר</td>
                <td>1–{midTop}</td>
              </tr>
              <tr>
                <td>דירת 5 חדרים</td>
                <td>5</td>
                <td>128 מ״ר</td>
                <td>מרפסת 18 מ״ר</td>
                <td>
                  {lowTop + 1}–{Math.max(lowTop + 1, floors - 1)}
                </td>
              </tr>
              <tr className='row-highlight'>
                <td>פנטהאוז</td>
                <td>6</td>
                <td>190 מ״ר</td>
                <td>מרפסת גג 80 מ״ר</td>
                <td>{floors}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className='table-note'>
          * התמהיל מתעדכן אוטומטית לפי מידות הבניין שבחרתם בהדמיה
        </p>
      </section>

      <section className='section' id='contact'>
        <p className='kicker center'>מעוניינים לשמוע עוד?</p>
        <h2 className='section-title'>השאירו פרטים ונחזור אליכם</h2>
        {sent ? (
          <div className='sent-box'>
            <div className='sent-icon'>✓</div>
            <h3>תודה! הפרטים התקבלו</h3>
            <p>נציג מטעם הפרויקט יחזור אליכם בתוך יום עסקים אחד.</p>
          </div>
        ) : (
          <form className='contact-form' onSubmit={handleSubmit}>
            <div className='form-row'>
              <input type='text' name='name' placeholder='שם מלא' required />
              <input type='tel' name='phone' placeholder='טלפון' required />
            </div>
            <input type='email' name='email' placeholder='אימייל' required />
            <textarea
              name='message'
              rows={4}
              placeholder='איזו דירה מעניינת אתכם?'
            />
            <button className='btn btn-gold btn-wide' type='submit'>
              שלחו לי פרטים על הפרויקט
            </button>
          </form>
        )}
      </section>

      <footer className='footer'>
        <p>
          מגדל מיכל © {new Date().getFullYear()} · ההדמיות להמחשה בלבד · ט.ל.ח
        </p>
      </footer>
    </div>
  )
}
