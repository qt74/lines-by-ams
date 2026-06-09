import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SKILLS = [
  'Model','Stylist','Photographer','Videographer','Makeup Artist',
  'Hair Stylist','Fashion Designer','Seamstress / Tailor',
  'Textile Artist','Wardrobe Manager','Brand Ambassador',
  'Social Media Influencer','Art Director','Fashion Illustrator','Pattern Maker',
];
const CONTRACTS    = ['Yearly','Monthly','Hourly'];
const AVAILABILITY = ['Available','Booked','Unavailable'];

const EMPTY = {
  name: '', nameAr: '', bio: '', bioAr: '', location: '', phone: '',
  skills: [], contractTypes: [], availability: 'Available',
  salaryRange: { min: '', max: '' }, experience: '',
  photo: null,
};

export default function TalentForm() {
  const { t } = useTranslation();
  const { id }  = useParams();   // if editing
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form,    setForm]    = useState(EMPTY);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/talent/${id}`).then(r => {
        const tl = r.data.talent;
        setForm({ ...tl, salaryRange: tl.salaryRange || { min:'', max:'' }, photo: null });
        setPreview(tl.photo || '');
      }).catch(() => toast.error('Failed to load talent'));
    }
  }, [id]);

  const toggle = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  };

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, photo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.skills.length === 0)        return toast.error('Select at least one skill');
    if (form.contractTypes.length === 0) return toast.error('Select at least one contract type');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'skills' || k === 'contractTypes') {
          v.forEach(item => fd.append(k + '[]', item));
        } else if (k === 'salaryRange') {
          fd.append('salaryRange[min]', v.min);
          fd.append('salaryRange[max]', v.max);
        } else if (k === 'photo') {
          if (v) fd.append('photo', v);
        } else {
          fd.append(k, v);
        }
      });

      if (isEdit) {
        await api.put(`/talent/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Talent updated!');
      } else {
        await api.post('/talent', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Talent added!');
      }
      navigate('/agency/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setLoading(false);
  };

  return (
    <main className="form-page">
      <div className="container">
        <div className="form-page__header">
          <h1>{isEdit ? 'Edit Talent Profile' : t('agency.addTalent')}</h1>
          <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="talent-form" encType="multipart/form-data">
          {/* PHOTO */}
          <div className="form-photo">
            <div className="form-photo__preview">
              {preview
                ? <img src={preview} alt="Preview" />
                : <span>No photo</span>
              }
            </div>
            <div>
              <label className="btn btn--outline btn--sm" style={{ cursor:'pointer' }}>
                Upload Photo
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
              </label>
              <p className="form-hint">JPG, PNG, WebP · max 5MB</p>
            </div>
          </div>

          <div className="form-grid">
            <label>Name (English) *
              <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </label>
            <label>Name (Arabic)
              <input value={form.nameAr} onChange={e => setForm(f => ({...f, nameAr: e.target.value}))} dir="rtl" placeholder="الاسم" />
            </label>
            <label>Location
              <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="Doha, Qatar" />
            </label>
            <label>Phone
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            </label>
            <label>Years of Experience
              <input type="number" min="0" value={form.experience}
                onChange={e => setForm(f => ({...f, experience: e.target.value}))} />
            </label>
            <label>Availability *
              <select value={form.availability} onChange={e => setForm(f => ({...f, availability: e.target.value}))}>
                {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label>Min Salary (QAR)
              <input type="number" value={form.salaryRange.min}
                onChange={e => setForm(f => ({...f, salaryRange:{...f.salaryRange, min:e.target.value}}))} />
            </label>
            <label>Max Salary (QAR)
              <input type="number" value={form.salaryRange.max}
                onChange={e => setForm(f => ({...f, salaryRange:{...f.salaryRange, max:e.target.value}}))} />
            </label>
          </div>

          <label>Bio (English)
            <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} />
          </label>
          <label>Bio (Arabic)
            <textarea rows={3} value={form.bioAr} onChange={e => setForm(f => ({...f, bioAr: e.target.value}))} dir="rtl" placeholder="النبذة..." />
          </label>

          {/* SKILLS */}
          <div className="form-checkgroup">
            <label className="form-checkgroup__title">{t('talent.skills')} *</label>
            <div className="check-chips">
              {SKILLS.map(s => (
                <button type="button" key={s}
                  className={`check-chip ${form.skills.includes(s) ? 'active' : ''}`}
                  onClick={() => toggle('skills', s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* CONTRACT TYPES */}
          <div className="form-checkgroup">
            <label className="form-checkgroup__title">{t('talent.contracts')} *</label>
            <div className="check-chips">
              {CONTRACTS.map(c => (
                <button type="button" key={c}
                  className={`check-chip ${form.contractTypes.includes(c) ? 'active' : ''}`}
                  onClick={() => toggle('contractTypes', c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--solid btn--lg" disabled={loading}>
              {loading ? t('common.loading') : isEdit ? 'Save Changes' : 'Add Talent Profile'}
            </button>
            <button type="button" className="btn btn--outline btn--lg" onClick={() => navigate(-1)}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
