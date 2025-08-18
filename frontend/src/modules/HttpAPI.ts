import { BACKEND_URL } from "@/configs/envs";
import BaseHttp from "@/libs/BaseHttp";

const HttpAPI = new BaseHttp({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default HttpAPI;
