// Useful functions
function generateGradient(steps) {
    const gradient = [];
    const color1 = tinycolor('#0C82d0').toRgb();
    const color2 = tinycolor('#8d5ee3').toRgb();
    const color1Components = [color1.r, color1.g, color1.b];
    const color2Components = [color2.r, color2.g, color2.b];

    for (let step = 0; step <= steps; step++) {
        const color = color1Components.map((start, i) => {
            return Math.round(start + (step / steps) * (color2Components[i] - start));
        });
        gradient.push('rgb(' + color.join(',') + ')');
    }

    return gradient;
}

let gradient = generateGradient(100);
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890$£&#@!%?';

function getRandomColor() {
    return gradient[Math.floor(Math.random() * gradient.length)];
}

function getRandomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
}


// Initializing the animation
const oneEm = parseFloat(getComputedStyle(document.body).fontSize);
const margin = oneEm;
const footer = document.querySelector('footer');
const container = document.body;
const slidemodes = ["fixed", "page"];
const slidemode = slidemodes[0];
let minSpeed = 30;
let maxSpeed = 300;
let columnDelay = 80;
let opacityFactor = 1.25;

let lastCallTime = 0;
let maxslidedistance = 0;
let slidedistance = 0;
let maxtop = container.clientHeight - footer.clientHeight - margin;
if (slidemode == "fixed") {
    maxslidedistance = Math.min(maxtop, 2000); // modifiable
} else if (slidemode == "page") {
    maxslidedistance = maxtop;
}
let maxcolumnLength = Math.floor(maxslidedistance / 19);


// Main animation loop
let isAnimationActive = false;

const matrixContainer = document.createElement('div');
matrixContainer.style.position = 'absolute';
matrixContainer.style.width = '100%';
matrixContainer.style.height = '100%';
matrixContainer.style.zIndex = '-1';
matrixContainer.style.pointerEvents = 'none';
matrixContainer.style.userSelect = 'none';
matrixContainer.style.overflow = 'none';
matrixContainer.style.top = '0';
matrixContainer.style.left = '0';
container.appendChild(matrixContainer);


// Single column animation
function generateColumn() {
    let now = Date.now();
    if (!isAnimationActive || (now - lastCallTime < columnDelay)) {
        requestAnimationFrame(generateColumn);
        return;
    }
    lastCallTime = now;

    const columnLength = Math.min(Math.floor(Math.random() * 60) + 10, maxcolumnLength);
    const left = Math.random() * (window.innerWidth - 2 * margin) + margin;    
    const color = getRandomColor();
    const opacity = (Math.random()*0.7 + 0.05) * opacityFactor;
    const delay = Math.random() * 0.5;
    let top = Math.random() * (maxtop - columnLength * 19);

    if (slidemode == "fixed") {
        let normalslidedist = Math.min(maxslidedistance, maxtop - top - margin) - columnLength * 19;
        slidedistance = normalslidedist;
    } else if (slidemode == "page") {
        slidedistance = maxtop - columnLength * 19 - top;
    }

    // speed is in pixels per second
    const speed = (Math.random() * (maxSpeed - minSpeed) + minSpeed);
    const duration = slidedistance / speed;

    // Create a div to contain the column
    const column = document.createElement('div');
    column.style.position = 'absolute';
    column.style.left = left + 'px';
    column.style.top = top + 'px';
    column.style.animation = `rain ${duration}s linear ${delay}s `;
    column.style.setProperty('--rain-height', `${slidedistance}px`);
    column.setAttribute('slidedistance', slidedistance);
    column.setAttribute('columnLength', columnLength);

    let columnHTML = `<span style="color: ${color}; opacity: ${opacity}; position: absolute;">`;
    for (let i = 0; i < columnLength - 1; i++) {
        columnHTML += getRandomChar() + '<br>';
    }
    column.innerHTML = columnHTML + getRandomChar() + '</span>';
    column.style.position = 'absolute';
    column.style.color = color;
    column.style.opacity = opacity;

    // Append the column div to the container
    matrixContainer.appendChild(column);
    let timeoutId = setTimeout(() => matrixContainer.removeChild(column), duration * 1000);
    column.setAttribute('timeoutId', timeoutId);

    now = Date.now();
    setTimeout(() => requestAnimationFrame(generateColumn), columnDelay - (now - lastCallTime));
}


// Actualize the columns when the page changes after a button click
function removeColumnsPastLimits() {
    // necessarily called after updateParams() !!
    const columns = matrixContainer.getElementsByTagName('div');
    let remove_indices = new Set();
    let columnsArray = Array.from(columns);

    for (let i = 0; i < columnsArray.length; i++) {
        let slidedistance = Number(columnsArray[i].getAttribute('slidedistance'));
        let top = Number(columnsArray[i].style.top.replace('px', ''));
        let right = Number(columnsArray[i].style.left.replace('px', '')) + oneEm;
        let columnHeight = columnsArray[i].getAttribute('columnLength') * (oneEm + 2);

        if (slidedistance + top + columnHeight > maxtop || right > window.innerWidth) {
            remove_indices.add(i);
        }
    }
    remove_indices.forEach(i => {
        clearTimeout(Number(columnsArray[i].getAttribute('timeoutId')));
        columnsArray[i].remove();
    });
}

function updateParams() {
    maxtop = container.clientHeight - footer.clientHeight - margin;
    if (slidemode == "fixed") {
        maxslidedistance = Math.min(maxtop, 2000); // modifiable
    } else if (slidemode == "page") {
        maxslidedistance = maxtop;
    }
    maxcolumnLength = Math.floor(maxslidedistance / 19);
};


// Event listeners
document.getElementById('videoButton').addEventListener('click', function() {
    var videoContainer = document.querySelector('.video-container');
    if (videoContainer.style.display === 'none' || videoContainer.style.display === '') {
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
    }
    updateParams();
    removeColumnsPastLimits();
});

document.getElementById('moreButton').addEventListener('click', function() {
    var interests = document.querySelector('#interests');
    if (interests.style.display === 'none' || interests.style.display === '') {
        interests.style.display = 'block';
    } else {
        interests.style.display = 'none';
    }
    updateParams();
    removeColumnsPastLimits();
});


const matrixButton = document.getElementById('matrixButton');
const matrixMenu = document.getElementById('matrixMenu');

document.getElementById('matrixButton').addEventListener('click', () => {
    isAnimationActive = !isAnimationActive;
    if (isAnimationActive) {
        matrixButton.classList.add('matrixButtonActive');
        requestAnimationFrame(generateColumn);
    }
    else {
        matrixButton.classList.remove('matrixButtonActive');
    }
});


let timeoutId;
let displaydelay = 200;
matrixButton.addEventListener('mouseover', () => {
    clearTimeout(timeoutId);
    matrixMenu.style.display = 'block';
});
matrixButton.addEventListener('mouseleave', () => {
    timeoutId = setTimeout(() => {
        matrixMenu.style.display = 'none';
    }, displaydelay);
});
matrixMenu.addEventListener('mouseover', () => {
    clearTimeout(timeoutId);
    matrixMenu.style.display = 'block';
});
matrixMenu.addEventListener('mouseleave', () => {
    timeoutId = setTimeout(() => {
        matrixMenu.style.display = 'none';
    }, displaydelay);
});

const inputs = document.querySelectorAll('#matrixMenu input');
let variables = {};
inputs.forEach(input => {
    input.addEventListener('input', () => {
        variables[input.id] = input.value;
    });
});

document.addEventListener('input', () => {
    minSpeed = Number(variables.minSpeed);
    maxSpeed = Number(variables.maxSpeed);
    columnDelay = Number(variables.columnDelay);
    opacityFactor = Number(variables.opacityFactor);
    updateParams();
    removeColumnsPastLimits();
});

function resetInputs() {
    variables.minSpeed = 30;
    variables.maxSpeed = 300;
    variables.columnDelay = 80;
    variables.opacityFactor = 1.25;
    inputs.forEach(input => {
        input.value = variables[input.id];
    });
}
resetInputs();

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetInputs);


// Menu button
var menuBtn = document.querySelector('.menu-btn');
var menu = document.querySelector('ul');
var nav = document.querySelector('nav');
var menuName = document.querySelector('.menu-name');

menuName.addEventListener('mouseover', () => {
    clearTimeout(menuTimeoutId);
});
menuName.addEventListener('mouseleave', () => {
    menuTimeoutId = setTimeout(() => {
        nav.classList.remove('active');
    }, displaydelay);
});

/* Exactly the same as with the matrix button */
let menuTimeoutId;

menuBtn.addEventListener('mouseover', () => {
    clearTimeout(menuTimeoutId);
    nav.classList.add('active');
});
menuBtn.addEventListener('mouseleave', () => {
    menuTimeoutId = setTimeout(() => {
        nav.classList.remove('active');
    }, displaydelay);
});
menu.addEventListener('mouseover', () => {
    clearTimeout(menuTimeoutId);
    nav.classList.add('active');
});
menu.addEventListener('mouseleave', () => {
    menuTimeoutId = setTimeout(() => {
        nav.classList.remove('active');
    }, displaydelay);
});

// Automatic sizing
function setMenuWidth() {
    var nameWidth = document.querySelector('.menu-name').offsetWidth;
    var buttonWidth = document.querySelector('.menu-btn').offsetWidth;
    var navUl = document.querySelector('nav ul');
    var buttonPadding = oneEm;
    navUl.style.width = (nameWidth + buttonWidth - buttonPadding) + 'px';
}

function updateLayout() {
    updateParams();
    removeColumnsPastLimits();
    setMenuWidth();
}

window.addEventListener('DOMContentLoaded', setMenuWidth);
// the following checks for resize but also orientation change
window.addEventListener('resize', function() {
    setTimeout(updateLayout, 200); // wait for the resize to be effective
});


// href corrections
document.querySelectorAll('li[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const menuBarHeight = document.querySelector('.header').offsetHeight;
        const target = document.querySelector(this.getAttribute('href'));
        const targetPosition = target.offsetTop - menuBarHeight - oneEm;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});