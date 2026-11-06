import { useTranslation } from 'react-i18next';

type PlannedAvailableProps = {
  amount: number;
  currency: string;
};

export default function PlannedAvailable({
  amount,
  currency,
}: PlannedAvailableProps) {
  const { t, i18n } = useTranslation();

  const formattedAmount = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
  }).format(amount);

  return (
    <section className="border-5 border-accent bg-accent-bg rounded-2xl p-3 flex flex-col gap-2">
      <p className="font-bold text-xl">{t('plannedAvailable.title')}</p>
      <p className="origin-left text-accent press-start-2p-regular text-2xl">
        {formattedAmount}
      </p>
      <p>{t('plannedAvailable.desc')}</p>
    </section>
  );
}
