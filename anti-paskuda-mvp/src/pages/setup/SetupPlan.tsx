import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/auth-context';
import { useNavigate } from 'react-router';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import {
  useCreatePlanMutation,
  useGetProfileByIdQuery,
} from '../../services/api';
import Button from '../../components/Button';
import { FormField } from '../../components/FormField';
import { Input } from '../../components/Input';
import { skipToken } from '@reduxjs/toolkit/query';
import PlannedAvailable from '../../components/PlannedAvailable';

// TO DO вынести в отдельный словарь
const currencySymbols: Readonly<Record<string, string>> = {
  RUB: '₽',
  GEL: '₾',
};

type FormValues = {
  month: string;
  income: number;
  essential_reserve: number;
  debt_payment_reserve: number;
  planned_savings: number;
};

function amountOrZero(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export default function SetupPlan() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const [income, essentials, debtPayments, savings] = useWatch({
    control,
    name: [
      'income',
      'essential_reserve',
      'debt_payment_reserve',
      'planned_savings',
    ],
  });
  const plannedAvailable =
    amountOrZero(income) -
    amountOrZero(essentials) -
    amountOrZero(debtPayments) -
    amountOrZero(savings);

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetProfileByIdQuery(session?.user.id ?? skipToken);
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();

  if (!session) return null;
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Could not load profile.</p>;
  if (!profile) return <p>Profile not found.</p>;
  const currency = profile.currency;
  const currencySymbol = currencySymbols[currency] ?? currency;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!session) {
      setError('root', {
        message: 'Please sign in again',
      });
      return;
    }
    const result = await createPlan({
      owner_id: session.user.id,
      debt_payment_reserve: data.debt_payment_reserve,
      essential_reserve: data.essential_reserve,
      income: data.income,
      month: `${data.month}-01`,
      planned_savings: data.planned_savings,
    });
    if (result.error) {
      setError('root', {
        message:
          'message' in result.error
            ? (result.error.message ?? 'Could not create plan')
            : 'Could not create plan',
      });
      return;
    }
    reset();
    navigate('/');
  };

  return (
    <div className="mr-5 ml-5 mt-10 flex flex-col">
      <p>{t('setup.plan.description')}</p>
      <form
        className="flex flex-col gap-4 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField label={t('setup.plan.period')}>
          {(field) => (
            <Input
              {...register('month', {
                required: 'Выбери месяц',
                pattern: {
                  value: /^\d{4}-(0[1-9]|1[0-2])$/,
                  message: 'Введи месяц в формате ГГГГ-ММ',
                },
              })}
              {...field}
              type="month"
            />
          )}
        </FormField>
        <FormField label={t('setup.plan.income')}>
          {(field) => (
            <Input
              {...register('income', {
                required: 'Input income',
                valueAsNumber: true,
              })}
              {...field}
              type="number"
              suffix={currencySymbol}
            />
          )}
        </FormField>
        <FormField label={t('setup.plan.neededSpend')}>
          {(field) => (
            <Input
              {...register('essential_reserve', {
                required: 'Input essential reserve',
                valueAsNumber: true,
              })}
              {...field}
              type="number"
              suffix={currencySymbol}
            />
          )}
        </FormField>
        <FormField label={t('setup.plan.debt')}>
          {(field) => (
            <Input
              {...register('debt_payment_reserve', {
                required: 'Input debt payments',
                valueAsNumber: true,
              })}
              {...field}
              type="number"
              suffix={currencySymbol}
            />
          )}
        </FormField>
        <FormField label={t('setup.plan.savings')}>
          {(field) => (
            <Input
              {...register('planned_savings', {
                required: 'Input planned savings',
                valueAsNumber: true,
              })}
              {...field}
              type="number"
              suffix={currencySymbol}
            />
          )}
        </FormField>
        <PlannedAvailable amount={plannedAvailable} currency={currency} />
        {errors.root?.message && <p role="alert">{errors.root.message}</p>}
        <Button type="submit">
          {isCreating ? 'Creating...' : t('setup.plan.submit')}
        </Button>
      </form>
    </div>
  );
}
