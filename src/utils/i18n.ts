/**
 * Values interpolated in a translated label rendered as text by React (titles, names).
 *
 * The engine initialises i18next with its default interpolation, which HTML-encodes every value,
 * and React encodes the text again when it renders it: a title such as "L'équipe R&D" would read
 * "L&#39;équipe R&amp;D". React's encoding is the one kept, so values are interpolated as they are.
 * Never use these options for a label written as HTML.
 */
export const textValues = <T extends Record<string, unknown>>(values: T) => ({
  ...values,
  interpolation: { escapeValue: false },
});
