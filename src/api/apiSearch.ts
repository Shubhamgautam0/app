import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/server/api/discover/search/objects';

export const searchObjects = async (query: string,queryParams:string) => {
  let apiUrl = `${API_BASE_URL}?${queryParams}`;

  if (query.trim()) {
    apiUrl += `&embed=item&configuration=default&query=${encodeURIComponent(query)}`;
  }

  try {
    const response = await axios.get(apiUrl);
    return response.data._embedded.searchResult._embedded.objects;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};


