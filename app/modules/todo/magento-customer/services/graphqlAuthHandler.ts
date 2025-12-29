// @env: mixed
import { registerGraphQLAuthErrorHandler } from '@renia/framework/api/graphqlClient';
import { customerManager } from './customerManager';

let handling = false;

registerGraphQLAuthErrorHandler(() => {
  if (handling) return;
  handling = true;
  try {
    customerManager.logout();
  } finally {
    // niewielkie opóźnienie aby uniknąć wielu wywołań podczas burzy błędów
    setTimeout(() => {
      handling = false;
    }, 0);
  }
});
