import { useContext } from '../../../scripts/libs/preact-hook.js';
import { NavigationContext } from '../context/NavigationContext.js';

const useNavigation = () => {
  const context = useContext(NavigationContext);
  return context;
};

export default useNavigation;
