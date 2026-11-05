import { useTranslation } from 'react-i18next';
import { FormField } from '../../components/FormField';
import { Input } from '../../components/Input';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../auth/auth-context';
import Button from '../../components/Button';
import { Select } from '../../components/Select';
import { useCreateProfileMutation } from '../../services/api';
import { useNavigate } from 'react-router';

type FormValues = {
  display_name: string;
  currency: string;
  timezone: string;
};

export default function SetupProfile() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!session) {
      setError('root', {
        message: 'Please sign in again',
      });
      return;
    }

    const result = await createProfile({
      id: session.user.id,
      display_name: data.display_name,
      currency: data.currency,
      timezone: data.timezone,
    });
    if (result.error) {
      setError('root', {
        message:
          'message' in result.error
            ? (result.error.message ?? 'Could not create profile')
            : 'Could not create profile',
      });
      return;
    } else {
      reset();
      navigate('/setup/plan');
    }
  };

  return (
    <div className="mr-5 ml-5 mt-20 flex flex-col">
      <div>
        <b>{session?.user.user_metadata.name}</b>,
        <p>{t('setup.profile.description')}</p>
      </div>
      <form
        className="flex flex-col gap-4 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField label={t('name')} error={errors.display_name?.message}>
          {(field) => (
            <Input
              {...register('display_name', { required: 'Input name' })}
              {...field}
            />
          )}
        </FormField>
        <FormField
          label={t('currency')}
          error={errors.currency?.message}
          hint={t('setup.profile.attentionCurrency')}
        >
          {(field) => (
            <Select
              {...register('currency', { required: 'Select currency' })}
              {...field}
            >
              <option value="">Выбери валюту</option>
              <option value="RUB">RUB — Российский рубль</option>
              <option value="GEL">GEL — Грузинский лари</option>
            </Select>
          )}
        </FormField>
        <FormField label={t('timezone')} error={errors.timezone?.message}>
          {(field) => (
            <Select
              {...register('timezone', { required: 'Select timezone' })}
              {...field}
            >
              <option value="">Выбери часовой пояс</option>
              <option value="Europe/Moscow">Москва</option>
              <option value="Asia/Tbilisi">Тбилиси</option>
            </Select>
          )}
        </FormField>
        {errors.root?.message && <p role="alert">{errors.root.message}</p>}
        <Button type="submit">
          {isCreating ? 'Creating...' : t('setup.profile.submit')}
        </Button>
      </form>
    </div>
  );
}
