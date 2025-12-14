// @env: mixed
// Ensure services are loaded on module initialization
// The augmenter and mapper register themselves on module load
import '../services/configurableQueryAugmenter';
import '../services/configurableMapper';

export default function defaultInterceptor() {
  // Services are already registered via imports above
}
