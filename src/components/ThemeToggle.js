export function ThemeToggle() {
  const btn = document.createElement('button');
  btn.className = 'theme-toggle btn-icon';
  btn.type = 'button';
  btn.title = "Toggle Dark Mode";
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  const updateIcon = () => {
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = `<span class="material-symbols-outlined">${isDark ? 'light_mode' : 'dark_mode'}</span>`;
  };

  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateIcon();
  });

  updateIcon();
  return btn;
}
