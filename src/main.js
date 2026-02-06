import './style.css';
import gsap from 'gsap';
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

// --- GALLERY CONTENT ARRAYS ---
const portraitImages = [
  { title: "SOLACE", src: "/art1.jpg" },
  { title: "ROMA", src: "/art2.jpg" },
  { title: "THE ROAD AHEAD", src: "/art3.jpg" },
  { title: "THE ACADEMY", src: "/art4.jpg" },
  { title: "GEOMETRY", src: "/art5.jpg" },
  { title: "GEOMETRY", src: "/art5.jpg" },
  { title: "GEOMETRY", src: "/art5.jpg" }
];

const architectureImages = [
  { title: "CONCRETE", src: "/art5.jpg" },
  { title: "STRUCTURE", src: "/art4.jpg" },
  { title: "LINES", src: "/art1.jpg" },
  { title: "SHADOW", src: "/art3.jpg" },
  { title: "FORM", src: "/art2.jpg" }
];

const natureImages = [
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

const floorData = [
  { id: "portrait", label: "PORTRAITS", items: portraitImages },
  { id: "arch", label: "ARCHITECTURE", items: architectureImages },
  { id: "nature", label: "NATURE", items: natureImages },
  { id: "artistic", label: "ARTISTIC", items: artisticImages }
];

let currentFloorItems = [];
let activeControllers = [];
let currentFloorIndex = 0;

const galleryTrack = document.getElementById('gallery-track');
const globalDimmer = document.getElementById('global-dimmer');
const mainHeader = document.getElementById('main-header');
const floorDisplay = document.getElementById('floor-display');
const elevatorBtns = document.querySelectorAll('.elevator-btn');
const pricingLink = document.getElementById('pricing-link');
const pricingSection = document.getElementById('pricing-section');

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

class GalleryItemController {
    constructor(data, container, index) {
        this.data = data;
        this.index = index;
        this.container = container;
        this.element = this.createDOM();
        this.container.appendChild(this.element);
        
        this.beamContainer = this.element.querySelector('.beam-container');
        this.colorLayer = this.element.querySelector('.color-layer');
        this.bwLayer = this.element.querySelector('.bw-layer');
        this.canvas = this.element.querySelector('.gallery-canvas');
        this.title = this.element.querySelector('.art-title');
        
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
        this.timeline = gsap.timeline({ paused: true, defaults: { ease: "none", overwrite: true } });
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
        this.timeline.to(this.canvas, { y: -8, boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 15px 30px rgba(0,0,0,0.3)", duration: totalTime, ease: "power2.out" }, 0);
        this.timeline.to(this.title, { opacity: 1, duration: totalTime }, 0);
    }

    initEvents() {
        this.element.addEventListener('mouseenter', () => this.playAnimation());
        this.element.addEventListener('mouseleave', () => this.reverseAnimation());
        this.canvas.addEventListener('click', () => openModal(this.index));
    }
    playAnimation() { this.timeline.timeScale(1).play(); }
    reverseAnimation() { this.timeline.timeScale(1.5).reverse(); }
}

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

let scrollX = 0;
let targetX = 0;
let singleSetWidth = 0;
let isDragging = false;
let touchStartX = 0;
let touchLastX = 0;

function updateLayoutMetrics() {
    const currentItems = floorData[currentFloorIndex].items;
    const count = currentItems.length; 
    const w = window.innerWidth;
    let itemWidth = 350;
    let gap = 300;
    if (w <= 768) { itemWidth = 260; gap = 50; } 
    else if (w <= 1024) { itemWidth = 300; gap = 200; }
    
    galleryTrack.style.gap = `${gap}px`;
    singleSetWidth = (itemWidth + gap) * count; 
}

window.addEventListener('resize', updateLayoutMetrics);
window.addEventListener('wheel', (e) => { targetX += e.deltaY; }, { passive: true });

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
    targetX += delta * 2.0; 
}, { passive: true });

document.addEventListener('touchend', () => { isDragging = false; });

function animateScroll() {
    scrollX += (targetX - scrollX) * 0.1;
    let wrappedX = gsap.utils.wrap(0, singleSetWidth, scrollX);
    gsap.set(galleryTrack, { x: -wrappedX });
    requestAnimationFrame(animateScroll);
}

loadFloor(0);
animateScroll();

elevatorBtns.forEach((btn) => {
    btn.addEventListener('click', function() {
        elevatorBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const floorIndex = parseInt(this.getAttribute('data-floor'));
        loadFloor(floorIndex);
    });
});

const navGallery = document.getElementById('nav-gallery');
const navAbout = document.getElementById('nav-about');
const footer = document.getElementById('main-footer');
let searchTl = null;

function moveDimmerHole(element, opacity, size) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    globalDimmer.style.setProperty('--lx', `${centerX}px`);
    globalDimmer.style.setProperty('--ly', `${centerY}px`);
    gsap.to(globalDimmer, { opacity: opacity, '--size': `${size}px`, duration: 0.4, ease: "power2.out", overwrite: true });
}

[navGallery, navAbout, pricingLink].forEach(link => {
    link.addEventListener('mouseenter', () => {
        if (searchTl || window.matchMedia("(pointer: coarse)").matches) return;
        moveDimmerHole(link, 0.2, 60);
        gsap.to(link, { color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.8)", duration: 0.3, overwrite: true });
    });
    link.addEventListener('mouseleave', () => {
        if (searchTl || window.matchMedia("(pointer: coarse)").matches) return;
        gsap.to(globalDimmer, { opacity: 0, '--size': '0px', duration: 0.4, overwrite: true });
        gsap.to(link, { color: "#222", textShadow: "0 2px 5px rgba(0,0,0,0.2)", duration: 0.4, overwrite: true });
    });
});

function runSearchlightSequence(startElement, targetType) {
    if (searchTl) searchTl.kill();
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
        let closestDist = Infinity;
        let winner = items[0];
        const screenCenterX = w / 2;
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            if (rect.right > 0 && rect.left < w) {
                const dist = Math.abs(screenCenterX - (rect.left + rect.width / 2));
                if (dist < closestDist) { closestDist = dist; winner = item; }
            }
        });
        const winRect = winner.querySelector('.gallery-canvas').getBoundingClientRect();
        destX = winRect.left + winRect.width / 2;
        destY = winRect.top + winRect.height / 2;
    }

    const topCorners = [{x: w*0.1, y: h*0.1}, {x: w*0.9, y: h*0.1}];
    const bottomCorners = [{x: w*0.1, y: h*0.9}, {x: w*0.9, y: h*0.9}];
    const corner1 = topCorners[Math.floor(Math.random() * 2)];
    const corner2 = bottomCorners[Math.floor(Math.random() * 2)];

    gsap.to(mainHeader, { opacity: 0.05, duration: 0.8, overwrite: true });
    gsap.to(startElement, { color: "#222", textShadow: "0 2px 5px rgba(0,0,0,0.2)", duration: 0.4, overwrite: true });
    
    const proxy = { x: startX, y: startY, size: 60, opacity: 0.2 };
    const updateDimmer = () => {
        globalDimmer.style.setProperty('--lx', `${proxy.x}px`);
        globalDimmer.style.setProperty('--ly', `${proxy.y}px`);
        globalDimmer.style.setProperty('--size', `${proxy.size}px`);
        globalDimmer.style.opacity = proxy.opacity;
    };

    searchTl = gsap.timeline({ onUpdate: updateDimmer, onInterrupt: resetLighting, onComplete: resetLighting });
    searchTl
        .to(proxy, {
            motionPath: { path: [{ x: corner1.x, y: corner1.y }, { x: corner2.x, y: corner2.y }, { x: destX, y: destY }], curviness: 1.5, autoRotate: false },
            duration: 3.0, ease: "power2.inOut"
        })
        .to(proxy, { size: targetSize, opacity: 0.98, duration: 1.0, ease: "power2.out" }, 0)
        .to({}, { duration: 0.5 });
}

function resetLighting() {
    searchTl = null;
    const proxy = { opacity: 1, size: 250 };
    gsap.to(proxy, {
        opacity: 0, size: 0, duration: 0.6,
        onUpdate: () => {
            globalDimmer.style.opacity = proxy.opacity;
            globalDimmer.style.setProperty('--size', `${proxy.size}px`);
        },
        onComplete: () => { gsap.to(mainHeader, { opacity: 1, duration: 0.5, overwrite: true }); }
    });
}

navGallery.addEventListener('click', function(e) { e.preventDefault(); runSearchlightSequence(this, 'gallery'); });
navAbout.addEventListener('click', function(e) { e.preventDefault(); runSearchlightSequence(this, 'footer'); });
document.addEventListener('click', (e) => { if (searchTl && !e.target.closest('.nav-link')) { searchTl.kill(); resetLighting(); } });

const copyLinks = document.querySelectorAll('.copy-text');
copyLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const text = link.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(() => {
            gsap.timeline()
                .to(link, { color: "#fff", scale: 1.2, textShadow: "0 0 15px rgba(255,255,255,1)", duration: 0.1 })
                .to(link, { color: "inherit", scale: 1, textShadow: "none", duration: 0.4, clearProps: "all" });
        });
    });
});

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

// Pricing Logic
const underline = document.createElement('div');
underline.className = 'pricing-underline';
pricingLink.appendChild(underline);

pricingLink.addEventListener('click', (e) => {
    e.preventDefault();
    togglePricing(true);
});

pricingSection.addEventListener('click', () => {
    togglePricing(false);
});

function togglePricing(isOpen) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (isOpen) {
        pricingSection.classList.add('active');
        pricingLink.classList.add('pricing-active');
        
        // Find visible middle items
        const w = window.innerWidth;
        const middle = w / 2;
        let sorted = Array.from(galleryItems).sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            const distA = Math.abs(middle - (rectA.left + rectA.width/2));
            const distB = Math.abs(middle - (rectB.left + rectB.width/2));
            return distA - distB;
        });

        // Push 3 closest to center
        sorted.slice(0, 3).forEach(item => item.classList.add('gallery-pushed'));
    } else {
        pricingSection.classList.remove('active');
        pricingLink.classList.remove('pricing-active');
        galleryItems.forEach(img => img.classList.remove('gallery-pushed'));
    }
}