// --- Onload Protection ---
window.addEventListener('beforeunload', function (e) {
    e.preventDefault(); 
    e.returnValue = 'You have unsaved work. Are you sure you want to leave?';
    return e.returnValue;
});

// --- Tab Cloaking ---
const originalTitle = "Student Dashboard - Learning Hub";
const hiddenTitle = "Google Classroom";
const visibleFavicon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%231a73e8' d='M12 3L1 9L4 10.5V17.5C4 18.88 6.5 20 12 20C17.5 20 20 18.88 20 17.5V10.5L23 9L12 3M12 5L17.5 7.5L12 10L6.5 7.5L12 5Z' /></svg>";
const hiddenFavicon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%234285F4' d='M12 3L1 9L4 10.5V17.5C4 18.88 6.5 20 12 20C17.5 20 20 18.88 20 17.5V10.5L23 9L12 3M12 5L17.5 7.5L12 10L6.5 7.5L12 5Z' /></svg>";

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = hiddenTitle;
        document.getElementById('favicon').href = hiddenFavicon;
    } else {
        document.title = originalTitle;
        document.getElementById('favicon').href = visibleFavicon;
    }
});

// --- Snow Effect ---
const canvas = document.getElementById("snowCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const snowflakes = [];
const maxSnowflakes = 100;

function createSnowflakes() {
    snowflakes.length = 0;
    for (let i = 0; i < maxSnowflakes; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            density: Math.random() * 4 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1.5 + 0.5
        });
    }
}
createSnowflakes();

function drawSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(169, 169, 169, 0.6)";
    ctx.beginPath();
    
    for (let i = 0; i < snowflakes.length; i++) {
        let sf = snowflakes[i];
        ctx.moveTo(sf.x, sf.y);
        ctx.arc(sf.x, sf.y, sf.radius, 0, Math.PI * 2);

        sf.y += sf.speedY;
        sf.x += sf.speedX;

        if (sf.y > canvas.height) {
            sf.y = -5;
            sf.x = Math.random() * canvas.width;
        }
        if (sf.x > canvas.width) sf.x = 0;
        if (sf.x < 0) sf.x = canvas.width;
    }
    ctx.fill();
    requestAnimationFrame(drawSnow);
}
drawSnow();

// --- Tab Switching ---
function showTab(tabId, element) {
    document.querySelectorAll('.card').forEach(card => card.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active-tab'));
    if(element) element.classList.add('active-tab');
}
document.getElementById('tab-modules').classList.add('active-tab');

// --- Viewer Logic ---
function openViewer(event) {
    if(event) event.preventDefault(); 
    let url = document.getElementById('viewer-url').value.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    const encodedUrl = encodeURIComponent(url);
    const viewerPath = `/viewer/${encodedUrl}`;
    
    const viewerFrame = document.getElementById('viewerFrame');
    viewerFrame.src = viewerPath;
    viewerFrame.style.display = 'block';
}

// --- Module Loader ---
function loadModule(url) {
    const moduleFrame = document.getElementById('moduleFrame');
    moduleFrame.src = url;
    moduleFrame.style.display = 'block';
}

// --- Theme Toggle ---
function changeTheme() {
    const theme = document.getElementById('theme-select').value;
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg', '#121212');
        document.documentElement.style.setProperty('--txt', '#ffffff');
        document.documentElement.style.setProperty('--card', 'rgba(30, 30, 30, 0.85)');
        document.documentElement.style.setProperty('--accent', '#00ffcc');
        document.documentElement.style.setProperty('--accent-hover', '#00e6b8');
        document.documentElement.style.setProperty('--border', 'rgba(255, 255, 255, 0.1)');
        canvas.style.background = 'linear-gradient(to bottom, #0a0a0f, #121212)';
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    } else {
        document.documentElement.style.setProperty('--bg', '#f0f2f5');
        document.documentElement.style.setProperty('--txt', '#1a1a1a');
        document.documentElement.style.setProperty('--card', 'rgba(255, 255, 255, 0.95)');
        document.documentElement.style.setProperty('--accent', '#1a73e8');
        document.documentElement.style.setProperty('--accent-hover', '#1557b0');
        document.documentElement.style.setProperty('--border', 'rgba(0, 0, 0, 0.1)');
        canvas.style.background = 'linear-gradient(to bottom, #e6e9f0, #f0f2f5)';
        ctx.fillStyle = "rgba(169, 169, 169, 0.6)";
    }
}
