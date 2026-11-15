import { useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { ToastProvider } from './components/ui'
import { DraftProvider } from './lib/draft'
import { I18nProvider } from './lib/i18n'
import { StoreProvider, useStore } from './lib/store'
import { CategoriesManage, CategoryCatalog, CategoryForm } from './pages/Categories'
import { DiaryEmptyDetail, DiaryLayout, EntryDetail } from './pages/Diary'
import { EntryEdit, WizardCategory, WizardDetails, WizardFeeling } from './pages/EntryForms'
import { GoalForm, GoalsPage } from './pages/Goals'
import { ImprintPage, LockScreen, MorePage, PrivacyPage, SharePage, SupportPage } from './pages/More'

function Gate() {
  const { data } = useStore()
  const [locked, setLocked] = useState(!!data.settings.pinHash)
  if (locked && data.settings.pinHash) return <LockScreen onUnlock={() => setLocked(false)} />
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/tagebuch" replace />} />
          <Route path="tagebuch" element={<DiaryLayout />}>
            <Route index element={<DiaryEmptyDetail />} />
            <Route path="eintrag/:id" element={<EntryDetail />} />
          </Route>
          <Route path="eintrag/:id/bearbeiten" element={<EntryEdit />} />
          <Route path="neu">
            <Route index element={<Navigate to="kategorie" replace />} />
            <Route path="kategorie" element={<WizardCategory />} />
            <Route path="details" element={<WizardDetails />} />
            <Route path="befinden" element={<WizardFeeling />} />
          </Route>
          <Route path="ziele" element={<GoalsPage />} />
          <Route path="ziele/neu" element={<GoalForm />} />
          <Route path="ziele/:id" element={<GoalForm />} />
          <Route path="mehr" element={<MorePage />} />
          <Route path="mehr/kategorien" element={<CategoriesManage />} />
          <Route path="mehr/kategorien/hinzufuegen" element={<CategoryCatalog />} />
          <Route path="mehr/kategorien/neu" element={<CategoryForm />} />
          <Route path="mehr/kategorien/:id" element={<CategoryForm />} />
          <Route path="mehr/teilen" element={<SharePage />} />
          <Route path="mehr/unterstuetzung" element={<SupportPage />} />
          <Route path="mehr/datenschutz" element={<PrivacyPage />} />
          <Route path="mehr/impressum" element={<ImprintPage />} />
          <Route path="*" element={<Navigate to="/tagebuch" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <I18nProvider>
        <ToastProvider>
          <DraftProvider>
            <Gate />
          </DraftProvider>
        </ToastProvider>
      </I18nProvider>
    </StoreProvider>
  )
}
