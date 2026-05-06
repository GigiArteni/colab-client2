import { describe, it, expect, vi } from 'vitest';
import { useForm } from './useForm';

describe('useForm', () => {
  it('initialises model from initialValues', () => {
    const { model } = useForm({ initialValues: { email: '', password: '' } });
    expect(model.email).toBe('');
    expect(model.password).toBe('');
  });

  it('reset restores initial values and clears errors', async () => {
    const { model, errors, submit, reset } = useForm({
      initialValues: { name: '' },
      rules: { name: [(v) => !!v || 'Required'] },
    });

    model.name = 'changed';
    await submit(async () => {});
    reset();

    expect(model.name).toBe('');
    expect(errors['name']).toBeUndefined();
  });

  it('validate returns false and populates errors when a rule fails', () => {
    const { validate, errors } = useForm({
      initialValues: { email: '' },
      rules: { email: [(v) => !!v || 'Required'] },
    });

    const result = validate();
    expect(result).toBe(false);
    expect(errors['email']).toBe('Required');
  });

  it('submit does not call handler when validation fails', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const { submit } = useForm({
      initialValues: { email: '' },
      rules: { email: [(v) => !!v || 'Required'] },
    });

    await submit(handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('submit calls handler and sets loading correctly on success', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const { submit, loading } = useForm({ initialValues: { name: 'Test' } });

    await submit(handler);

    expect(handler).toHaveBeenCalledOnce();
    expect(loading.value).toBe(false);
  });

  it('maps 422 response errors to per-field errors', async () => {
    const axiosError = {
      response: {
        status: 422,
        data: {
          message: 'Validation failed',
          errors: { email: ['Invalid email format'] },
        },
      },
    };
    const handler = vi.fn().mockRejectedValue(axiosError);
    const { submit, errors, serverError } = useForm({ initialValues: { email: 'bad' } });

    await submit(handler);

    expect(errors['email']).toBe('Invalid email format');
    expect(serverError.value).toBe('Validation failed');
  });

  it('setServerErrors directly maps ApiError to field errors', () => {
    const { errors, setServerErrors } = useForm({ initialValues: {} });
    setServerErrors({
      message: 'Server error',
      errors: { phone: ['Invalid phone number'] },
    });
    expect(errors['phone']).toBe('Invalid phone number');
  });

  it('formRules returns empty array when no rules configured for field', () => {
    const { formRules } = useForm({ initialValues: { name: '' } });
    expect(formRules('name')).toEqual([]);
  });

  it('calls onSuccess after successful submit', async () => {
    const onSuccess = vi.fn();
    const { submit } = useForm({
      initialValues: {},
      onSuccess,
    });

    await submit(async () => {});
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
