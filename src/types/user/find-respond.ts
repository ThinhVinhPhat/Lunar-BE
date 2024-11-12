export interface findRespond {
  status?: number;
  Users: {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    images: string;
  }[];
  message?: string;
}
