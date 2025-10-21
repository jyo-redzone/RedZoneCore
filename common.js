// avatar menu
const avatar = document.getElementById('avatar'), menu = document.getElementById('menu');
avatar.addEventListener('click', () => menu.classList.toggle('show'));
document.addEventListener('click', e => { if (!avatar.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('show') });

document.getElementById('profile').addEventListener('click', e => { e.preventDefault(); alert('Profile (demo)') });
document.getElementById('logout').addEventListener('click', e => { e.preventDefault(); alert('Logged out (demo)') });
