

/// NOTE: This function requires further testing and validation
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
  console.log(authlevel);

  if(typeof authlevel !== 'number') { // secure the response is a number
    return -1;
  }

  return authlevel;
}
