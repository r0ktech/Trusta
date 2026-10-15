import { useEffect, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { TagInput } from '../forms/TagInput';
import { CATEGORIES } from '../../data/categories';
import { STATES, citiesInState, getLocation } from '../../data/locations';
import { ARTISANS } from '../../data/artisans';
import { rules, EMAIL_PATTERN } from '../../utils/validation';
import { CONTACT_LABELS, cn } from '../../utils/format';

// Field groups shared by provider registration and profile editing so the
// two forms always validate the same way.

export const DETAILS_FIELDS = ['name', 'phone', 'email', 'state', 'city', 'serviceAreas', 'contactPreference'];
export const SERVICE_FIELDS = ['category', 'specialties', 'yearsOfExperience', 'bio', 'pricingType', 'startingPrice', 'priceUnit'];

export const PROVIDER_DEFAULTS = {
  name: '',
  phone: '',
  email: '',
  state: '',
  city: '',
  serviceAreas: [],
  contactPreference: 'in-app',
  category: '',
  specialties: [],
  yearsOfExperience: '',
  bio: '',
  pricingType: 'fixed',
  startingPrice: '',
  priceUnit: '',
};

export function DetailsFields({ register, control, errors, watch, setValue }) {
  const state = watch('state');
  const city = watch('city');
  const cities = state ? citiesInState(state) : [];
  const areaSuggestions = getLocation(city)?.areas ?? [];

  useEffect(() => {
    if (city && state && !citiesInState(state).includes(city)) setValue('city', '');
  }, [state, city, setValue]);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Full name" required error={errors.name?.message} className="sm:col-span-2">
        <Input autoComplete="name" placeholder="As customers should see it" {...register('name', { validate: (v) => v.trim().length >= 3 || 'Enter your full name' })} />
      </Field>
      <Field label="Phone number" required error={errors.phone?.message} hint="Kept private until you accept a booking (future feature).">
        <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" {...register('phone', rules.phone)} />
      </Field>
      <Field label="Email address" optional error={errors.email?.message}>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email', { validate: (v) => !v || EMAIL_PATTERN.test(v) || 'Enter a valid email address' })}
        />
      </Field>
      <Field label="State" required error={errors.state?.message}>
        <Select {...register('state', { required: 'Choose your state' })}>
          <option value="">Select state</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s === 'FCT' ? 'FCT (Abuja)' : s}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="City / town" required error={errors.city?.message}>
        <Select disabled={!state} {...register('city', { required: 'Choose your city or town' })}>
          <option value="">{state ? 'Select city' : 'Choose a state first'}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Communities you cover" required error={errors.serviceAreas?.message} className="sm:col-span-2" hint="Add the neighbourhoods where you accept jobs.">
        <Controller
          name="serviceAreas"
          control={control}
          rules={{ validate: (v) => v.length > 0 || 'Add at least one community' }}
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} suggestions={areaSuggestions} placeholder="e.g. Ifite, Amawbia" max={8} />
          )}
        />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-medium text-ink">
          Preferred contact method <span className="text-danger">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.entries(CONTACT_LABELS).map(([value, label]) => (
            <RadioCard key={value} value={value} label={label} checked={watch('contactPreference') === value} {...register('contactPreference', { required: true })} />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function ServiceFields({ register, control, errors, watch }) {
  const category = watch('category');
  const pricingType = watch('pricingType');
  const bio = watch('bio') ?? '';

  const skillSuggestions = useMemo(
    () => [...new Set(ARTISANS.filter((a) => a.category === category).flatMap((a) => a.specialties))],
    [category],
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Service category" required error={errors.category?.message}>
        <Select {...register('category', { required: 'Choose your main category' })}>
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Years of experience" required error={errors.yearsOfExperience?.message}>
        <Input
          type="number"
          inputMode="numeric"
          min="0"
          max="60"
          placeholder="e.g. 5"
          {...register('yearsOfExperience', {
            required: 'Enter your years of experience',
            validate: (v) => (Number(v) >= 0 && Number(v) <= 60 && Number.isInteger(Number(v))) || 'Enter a whole number between 0 and 60',
          })}
        />
      </Field>
      <Field label="Specific skills" required error={errors.specialties?.message} className="sm:col-span-2" hint="What jobs do you do best? Add up to 8.">
        <Controller
          name="specialties"
          control={control}
          rules={{ validate: (v) => v.length > 0 || 'Add at least one skill' }}
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} suggestions={skillSuggestions} placeholder="e.g. Inverter installation" max={8} />
          )}
        />
      </Field>
      <Field
        label="Describe your services"
        required
        error={errors.bio?.message}
        className="sm:col-span-2"
        hint={`${bio.trim().length}/50 minimum. How you work, what customers can expect, tools or materials you bring.`}
      >
        <Textarea rows={5} {...register('bio', rules.minText('A description', 50))} />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-medium text-ink">
          Pricing type <span className="text-danger">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            ['fixed', 'Fixed price', 'A set starting price'],
            ['hourly', 'Hourly rate', 'Charge per hour'],
            ['quote', 'Quote-based', 'Price after assessing the job'],
          ].map(([value, label, desc]) => (
            <RadioCard key={value} value={value} label={label} description={desc} checked={pricingType === value} {...register('pricingType')} />
          ))}
        </div>
      </fieldset>
      {pricingType !== 'quote' && (
        <>
          <Field label={pricingType === 'hourly' ? 'Hourly rate (₦)' : 'Starting price (₦)'} required error={errors.startingPrice?.message}>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              placeholder="e.g. 8000"
              {...register('startingPrice', {
                validate: (v, all) => all.pricingType === 'quote' || (Number(v) >= 500 && Number(v) <= 10_000_000) || 'Enter an amount of at least ₦500',
              })}
            />
          </Field>
          <Field label="Price applies to" optional hint="e.g. per visit, per room, per m²">
            <Input placeholder={pricingType === 'hourly' ? 'per hour' : 'e.g. inspection visit'} maxLength={40} {...register('priceUnit')} />
          </Field>
        </>
      )}
    </div>
  );
}

export function RadioCard({ label, description, checked, className, ...props }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-accent',
        checked ? 'border-accent bg-accent-soft' : 'border-line hover:border-subtle/50',
        className,
      )}
    >
      <input type="radio" className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary))]" {...props} />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}

// Normalises form values into the stored profile shape.
export function toProfile(values) {
  return {
    ...values,
    name: values.name.trim(),
    phone: values.phone.replace(/[\s-()]/g, ''),
    email: values.email.trim(),
    bio: values.bio.trim(),
    yearsOfExperience: Number(values.yearsOfExperience),
    startingPrice: values.pricingType === 'quote' ? null : Number(values.startingPrice),
    priceUnit: values.pricingType === 'quote' ? '' : values.priceUnit.trim() || (values.pricingType === 'hourly' ? 'per hour' : ''),
  };
}
