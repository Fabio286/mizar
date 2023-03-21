import { createI18n } from 'vue-i18n';
import { enUS } from './en-US';
import { itIT } from './it-IT';

const messages = {
   'en-US': enUS,
   'it-IT': itIT
};

type NestedPartial<T> = {
   [K in keyof T]?: T[K] extends Array<infer R> ? Array<NestedPartial<R>> : (T[K] extends unknown ? unknown : NestedPartial<T[K]>)
};

export type MessageSchema = typeof enUS
export type AvailableLocale = keyof typeof messages

const i18n = createI18n<[NestedPartial<MessageSchema>], AvailableLocale>({
   fallbackLocale: 'en-US',
   allowComposition: true,
   messages
});

export { i18n };
