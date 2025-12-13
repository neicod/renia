// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import LayoutPage from './pages/LayoutPage';
import LayoutShell from './components/LayoutShell';

registerComponents({
  'renia-layout/pages/LayoutPage': LayoutPage,
  'renia-layout/components/LayoutShell': LayoutShell
});

export default {};
