// TO DO Can be later reused to become a universal stepper

import { useTranslation } from 'react-i18next';

export default function SetupStepper({
  step,
}: {
  step: Record<string, number>;
}) {
  const { t } = useTranslation();
// TO DO adding of active color also make more smart later!
  return (
    <>
      <hr className='ml-4 mr-4 mt-1'/>
      <div className="flex items-center justify-around">
        <p>{`шаг ${step.step} из ${step.total}`}</p>
        <div className="flex items-center gap-3">
          <span className={`stepper ${step.step === 1 ? 'activeStepper' : 'completedStep'}`}>
            {t('nav.profile')}
          </span>
          <span className="text-4xl">→</span>{' '}
          <span className={`stepper ${step.step === 2 ? 'activeStepper' : ''}`}>
            {t('plan')}
          </span>
        </div>
      </div>
      <hr className='ml-4 mr-4 mb-4'/>
    </>
  );
}
