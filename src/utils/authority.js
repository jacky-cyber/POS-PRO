// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  // return localStorage.getItem('pos-authority') || 'admin';
  return localStorage.getItem('pos-authority') || 'guest';
}

export function setAuthority(authority) {
  return localStorage.setItem('pos-authority', authority);
}
