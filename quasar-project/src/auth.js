
//NOTE: temp for dbg
const dbg = 1;

export async function isAuthenticated() {
  if (dbg === 1) return 15;
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
