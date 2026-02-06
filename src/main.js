import './style.css';
import gsap from 'gsap';
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

// --- GALLERY DATA CONFIGURATION ---
const portraitImages = [
    { title: "SOLACE", src: "/art1.jpg" },
    { title: "ROMA", src: "/art2.jpg" },
    { title: "THE ROAD AHEAD", src: "/art3.jpg" },
    { title: "THE ACADEMY", src: "/art4.jpg" },
    { title: "GEOMETRY", src: "/art5.jpg" }
];

const architectureImages = [
    { title: "CONCRETE", src: "/art5.jpg" },
    { title: "STRUCTURE", src: "/art4.jpg" },
    { title: "LINES", src: "/art1.jpg" },
    { title: "SHADOW", src: "/art3.jpg" },
    { title: "FORM", src: "/art2.jpg" }
];

// Renamed from Nature to Product
const productImages = [
    { title: "MIST", src: "/art2.jpg" },
    { title: "LEAVES", src: "/art1.jpg" },
    { title: "FOREST", src: "/art4.jpg" },
    { title: "WAVES", src: "/art5.jpg" },
    { title: "SUNSET", src: "/art3.jpg" }
];

const artisticImages = [
    { title: "NOISE", src: "/art3.jpg" },
    { title: "GRAIN", src: "/art5.jpg" },
    { title: "BLUR", src: "/art2.jpg" },
    { title: "DISTORT", src: "/art1.jpg" },
    { title: "ECHO", src: "/art4.jpg" }
];

// --- PRICING DATA CONFIGURATION ---
const pricingConfigs = [
    // 0: Portraits
    {
        type: 'cards',
        items: [
            { title: 'BASIC', features: ['1 HOUR SHOOT', '10 EDITED PHOTOS', 'ONLINE GALLERY'], price: '3000 CZK', accent: false },
            { title: 'STANDARD', features: ['2 HOUR SHOOT', '20 EDITED PHOTOS', '1 SMALL PRINT'], price: '5500 CZK', accent: true },
            { title: 'PREMIUM', features: ['4 HOUR SHOOT', '3 LARGE PRINTS', 'PHOTO ALBUM'], price: '9000 CZK', accent: false }
        ]
    },
    // 1: Architecture
    {
        type: 'cards',
        items: [
            { title: 'INTERIOR', features: ['1 LOCATION', '10 WIDE ANGLES', 'HDR PROCESSING'], price: '4500 CZK', accent: false },
            { title: 'COMPLEX', features: ['INTERIOR & EXTERIOR', '25 EDITED PHOTOS', 'DRONE SHOTS'], price: '8000 CZK', accent: true },
            { title: 'COMMERCIAL', features: ['FULL DAY', 'UNLIMITED PHOTOS', 'LICENSING'], price: '15000 CZK', accent: false }
        ]
    },
    // 2: Product
    {
        type: 'cards',
        items: [
            { title: 'PACKSHOT', features: ['WHITE BACKGROUND', '5 PRODUCTS', 'HIGH RES'], price: '2500 CZK', accent: false },
            { title: 'EDITORIAL', features: ['STYLED SCENES', '10 PRODUCTS', 'SOCIAL MEDIA KIT'], price: '6500 CZK', accent: true },
            { title: 'CAMPAIGN', features: ['FULL BRAND IDENTITY', 'ART DIRECTION', 'MODELS INCLUDED'], price: '12000 CZK', accent: false }
        ]
    },
    // 3: Artistic (Text Only)
    {
        type: 'text',
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    }
];

const floorData = [
  { id: "portrait", label: "PORTRAITS", items: portraitImages },
  { id: "arch", label: "ARCHITECTURE", items: architectureImages },
  { id: "product", label: "PRODUCT", items: productImages }, // Updated Label
  { id: "artistic", label: "ARTISTIC", items: artisticImages }
];

// --- STATE MANAGEMENT ---
let currentFloorItems = [];
let activeControllers = [];
let currentFloorIndex = 0;
let isPricingOpen = false;

// Scroll State
let scrollX = 0;
let targetX = 0;
let singleSetWidth = 0;
let isDragging = false;
let touchStartX = 0;
let touchLastX = 0;
let maxScroll = 0;

// DOM Elements
const galleryTrack = document.getElementById('gallery-track');
const globalDimmer = document.getElementById('global-dimmer');
const mainHeader = document.getElementById('main-header');
const floorDisplay = document.getElementById('floor-display');
const elevatorBtns = document.querySelectorAll('.elevator-btn');
const pricingLink = document.getElementById('pricing-link');
const pricingPanel = document.querySelector('.pricing-glass-panel');
const pricingContentArea = document.getElementById('pricing-content-area');
const headerContent = document.querySelector('.header-content');

// --- SVG ASSETS ---
const beamSVG = `
<svg viewBox="0 0 350 600" preserveAspectRatio="none" style="width:100%; height:100%;">
    <defs>
        <linearGradient id="beam-item-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255, 250, 240, 0.7)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
        </linearGradient>
        <filter id="beam-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
        </filter>
    </defs>
    <path class="beam-path" d="M 0 0 L 350 0 L 350 600 L 0 600 Z" fill="url(#beam-item-grad)" filter="url(#beam-blur)" />
</svg>`;

const hardwareSVG = `
<svg class="light-fixture-svg" viewBox="0 0 350 20" preserveAspectRatio="xMidYMin slice" style="width: 350px; height: 20px;">
    <rect x="165" y="0" width="20" height="8" rx="1" class="brass-rect" />
    <rect x="2" y="6" width="346" height="4" class="brass-rect" />
    <rect x="2" y="5" width="6" height="6" rx="1" class="brass-rect" />
    <rect x="342" y="5" width="6" height="6" rx="1" class="brass-rect" />
    <rect x="4" y="10" width="342" height="3" class="bulb-rect" />
</svg>`;

// --- CLASS CONTROLLER ---
class GalleryItemController {
    constructor(data, container, index) {
        this.data = data;
        this.index = index;
        this.container = container;
        this.element = this.createDOM();
        this.container.appendChild(this.element);
        
        // References
        this.beamContainer = this.element.querySelector('.beam-container');
        this.lightFixture = this.element.querySelector('.gallery-light-fixture');
        this.colorLayer = this.element.querySelector('.color-layer');
        this.bwLayer = this.element.querySelector('.bw-layer');
        this.canvas = this.element.querySelector('.gallery-canvas');
        this.title = this.element.querySelector('.art-title');
        
        this.hoverLift = 0; 
        
        this.timeline = null;
        this.buildTimeline(); 
        this.initEvents();
    }

    createDOM() {
        const item = document.createElement('div');
        item.classList.add('gallery-item');
        item.innerHTML = `
            <div class="gallery-light-fixture">
                 <div class="brass-hardware-container">${hardwareSVG}</div>
                 <div class="beam-container" style="clip-path: inset(0 0 100% 0);">
                    ${beamSVG}
                 </div>
            </div>
            <div class="gallery-canvas">
                <img src="${this.data.src}" class="canvas-image bw-layer" loading="lazy">
                <img src="${this.data.src}" class="canvas-image color-layer" loading="lazy">
            </div>
            <div class="art-title">${this.data.title}</div>
        `;
        return item;
    }

    buildTimeline() {
        this.timeline = gsap.timeline({ paused: true, defaults: { ease: "none", overwrite: false } }); 
        const speed = 1666; 
        const distToTop = 60; 
        const imageHeight = 240;
        const totalBeamDist = 500;
        const timeToHitTop = distToTop / speed; 
        const timeToFillImage = imageHeight / speed; 
        const totalTime = totalBeamDist / speed; 

        this.timeline.to(this.beamContainer, { clipPath: "inset(0 0 0% 0)", opacity: 1, duration: totalTime }, 0);
        this.timeline.to(this.colorLayer, { maskPosition: "0% 0%", webkitMaskPosition: "0% 0%", duration: timeToFillImage }, timeToHitTop); 
        this.timeline.to(this.bwLayer, { filter: "grayscale(100%) brightness(1.2)", duration: totalTime, ease: "power2.out" }, 0);
        this.timeline.to(this.title, { opacity: 1, duration: totalTime }, 0);
    }

    initEvents() {
        this.element.addEventListener('mouseenter', () => {
            this.playAnimation();
            gsap.to(this, { hoverLift: -8, duration: 0.3, ease: "power2.out" });
            gsap.to(this.canvas, { boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 15px 30px rgba(0,0,0,0.3)", duration: 0.3 });
        });

        this.element.addEventListener('mouseleave', () => {
            this.reverseAnimation();
            gsap.to(this, { hoverLift: 0, duration: 0.3, ease: "power2.out" });
            gsap.to(this.canvas, { boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.2)", duration: 0.3 });
        });

        this.canvas.addEventListener('click', () => {
            if(!isPricingOpen) openModal(this.index);
        });
    }

    playAnimation() { this.timeline.timeScale(1).play(); }
    reverseAnimation() { this.timeline.timeScale(1.5).reverse(); }
}

// --- GALLERY LOGIC ---

function loadFloor(floorIndex) {
    const data = floorData[floorIndex];
    if(!data) return;
    currentFloorIndex = floorIndex;

    gsap.to(galleryTrack, { opacity: 0, duration: 0.3, onComplete: () => {
        activeControllers.forEach(c => { if(c.timeline) c.timeline.kill(); });
        activeControllers = [];
        galleryTrack.innerHTML = '';
        scrollX = 0;
        targetX = 0;
        gsap.set(galleryTrack, { x: 0 });

        floorDisplay.innerText = data.label;
        currentFloorItems = [...data.items, ...data.items, ...data.items];

        currentFloorItems.forEach((art, index) => {
            const controller = new GalleryItemController(art, galleryTrack, index);
            activeControllers.push(controller);
        });

        updateLayoutMetrics();
        gsap.to(galleryTrack, { opacity: 1, duration: 0.5 });
    }});
}

function updateLayoutMetrics() {
    const currentItems = currentFloorItems;
    const count = currentItems.length; 
    const w = window.innerWidth;
    let itemWidth = 350;
    let gap = 300;
    if (w <= 768) { itemWidth = 260; gap = 50; } 
    else if (w <= 1024) { itemWidth = 300; gap = 200; }
    
    galleryTrack.style.gap = `${gap}px`;
    singleSetWidth = (itemWidth + gap) * (count / 3); 
}

// --- ANIMATION LOOP (THE ENGINE) ---

function animateScroll() {
    scrollX += (targetX - scrollX) * 0.1;
    
    // Infinite Loop Logic
    if (scrollX >= singleSetWidth) {
        scrollX -= singleSetWidth;
        targetX -= singleSetWidth;
    } else if (scrollX < 0) {
        scrollX += singleSetWidth;
        targetX += singleSetWidth;
    }

    gsap.set(galleryTrack, { x: -scrollX });
    updateTransformations();
    requestAnimationFrame(animateScroll);
}

function updateTransformations() {
    const w = window.innerWidth;
    const center = w / 2;
    const panelWidth = w <= 768 ? w * 0.95 : 900; 
    const halfPanel = panelWidth / 2;
    const ramp = 200; 

    activeControllers.forEach(controller => {
        let pricingY = 0;
        let pricingScale = 1;
        let lightCorrection = 0;

        if (isPricingOpen) {
            const rect = controller.element.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const distFromCenter = Math.abs(itemCenter - center);
            let progress = 0; 

            if (distFromCenter < halfPanel) {
                progress = 1;
            } else if (distFromCenter < halfPanel + ramp) {
                const rampPos = distFromCenter - halfPanel;
                progress = 1 - (rampPos / ramp);
            } else {
                progress = 0;
            }

            progress = Math.max(0, Math.min(1, progress));
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            if (progress > 0) {
                pricingY = -250 * eased; 
                pricingScale = 1 - (0.3 * eased);
                lightCorrection = -60 * eased; 
            }
        }

        const totalY = pricingY + controller.hoverLift;
        
        gsap.set(controller.canvas, { y: totalY, scale: pricingScale });
        gsap.set(controller.lightFixture, { y: totalY + lightCorrection, scale: pricingScale, opacity: 1 });
        gsap.set(controller.title, { y: totalY, opacity: isPricingOpen ? (pricingY !== 0 ? 0.7 : 0.3) : 0.5 });
    });
}

function resetGalleryPositions() {
    activeControllers.forEach(controller => {
        gsap.to(controller, { hoverLift: 0, duration: 0.5 });
    });
}

// --- EVENTS ---

window.addEventListener('resize', updateLayoutMetrics);
window.addEventListener('wheel', (e) => { 
    const factor = isPricingOpen ? 0.9 : 1.0;
    targetX += e.deltaY * factor; 
}, { passive: true });

document.addEventListener('touchstart', (e) => {
    isDragging = true;
    touchStartX = e.touches[0].clientX;
    touchLastX = touchStartX;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const delta = touchLastX - currentX; 
    touchLastX = currentX;
    const factor = isPricingOpen ? 1.5 : 2.0;
    targetX += delta * factor; 
}, { passive: true });

document.addEventListener('touchend', () => { isDragging = false; });

// Navigation Logic
elevatorBtns.forEach((btn) => {
    btn.addEventListener('click', function() {
        if(isPricingOpen) togglePricing(false); // Close pricing when changing floors
        elevatorBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const floorIndex = parseInt(this.getAttribute('data-floor'));
        loadFloor(floorIndex);
    });
});

// --- SEARCHLIGHT EFFECT ---
const navGallery = document.getElementById('nav-gallery');
const navAbout = document.getElementById('nav-about');
const footer = document.getElementById('main-footer');
let searchTl = null;

function runSearchlightSequence(startElement, targetType) {
    if (searchTl) searchTl.kill();
    if(isPricingOpen) togglePricing(false);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w <= 768;
    const targetSize = isMobile ? 150 : 250;
    const startRect = startElement.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    let destX, destY;
    if (targetType === 'footer') {
        const rect = footer.getBoundingClientRect();
        destX = rect.left + rect.width / 2;
        destY = rect.top + rect.height / 2;
    } else {
        const items = document.querySelectorAll('.gallery-item');
        const screenCenterX = w / 2;
        let closestItem = null;
        let closestDist = Infinity;

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const dist = Math.abs(centerX - screenCenterX);
            if (dist < closestDist) {
                closestDist = dist;
                closestItem = item;
            }
        });

        if (closestItem) {
            const canvasRect = closestItem.querySelector('.gallery-canvas').getBoundingClientRect();
            destX = canvasRect.left + canvasRect.width / 2;
            destY = canvasRect.top + canvasRect.height / 2;
        } else {
            destX = w / 2;
            destY = h * 0.55;
        }
    }

    const cp1x = w * 0.2 + Math.random() * w * 0.6;
    const cp1y = h * 0.2 + Math.random() * h * 0.6;

    gsap.to(mainHeader, { opacity: 0.05, duration: 0.8, overwrite: true });
    
    const proxy = { x: startX, y: startY, size: 60, opacity: 0.2 };
    
    searchTl = gsap.timeline({ 
        onUpdate: () => {
            globalDimmer.style.setProperty('--lx', `${proxy.x}px`);
            globalDimmer.style.setProperty('--ly', `${proxy.y}px`);
            globalDimmer.style.setProperty('--size', `${proxy.size}px`);
            globalDimmer.style.opacity = proxy.opacity;
        },
        onComplete: resetLighting
    });

    searchTl.to(proxy, {
        motionPath: { path: [{ x: cp1x, y: cp1y }, { x: destX, y: destY }], curviness: 1.2 },
        duration: 2.5, ease: "power2.inOut"
    })
    .to(proxy, { size: targetSize, opacity: 0.98, duration: 0.8 }, 0);
}

function resetLighting() {
    searchTl = null;
    gsap.to(globalDimmer, { opacity: 0, duration: 0.6 });
    gsap.to(mainHeader, { opacity: 1, duration: 0.5 });
}

navGallery.addEventListener('click', function(e) { e.preventDefault(); runSearchlightSequence(this, 'gallery'); });
navAbout.addEventListener('click', function(e) { e.preventDefault(); runSearchlightSequence(this, 'footer'); });

// --- PRICING LOGIC ---
const underline = document.createElement('div');
underline.className = 'pricing-underline';
pricingLink.appendChild(underline);

function generatePricingContent(floorIdx) {
    const config = pricingConfigs[floorIdx];
    pricingContentArea.innerHTML = ''; // Clear previous

    if (config.type === 'cards') {
        config.items.forEach(item => {
            const card = document.createElement('div');
            card.className = `pricing-card ${item.accent ? 'accent-card' : ''}`;
            
            // Add optional accent glow
            if (item.accent) {
                const glow = document.createElement('div');
                glow.className = 'card-glow';
                card.appendChild(glow);
            }

            const title = document.createElement('h3');
            title.innerText = item.title;
            
            const ul = document.createElement('ul');
            item.features.forEach(feat => {
                const li = document.createElement('li');
                li.innerText = feat;
                ul.appendChild(li);
            });

            const price = document.createElement('p');
            price.className = 'price';
            price.innerText = item.price;

            card.appendChild(title);
            card.appendChild(ul);
            card.appendChild(price);
            
            pricingContentArea.appendChild(card);
        });
    } else if (config.type === 'text') {
        const textContainer = document.createElement('div');
        textContainer.className = 'pricing-text-container';
        const p = document.createElement('p');
        p.innerText = config.content;
        textContainer.appendChild(p);
        pricingContentArea.appendChild(textContainer);
    }
}

function togglePricing(isOpen) {
    isPricingOpen = isOpen;
    const body = document.body;
    
    if (isOpen) {
        // Load the correct content for current floor before showing
        generatePricingContent(currentFloorIndex);
        
        body.classList.add('pricing-mode-active');
        pricingLink.classList.add('pricing-active');
        headerContent.classList.add('header-faded');
    } else {
        body.classList.remove('pricing-mode-active');
        pricingLink.classList.remove('pricing-active');
        headerContent.classList.remove('header-faded');
        resetGalleryPositions();
    }
}

pricingLink.addEventListener('click', (e) => {
    e.preventDefault();
    togglePricing(!isPricingOpen);
});

if(pricingPanel) {
    pricingPanel.addEventListener('click', () => {
        togglePricing(false);
    });
}

document.addEventListener('click', (e) => {
    if(isPricingOpen && e.clientY < window.innerHeight * 0.3 && !e.target.closest('.nav-link') && !e.target.closest('.pricing-glass-panel')) {
        togglePricing(false);
    }
});

// --- MODAL LOGIC ---
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const modalCaption = document.getElementById('modal-caption');
const closeBtn = document.querySelector('.close-modal');
const prevBtn = document.querySelector('.nav-prev');
const nextBtn = document.querySelector('.nav-next');
let currentModalIndex = 0;

function openModal(index) { 
    currentModalIndex = index;
    updateModalContent();
    modal.classList.add('active');
    gsap.fromTo(modalImg, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)" });
}

function updateModalContent() {
    const count = currentFloorItems.length;
    const safeIndex = (currentModalIndex + count) % count;
    const art = currentFloorItems[safeIndex];
    if(art) {
        modalImg.src = art.src;
        modalCaption.innerText = art.title;
    }
}

function nextImage() { currentModalIndex++; updateModalContent(); gsap.fromTo(modalImg, { opacity: 0.5 }, { opacity: 1, duration: 0.3 }); }
function prevImage() { currentModalIndex--; updateModalContent(); gsap.fromTo(modalImg, { opacity: 0.5 }, { opacity: 1, duration: 0.3 }); }

closeBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') modal.classList.remove('active');
});

// Initialization
loadFloor(0);
animateScroll();