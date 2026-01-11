export function ThemeToggle() {
  const container = document.createElement('div');
  container.className = 'theme-controls';
  container.style.display = 'flex';
  container.style.gap = '0.5rem';
  container.style.alignItems = 'center';
  container.style.position = 'absolute';
  container.style.top = '1rem';
  container.style.right = '1rem';
  container.style.zIndex = '100';

  // 1. Color Picker
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.title = 'Theme Color';
  colorInput.style.border = 'none';
  colorInput.style.width = '30px';
  colorInput.style.height = '30px';
  colorInput.style.cursor = 'pointer';
  colorInput.style.padding = '0';
  colorInput.style.background = 'transparent';
  
  const savedColor = localStorage.getItem('theme-color') || '#6200ea';
  colorInput.value = savedColor;
  document.documentElement.style.setProperty('--color-primary', savedColor);

  colorInput.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--color-primary', color);
    localStorage.setItem('theme-color', color);
  });
  
  container.appendChild(colorInput);

  // 2. Dark/Light Toggle
  const btn = document.createElement('button');
  btn.className = 'btn-icon';
  btn.title = "Toggle Dark Mode";
  
  // Logic: 'auto', 'light', 'dark'. Simplified: just light/dark toggle.
  // Default: check system.
  const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  let currentTheme = localStorage.getItem('theme') || getSystemTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);

  const updateIcon = () => {
    btn.innerHTML = `<span class="material-symbols-outlined">${currentTheme === 'dark' ? 'light_mode' : 'dark_mode'}</span>`;
  };

  btn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateIcon();
  });

  updateIcon();
  container.appendChild(btn);

  return container; 
}
