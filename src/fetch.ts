export const getRequestWithNativeFetch = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }

  return response.json();
};

export const postRequestWithNativeFetch = async (url, headers, payload) => {
  const response = await fetch(
    url,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }

  return response.json();
};
