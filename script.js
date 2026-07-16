// ========================================
// HANUMAN JYOTISH - MAIN JAVASCRIPT FILE
// ======================================== 

// ========================================
// VARIABLES & STATE
// ========================================

let isSpinning = false;
let currentCategory = 'gaman';
let selectedIndex = 0;
let wheelRotation = 0;

// Get URL parameter for category
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('category')) {
    currentCategory = urlParams.get('category');
}

if (!predictionData[currentCategory]) {
    currentCategory = 'gaman';
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize wheel page if present
    if (document.getElementById('wheelCanvas')) {
        initWheel();
        setupEventListeners();

        // Set default category if one is passed in URL
        if (urlParams.has('category')) {
            selectCategory(currentCategory, true);
        } else {
            selectCategory('gaman', true);
        }
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// ========================================
// WHEEL CANVAS DRAWING
// ========================================

function initWheel() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    drawWheel(ctx, centerX, centerY, radius);
}

function drawWheel(ctx, centerX, centerY, radius) {
    const data = predictionData[currentCategory];

    if (!data) {
        console.error("Category not found:", currentCategory);
        return;
    }
    const names = data.names;
    const numSegments = names.length;
    const segmentAngle = (2 * Math.PI) / numSegments;

    // Colors for segments
    const colors = [
        '#2563EB', '#F97316', '#DC2626', '#16A34A',
        '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#E11D48', '#10B981'
    ];

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Apply rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(wheelRotation);
    ctx.translate(-centerX, -centerY);

    // Draw segments
    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw text
        const textAngle = startAngle + segmentAngle / 2;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.65);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.65);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(names[i], 0, 0);
        ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#2563EB';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Spin button
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.addEventListener('click', spinWheel);
    }

    // Category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;
            selectCategory(category, true);
        });
    });

    // Spin again button
    const spinAgainBtn = document.getElementById('spinAgainBtn');
    if (spinAgainBtn) {
        spinAgainBtn.addEventListener('click', function () {
            document.getElementById('resultSection').classList.add('hidden');
            spinBtn.disabled = false;
        });
    }

    // Share result button
    const shareResultBtn = document.getElementById('shareResultBtn');
    if (shareResultBtn) {
        shareResultBtn.addEventListener('click', shareResult);
    }
}

// ========================================
// CATEGORY SELECTION
// ========================================

function selectCategory(category, redraw = true) {
    currentCategory = category;

    // Update active button
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    // Update category info
    const data = predictionData[category];

    if (!data) {
        console.error("Category not found:", category);
        return;
    }
    const categoryInfo = document.getElementById('categoryInfo');
    if (categoryInfo) {
        categoryInfo.innerHTML = `
            <div class="text-6xl mb-4">
                <i class="fas ${data.icon} text-blue-600"></i>
            </div>
            <p class="text-xl font-bold text-gray-900">${data.category_name}</p>
            <p class="text-gray-600 mt-2">${data.names.length} possible predictions</p>
        `;
    }

    // Reset wheel
    wheelRotation = 0;
    isSpinning = false;

    if (redraw) {
        initWheel();
    }

    // Hide result section
    const resultSection = document.getElementById('resultSection');
    if (resultSection) {
        resultSection.classList.add('hidden');
    }

    // Re-enable spin button
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.disabled = false;
    }
}

// ========================================
// SPIN WHEEL LOGIC
// ========================================

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;

    const data = predictionData[currentCategory];
    const numSegments = data.names.length;
    const segmentAngle = 360 / numSegments;

    // Random selection
    selectedIndex = Math.floor(Math.random() * numSegments);

    // Calculate final rotation
    // Spin at least 5 full rotations plus the segment
    const spins = 5;
    const extraRotation = 360 - (selectedIndex * segmentAngle) - (segmentAngle / 2);
    const finalRotation = (spins * 360) + extraRotation;

    // Animate the spin
    animateSpin(finalRotation, 0, 4000); // 4 seconds spin
}

function animateSpin(targetRotation, currentRotation, duration) {
    const startTime = Date.now();
    const startRotation = wheelRotation;

    function animate() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        wheelRotation = startRotation + (targetRotation * easeProgress);

        // Redraw the wheel
        const canvas = document.getElementById('wheelCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 20;
            drawWheel(ctx, centerX, centerY, radius);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spin complete
            isSpinning = false;
            showResult();
        }
    }

    animate();
}

// ========================================
// SHOW RESULT
// ========================================

function showResult() {
    const data = predictionData[currentCategory];
    const selectedName = data.names[selectedIndex];
const prediction = data.predictions[selectedName];

if (!prediction) {
    alert("Prediction not found for : " + selectedName);
    console.error(selectedName);
    return;
}
    // Determine result type
    let resultType = 'neutral';
    if (prediction.sentiment === 'good') {
        resultType = 'good';
    } else if (prediction.sentiment === 'bad') {
        resultType = 'bad';
    }

    // Update result section
    const resultSection = document.getElementById('resultSection');
    resultSection.classList.remove('hidden', 'good', 'bad', 'neutral');
    resultSection.classList.add(resultType);

    // Update content
    document.getElementById('selectedName').textContent = selectedName;
    document.getElementById('predictionText').textContent = prediction.text;

    // Update result visual
    document.getElementById('resultIcon').innerHTML = `<i class="fas ${prediction.icon}"></i>`;
    document.getElementById('resultMessage').textContent = prediction.result;

    // Update details
    const detailsHtml = `
        <div class="text-center p-4 bg-gray-100 rounded-lg">
            <div class="text-sm text-gray-600">Category</div>
            <div class="text-lg font-bold text-gray-900">${data.category_name}</div>
        </div>
        <div class="text-center p-4 bg-gray-100 rounded-lg">
            <div class="text-sm text-gray-600">Selected</div>
            <div class="text-lg font-bold text-gray-900">${selectedName}</div>
        </div>
    `;
    document.getElementById('predictionDetails').innerHTML = detailsHtml;

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// SHARE FUNCTIONALITY
// ========================================

function shareResult() {
    const data = predictionData[currentCategory];
    const selectedName = data.names[selectedIndex];
    const prediction = data.predictions[selectedName];

    const text = `🔮 I just got a prediction from Hanuman Jyotish!\n\n📍 Category: ${data.category_name}\n💫 Selected: ${selectedName}\n✨ Result: ${prediction.result}\n\nTry it yourself: [Your Website URL]`;

    // Try to use Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'Hanuman Jyotish Prediction',
            text: text,
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Prediction copied to clipboard! Share it with your friends.');
        }).catch(err => {
            alert('Share this prediction with your friends:\n\n' + text);
        });
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get random number between min and max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format text for display
function formatText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// RESPONSIVE ADJUSTMENTS
// ========================================

window.addEventListener('resize', function () {
    if (document.getElementById('wheelCanvas')) {
        initWheel();
    }
});

// ========================================
// KEYBOARD NAVIGATION
// ========================================

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn && !spinBtn.disabled && !isSpinning) {
            spinWheel();
        }
    }
});
