const header = document.querySelector("header");

const flags = document.getElementById("flags");

const textsToChange = document.querySelectorAll("[data-text]");

const changeLang = async (lang) => {
    try {
        const response = await fetch(`languages/${lang}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const texts = await response.json();
        console.log('Loaded texts:', texts);

        // Actualizar textos normales
        textsToChange.forEach(element => {
            const key = element.dataset.text;
            if (texts[key]) {
                element.textContent = texts[key];
            }
        });

        // Actualizar placeholders
        document.querySelectorAll('input[data-text], textarea[data-text]').forEach(element => {
            const key = element.dataset.text;
            if (texts[key]) {
                element.placeholder = texts[key];
            }
        });

    } catch (error) {
        console.error('Error loading language file:', error);
        alert('Error loading language settings. Please try again.');
    }
};

// Corregir el evento click para los botones de idioma
flags.addEventListener("click", (e) => {
    // Verificar si el click fue en una imagen o en el contenedor del idioma
    const flagItem = e.target.closest('.flags-item');
    if (flagItem) {
        const lang = flagItem.dataset.lang;
        console.log('Changing language to:', lang);
        changeLang(lang);
    }
});

window.addEventListener ("scroll", function() {
	header.classList.toggle ("sticky", window.scrollY >0);
});

let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
	menu.classList.toggle('bx-x');
	navbar.classList.toggle('active');
};

window.onscroll = () => {
	menu.classList.remove('bx-x');
	navbar.classList.remove('active');
};

const sr = ScrollReveal ({
	distance: '25px',
	duration: 2500,
	reset: true
})

sr.reveal('.home-text',{delay:190, origin:'bottom'})

sr.reveal('.about,.services,.portfolio,.contact',{delay:200, origin:'bottom'})

// Función para manejar el cambio de tema
function handleThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Verificar el tema actual
    const getCurrentTheme = () => document.documentElement.getAttribute('data-theme');
    
    // Cambiar el tema
    const toggleTheme = () => {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Actualizar el atributo data-theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Actualizar el icono
        themeIcon.className = newTheme === 'light' ? 'bx bx-moon' : 'bx bx-sun';
        
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', newTheme);
    };
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.className = savedTheme === 'light' ? 'bx bx-moon' : 'bx bx-sun';
    
    // Agregar evento click
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', handleThemeToggle);