import HttpAPI from "@/modules/HttpAPI";

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export async function auth(_reqBody: AuthRequest) {
  const response = await HttpAPI.post(`/v1/auth`, {
    body: JSON.stringify({
      username: _reqBody.username,
      password: _reqBody.password
    })
  })
  const result: AuthResponse = await response.json()
  return result
}
