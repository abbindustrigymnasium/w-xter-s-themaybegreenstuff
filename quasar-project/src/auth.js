


export async function isAuthenticated() {
  const payload = {
    token: localStorage.getItem('jwtToken'),
  };

  console.log("payload: ", payload.jwt);
  // Make POST request
  const response = await fetch('http://localhost:3000/JWTAuthLevel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  console.log(response);

  if(typeof response.authlevel === "number") {
    return 1;
  } else {
    return 0;
  }
  
}
