import { useTranslation } from 'react-i18next'

export const CompleteObjectivesHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.complete-objectives')}</>
}
