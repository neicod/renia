// @env: mixed
import React from 'react';
import { I18nProvider } from '../context/I18nProvider';
import type { Messages } from '../services/types';

type Props = {
  initialLang?: string;
  initialMessages?: Messages;
};

const I18nBootstrap: React.FC<Props> = ({ initialLang, initialMessages }) => {
  return (
    <I18nProvider lang={initialLang} messages={initialMessages}>
      {/* Provider jedynie rozprowadza kontekst, nic nie renderuje */}
      <></>
    </I18nProvider>
  );
};

export default I18nBootstrap;
