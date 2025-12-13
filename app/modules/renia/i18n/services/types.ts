export type Messages = Record<string, string>;

export type Translations = {
  lang: string;
  messages: Messages;
};

export type InterpolationParams = Record<string, string | number> | Array<string | number>;
