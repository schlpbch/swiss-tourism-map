import type enTranslations from './en.json';

type FlattenKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? FlattenKeys<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type I18nKey = FlattenKeys<typeof enTranslations>;
