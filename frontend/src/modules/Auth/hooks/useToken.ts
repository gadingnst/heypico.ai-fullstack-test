import LocalStoragePersistor from "@/libs/SWRGlobalState/LocalStorage.persistor";
import { useStore } from "swr-global-state";

export const AUTH_TOKEN_KEY = 'app_auth_token';

function useAuthToken() {
  const [token, setToken] = useStore<string|null>({
    key: AUTH_TOKEN_KEY,
    initial: null,
    persistor: LocalStoragePersistor
  });

  return {
    token,
    setToken
  }
}

export default useAuthToken;
