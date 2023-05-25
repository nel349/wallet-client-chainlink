import axios from 'axios';

interface GetAbiResponse {
  status: string;
  message: string;
  result: string;
}

export class EtherscanApi {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAbi(contractAddress: string): Promise<string> {
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${this.apiKey}`;
    const response = await axios.get<GetAbiResponse>(url);
    if (response.data.status !== '1') {
      throw new Error(`Failed to retrieve ABI: ${response.data.message}`);
    }
    return response.data.result;
  }
}