


export async function isAuthenticated() {
  const payload = {
    token: localStorage.getItem('jwtToken'),
  };
  // Make POST request
  const response = await fetch('http://localhost:3000/JWTAuthLevel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const { authlevel } = await response.json(); // Decode the json
  
  return authlevel;

  
}
