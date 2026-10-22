/* ---------------------------------------------------------------------------
 * 9th Corner - shared site JavaScript
 *
 * THIS IS THE SINGLE SOURCE FILE for every page on the site (root and all
 * city sub-folders). It used to be duplicated 9 times, which caused the copies
 * to drift out of sync.
 *
 * EDIT THIS FILE, then run  build.bat  to regenerate js/9th.min.js.
 * Pages load the .min.js version - editing this file alone changes nothing
 * until you rebuild.
 *
 * NC_BASE is resolved from this script's own URL so that relative image paths
 * work identically from "/" and from "/delhi/", "/noida/", etc.
 * ------------------------------------------------------------------------- */
var NC_BASE = (function () {
  try {
    var s = document.currentScript;
    if (s && s.src) return new URL('../', s.src).href;
  } catch (e) {}
  return '/';
})();

//  Consolidated JavaScript
        document.addEventListener('DOMContentLoaded', () => {

          // === Mouse Trail Effect ===
            class MouseTrail {
                constructor() {
                    this.trail = [];
                    this.maxTrail = 20;
                    this.mouseX = 0;
                    this.mouseY = 0;
                    this.init();
                }

                init() {
                    // Disable effect on mobile screens (below 768px)
                    if (window.innerWidth < 768) return;

                    
                    document.addEventListener('mousemove', (e) => {
                        this.mouseX = e.clientX;
                        this.mouseY = e.clientY;
                    });

                    document.addEventListener('touchmove', (e) => {
                        if (e.touches.length > 0) {
                            this.mouseX = e.touches[0].clientX;
                            this.mouseY = e.touches[0].clientY;
                        }
                    });

                    this.createTrailElements();
                    this.animate();
                }

                createTrailElements() {
                    for (let i = 0; i < this.maxTrail; i++) {
                        const trail = document.createElement('div');
                        trail.className = 'mouse-trail';
                        trail.style.width = `${8 - (i * 0.3)}px`;
                        trail.style.height = `${8 - (i * 0.3)}px`;
                        trail.style.borderRadius = '50%';
                        trail.style.position = 'fixed';
                        trail.style.pointerEvents = 'none';
                        trail.style.zIndex = '9999';
                        trail.style.transform = 'translate(-50%, -50%)';
                        document.body.appendChild(trail);
                        this.trail.push({ element: trail, x: 0, y: 0 });
                    }
                }

                animate() {
                    let targetX = this.mouseX;
                    let targetY = this.mouseY;

                    this.trail.forEach((point, i) => {
                        point.x += (targetX - point.x) * 0.4;
                        point.y += (targetY - point.y) * 0.4;

                        point.element.style.left = point.x + 'px';
                        point.element.style.top = point.y + 'px';
                        
                        point.element.style.backgroundColor = `rgba(128, 128, 128, ${0.8 - (i * 0.04)})`;

                        targetX = point.x;
                        targetY = point.y;
                    });

                    requestAnimationFrame(() => this.animate());
                }
            }
            new MouseTrail();


            // === Fullscreen Menu Logic ===
            window.toggleMenu = function() {
                const menu = document.getElementById("menu");
                if (menu) {
                    menu.classList.toggle("active");
                }
            };

            // === Brand Carousel (GSAP) ===
            let track = document.querySelector(".brand-track");
            let brands = gsap.utils.toArray(".brand");
            
            if (track && brands.length > 0) {
                brands.forEach(brand => {
                    let clone = brand.cloneNode(true);
                    track.appendChild(clone);
                });

                let allBrands = gsap.utils.toArray(".brand");

                gsap.to(".brand img", {
                    opacity: 1,
                    scale: 1,
                    stagger: 0.6,
                    duration: 0.6,
                    ease: "power2.out"
                });

                let totalWidth = brands.reduce((acc, brand) => {
                    return acc + brand.offsetWidth + 80;
                }, 0);

                gsap.to(track, {
                    x: -totalWidth,
                    duration: 20,
                    ease: "none",
                    repeat: -1,
                    modifiers: {
                        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
                    }
                });

                allBrands.forEach(brand => {
                    gsap.to(brand, {
                        y: "+=10",
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        duration: gsap.utils.random(2, 4),
                        delay: gsap.utils.random(0, 1)
                    });
                });
            }

            // Register the ScrollTrigger plugin with GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Animate the cards as they scroll into view
  gsap.utils.toArray('.card-section').forEach(card => {
    gsap.fromTo(card, {
      opacity: 1,
      y: 50
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  });

            // === Precision Section Animation (GSAP) ===
            gsap.registerPlugin(ScrollTrigger);

            function wrapCharacters(selector) {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    let content = el.textContent.trim();
                    let newContent = '';
                    for (let i = 0; i < content.length; i++) {
                        newContent += `<span>${content[i] === ' ' ? '&nbsp;' : content[i]}</span>`;
                    }
                    el.innerHTML = newContent;
                });
            }

            function setupPrecisionSectionAnimation() {
                if (!document.querySelector('.precision-section')) return;
                wrapCharacters('.title, .paragraph');

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: ".precision-section",
                        start: "top center",
                        toggleActions: "play reverse play reverse",
                    }
                });

                tl.from(".gsap-img", {
                    x: 100,
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out",
                });

                tl.from(".title span", {
                    y: 50,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                }, "-=0.8");

                tl.from(".paragraph span", {
                    y: 50,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.02,
                    ease: "power2.out",
                }, "-=0.4");
            }
            setupPrecisionSectionAnimation();
        });


        
       gsap.registerPlugin(ScrollTrigger);

// about us //
gsap.registerPlugin(ScrollTrigger);

// Use ScrollTrigger.matchMedia() to create responsive animations
if (document.querySelector('.about-section')) {
ScrollTrigger.matchMedia({

  // --- DESKTOP ANIMATIONS ---
  // These animations will *only* run on screens wider than 768px
  "(min-width: 769px)": function() {

    // Fade out ABOUT US before content appears
    if (document.querySelector('.about-title')) {
    gsap.to(".about-title h1", {
      scale: 0.6,
      opacity: 1,
      scrollTrigger: {
        trigger: ".about-content",
        start: "top 90%",
        end: "top 70%",
        scrub: true
      }
    });
    }

    // Background color change: black only during content section
    ScrollTrigger.create({
      trigger: ".about-content",
      start: "top center",
      end: "bottom bottom",
      scrub: true,
      onEnter: () => {
        gsap.to(".about-section", { backgroundColor: "#000", color: "#fff", duration: 0.5 });
      },
      onLeaveBack: () => {
        gsap.to(".about-section", { backgroundColor: "#fff", color: "#000", duration: 0.5 });
      }
    });

    // Image fade-in from left
    if (document.querySelector('.about-image')) {
    gsap.fromTo(".about-image",
      { x: -100, opacity: 0 },
      {
        x: 0, opacity: 1,
        scrollTrigger: {
          trigger: ".about-content",
          start: "top 80%",
          end: "top 50%",
          scrub: true
        }
      }
    );
    }

    // Text fade-in from right
    if (document.querySelector('.about-text')) {
    gsap.fromTo(".about-text",
      { x: 100, opacity: 0 },
      {
        x: 0, opacity: 1,
        scrollTrigger: {
          trigger: ".about-content",
          start: "top 80%",
          end: "top 50%",
          scrub: true
        }
      }
    );
    }

    // Reveal content
    if (document.querySelector('.about-content')) {
    ScrollTrigger.create({
      trigger: ".about-content",
      start: "top 80%",
      onEnter: () => gsap.to(".about-content", { opacity: 1, duration: 1 })
    });
    }

  }, // end of desktop function

  // --- MOBILE ---
  // On screens 768px and smaller, no animations will be created.
  "(max-width: 768px)": function() {
    // No animations here.
    // The CSS fix (opacity: 1) ensures content is visible.
  }

}); // end of matchMedia
} // end of about-section guard
// panel

//  gsap.registerPlugin(ScrollTrigger);

//     gsap.from(".hover-gallery", {
//       opacity: 0,
//       y: 100,
//       duration: 1.2,
//       ease: "power3.out",
//       scrollTrigger: {
//         trigger: ".hover-gallery",
//         start: "top 80%",
//         end: "bottom 60%",
//         scrub: true
//       }
//     });

//     gsap.utils.toArray(".panel").forEach((panel) => {
//       gsap.to(panel, {
//         yPercent: -12,
//         ease: "none",
//         scrollTrigger: {
//           trigger: ".hover-gallery",
//           start: "top bottom",
//           end: "bottom top",
//           scrub: true,
//         }
//       });
//     });


gsap.registerPlugin(ScrollTrigger);

    // Use ScrollTrigger.matchMedia to only run scroll effects on wider screens
    if (document.querySelector('.hover-gallery')) {
    ScrollTrigger.matchMedia({
      // desktop and large tablet
      "(min-width: 641px)": function() {
        // Fade-in + parallax entrance
        gsap.from(".hover-gallery", {
          opacity: 0,
          y: 80,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hover-gallery",
            start: "top 85%",
            end: "bottom 60%",
            scrub: true
          }
        });

        // Subtle parallax scroll effect for each panel's background position
        gsap.utils.toArray(".panel").forEach((panel) => {
          gsap.to(panel, {
            backgroundPosition: "50% 30%",
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          });
        });
      },

      // mobile: disable scroll animations to save performance
      "(max-width: 640px)": function() {
        // no scroll animations on small devices
      }
    });
    } // end of hover-gallery guard

    // Touch / click handling for small screens: tap to expand
    (function (){
      const gallery = document.getElementById('gallery');
      if (!gallery) return;
      const panels = gallery.querySelectorAll('.panel');

      function clearActive(except = null){
        panels.forEach(p => {
          if (p !== except) {
            p.classList.remove('active');
            p.classList.add('inactive');
          } else {
            p.classList.remove('inactive');
          }
        });
      }

    const isDesktop = () => window.matchMedia('(min-width:641px)').matches;

    panels.forEach(panel => {
        // Click toggles only on small screens (responsive)
        panel.addEventListener('click', (e) => {
            if (isDesktop()) return; // on desktop rely on hover
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                panels.forEach(p => p.classList.remove('inactive'));
            } else {
                panel.classList.add('active');
                clearActive(panel);
            }
        });

        // Hover behavior for desktop
        panel.addEventListener('mouseenter', () => {
            if (!isDesktop()) return;
            clearActive(panel);
            panel.classList.add('active');
        });

        panel.addEventListener('mouseleave', () => {
            if (!isDesktop()) return;
            panel.classList.remove('active');
            panels.forEach(p => p.classList.remove('inactive'));
        });

        // keyboard accessibility: Enter / Space toggles
        panel.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            panel.click();
          }
        });
      });

      // Click outside gallery clears active state
      document.addEventListener('click', (e) => {
        if (!gallery.contains(e.target)){
          panels.forEach(p => p.classList.remove('active','inactive'));
        }
      });
    })();

    // slide gallery

     document.addEventListener("DOMContentLoaded", () => {
            // Register ScrollTrigger plugin
            gsap.registerPlugin(ScrollTrigger);

            // Image arrays - using placeholder images as original URLs are not available
            const imagesRow1 = [
                 NC_BASE+"img/thumbs/ch1.avif",
    NC_BASE+"img/thumbs/ch2.avif",
    NC_BASE+"img/thumbs/ch3.avif",
    NC_BASE+"img/thumbs/ch4.avif",
    NC_BASE+"img/thumbs/ch5.avif",
    NC_BASE+"img/thumbs/ch6.avif",
    NC_BASE+"img/thumbs/ch7.avif",
    NC_BASE+"img/thumbs/ch8.avif",
    NC_BASE+"img/thumbs/ch9.avif",
    NC_BASE+"img/thumbs/ch10.avif",
    NC_BASE+"img/thumbs/ch11.avif",
    NC_BASE+"img/thumbs/ch12.avif",
            ];

            const imagesRow2 = [
                NC_BASE+"img/thumbs/ch13.avif",
    NC_BASE+"img/thumbs/ch14.avif",
    NC_BASE+"img/thumbs/ch15.avif",
    NC_BASE+"img/thumbs/ch16.avif",
    NC_BASE+"img/thumbs/ch17.avif",
    NC_BASE+"img/thumbs/ch18.avif",
    NC_BASE+"img/thumbs/ch19.avif",
    NC_BASE+"img/thumbs/ch20.avif",
    NC_BASE+"img/thumbs/ch21.avif",
    NC_BASE+"img/thumbs/ch22.avif",
    NC_BASE+"img/thumbs/ch23.avif",
    NC_BASE+"img/thumbs/ch24.avif",
    NC_BASE+"img/thumbs/ch25.avif",
            ];

            const slider1 = document.getElementById('slider1');
            const slider2 = document.getElementById('slider2');

            /**
             * Populates a slider with images, duplicating the list for a seamless loop.
             * @param {HTMLElement} slider The DOM element to populate.
             * @param {Array<string>} imageList The list of image URLs.
             */
            function populateSlider(slider, imageList) {
                const fragment = document.createDocumentFragment();
                // Duplicate images to create a continuous, seamless loop
                const fullList = [...imageList, ...imageList];
                fullList.forEach(src => {
                    const a = document.createElement('a');
                    a.href = '#';
                    const img = document.createElement('img');
                    img.loading = 'lazy';
                    img.decoding = 'async';
                    img.src = src;
                    const _plabel = ("9th Corner interior design project").trim(); img.alt = _plabel; img.title = _plabel; a.title = _plabel;
                    a.appendChild(img);
                    fragment.appendChild(a);
                });
                slider.appendChild(fragment);
            }

            populateSlider(slider1, imagesRow1);
            populateSlider(slider2, imagesRow2);

            // --- GSAP Animation Logic ---

            /**
             * Creates a horizontal loop animation for a slider using GSAP.
             * This function handles continuous, gapless looping.
             * @param {string} selector The CSS selector for the slider inner container.
             * @param {number} duration The duration of one complete animation loop.
             * @param {number} direction The direction of the animation (1 for right, -1 for left).
             */
            function setupGSAPSlider(selector, duration, direction) {
                const inner = document.querySelector(selector);
                if (!inner) return;

                // The total width of the elements is half of the slider-inner's
                // total width because we've duplicated the images.
                const distanceToMove = inner.scrollWidth / 2;
                
                // Define the start and end values for the animation based on direction.
                const fromX = direction === 1 ? -distanceToMove : 0;
                const toX = direction === 1 ? 0 : -distanceToMove;

                // Create the continuous loop animation using fromTo
                const animation = gsap.fromTo(inner, {
                    x: fromX
                }, {
                    x: toX,
                    duration: duration,
                    ease: "none",
                    repeat: -1,
                });

                // Use ScrollTrigger to play/pause the animation when the element is in view
                ScrollTrigger.create({
                    trigger: inner,
                    start: "top bottom",
                    end: "bottom top",
                    onEnter: () => animation.play(),
                    onLeave: () => animation.pause(),
                    onEnterBack: () => animation.play(),
                    onLeaveBack: () => animation.pause(),
                });

                // Pause the animation on hover
                inner.addEventListener('mouseenter', () => animation.pause());
                inner.addEventListener('mouseleave', () => animation.play());
            }

            // Setup the two sliders with different directions and durations
            setupGSAPSlider("#slider1", 20, -1); // Row 1: Leftward slide
            setupGSAPSlider("#slider2", 35, 1);  // Row 2: Rightward slide
        });

        // theme

         document.addEventListener('DOMContentLoaded', () => {
            // Select all theme item cards
            const themeItems = document.querySelectorAll('.theme-item');
            
            // Keep track of the currently active gallery
            let activeGallery = null;
            let activeArrowIcon = null;

            // Add a click event listener to each card
            themeItems.forEach(item => {
                item.addEventListener('click', () => {
                    // Get the gallery associated with this card
                    const parentBlock = item.closest('.theme-block');
                    const gallery = parentBlock.querySelector('.gallery-container');
                    const arrowIcon = item.querySelector('.arrow-icon');
                    
                    // Check if the clicked gallery is already open
                    if (activeGallery === gallery) {
                        // If it is, close it
                        gsap.to(gallery, {
                            duration: 0.5,
                            height: 0,
                            opacity: 1,
                            ease: "power2.inOut",
                            onComplete: () => {
                                gallery.style.display = 'none';
                            }
                        });
                        gsap.to(arrowIcon, { rotation: 0, duration: 0.3 });
                        activeGallery = null;
                        activeArrowIcon = null;
                    } else {
                        // If another gallery is open, close it first
                        if (activeGallery) {
                            gsap.to(activeGallery, {
                                duration: 0.5,
                                height: 0,
                                opacity: 1,
                                ease: "power2.inOut",
                                onComplete: () => {
                                    activeGallery.style.display = 'none';
                                }
                            });
                            // Rotate the previous arrow back to its original position
                            gsap.to(activeArrowIcon, { rotation: 0, duration: 0.3 });
                        }

                        // Then, open the new gallery
                        gallery.style.display = 'grid'; // Make it display before animating
                        gsap.fromTo(gallery, {
                            height: 0,
                            opacity: 1
                        }, {
                            duration: 0.8,
                            height: 'auto',
                            opacity: 1,
                            ease: "power2.inOut"
                        });
                        
                        // GSAP animation for the gallery images
                        gsap.fromTo(gallery.children, {
                            y: 20,
                            opacity: 0
                        }, {
                            y: 0,
                            opacity: 1,
                            stagger: 0.1, // Stagger the animation for each image
                            duration: 0.6,
                            ease: "power2.out"
                        });

                        // Rotate the new arrow to indicate open state
                        gsap.to(arrowIcon, { rotation: 180, duration: 0.3 });

                        // Set the new active gallery and arrow
                        activeGallery = gallery;
                        activeArrowIcon = arrowIcon;
                    }
                });
            });

            // GSAP ScrollTrigger for a simple fade-in effect on the main section
            gsap.registerPlugin(ScrollTrigger);
            if (document.querySelector('.container')) {
            gsap.from('.container', {
                y: 50,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.container',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
            }

        });

        // theme 

        document.addEventListener('DOMContentLoaded', () => {
            const themeItems = document.querySelectorAll('.theme-item');
            
            // A data structure to hold the image URLs for each theme
            const galleryData = {
                minimalism: [
            NC_BASE+'img/min1.avif', 
            NC_BASE+'img/min2.avif', 
            NC_BASE+'img/min3.avif', 
            NC_BASE+'img/min4.avif', 
            NC_BASE+'img/min5.avif', 
            NC_BASE+'img/min6.avif', 
                ],
                artdeco: [
            NC_BASE+'img/art1.avif', 
            NC_BASE+'img/art2.avif', 
            NC_BASE+'img/art3.avif', 
            NC_BASE+'img/art4.avif', 
            NC_BASE+'img/art5.avif', 
            NC_BASE+'img/art6.avif', 
                ],
                midcentury: [
                  NC_BASE+'img/t1.avif', 
            NC_BASE+'img/t2.avif', 
            NC_BASE+'img/t3.avif', 
            NC_BASE+'img/t4.avif', 
            NC_BASE+'img/t5.avif', 
            NC_BASE+'img/t6.avif', 
                ],
                bohemian: [
                    NC_BASE+'img/bo1.avif', 
            NC_BASE+'img/bo2.avif', 
            NC_BASE+'img/bo3.avif', 
            NC_BASE+'img/bo4.avif', 
            NC_BASE+'img/bo5.avif', 
            NC_BASE+'img/bo6.avif', 
                ],
                coastal: [
                   NC_BASE+'img/cos1.avif', 
            NC_BASE+'img/cos2.avif', 
            NC_BASE+'img/cos3.avif', 
            NC_BASE+'img/cos4.avif', 
            NC_BASE+'img/cos5.avif', 
            NC_BASE+'img/cos6.avif', 
                ],
                scandinavian: [
                   NC_BASE+'img/sc1.avif', 
            NC_BASE+'img/sc2.avif', 
            NC_BASE+'img/sc3.avif', 
            NC_BASE+'img/sc4.avif', 
            NC_BASE+'img/sc5.avif', 
            NC_BASE+'img/sc6.avif', 
                ],
                industrial: [
                          NC_BASE+'img/ind1.avif', 
            NC_BASE+'img/ind2.avif', 
            NC_BASE+'img/ind3.avif', 
            NC_BASE+'img/ind4.avif', 
            NC_BASE+'img/ind5.avif', 
            NC_BASE+'img/ind6.avif', 
                ],
                rustic: [
                         NC_BASE+'img/rus1.avif', 
            NC_BASE+'img/rus2.avif', 
            NC_BASE+'img/rus3.avif', 
            NC_BASE+'img/rus4.avif', 
            NC_BASE+'img/rus5.avif', 
            NC_BASE+'img/rus6.avif', 
                ],
                farmhouse: [
                         NC_BASE+'img/fa1.avif', 
            NC_BASE+'img/fa2.avif', 
            NC_BASE+'img/fa3.avif', 
            NC_BASE+'img/fa4.avif', 
            NC_BASE+'img/fa5.avif', 
            NC_BASE+'img/fa6.avif', 
                ],
                contemporary: [
                          NC_BASE+'img/con1.avif', 
            NC_BASE+'img/con2.avif', 
            NC_BASE+'img/con3.avif', 
            NC_BASE+'img/con4.avif', 
            NC_BASE+'img/con5.avif', 
            NC_BASE+'img/con6.avif', 
                ],
                eclectic: [
                          NC_BASE+'img/e1.avif', 
            NC_BASE+'img/e2.avif', 
            NC_BASE+'img/e3.avif', 
            NC_BASE+'img/e4.avif', 
            NC_BASE+'img/e5.avif', 
            NC_BASE+'img/e6.avif', 
                ],
                traditional: [
                          NC_BASE+'img/tra1.avif', 
            NC_BASE+'img/tra2.avif', 
            NC_BASE+'img/tra3.avif', 
            NC_BASE+'img/tra4.avif', 
            NC_BASE+'img/tra5.avif', 
            NC_BASE+'img/tra6.avif', 
                ],
            };
            
            let activeGallery = null; // A reference to the currently open gallery element

            themeItems.forEach(item => {
                item.addEventListener('click', () => {
                    const arrowIcon = item.querySelector('.arrow-icon');
                    
                    // Check if a gallery is already open
                    if (activeGallery) {
                        // If the same card is clicked again, toggle off
                        if (activeGallery.previousElementSibling === item) {
                            closeGallery();
                        } else {
                            // If a different card is clicked, close the old one and open the new one
                            closeGallery();
                            setTimeout(() => {
                                openGallery(item);
                            }, 500); // Small delay to allow transition to finish
                        }
                    } else {
                        // No gallery is open, so open a new one
                        openGallery(item);
                    }
                });
            });

            function openGallery(card) {
                const galleryId = card.dataset.galleryId;
                const images = galleryData[galleryId];
                const arrowIcon = card.querySelector('.arrow-icon');
                
                // Create the new gallery container
                const gallery = document.createElement('div');
                gallery.classList.add('gallery-container');
                
                // Create the hide button
                const hideButton = document.createElement('button');
                hideButton.classList.add('hide-button');
                hideButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>`;
                hideButton.addEventListener('click', closeGallery);
                
                gallery.appendChild(hideButton);

                // Create and append the image elements
                images.forEach(imgSrc => {
                    const imgElement = document.createElement('img');
                    imgElement.src = imgSrc;
                    const _glabel = `${galleryId} interior design gallery image by 9th Corner`; imgElement.alt = _glabel; imgElement.title = _glabel;
                    imgElement.classList.add('gallery-img');
                    gallery.appendChild(imgElement);
                });
                
                // Insert the new gallery right after the clicked card
                card.insertAdjacentElement('afterend', gallery);
                activeGallery = gallery; // Store a reference to the new gallery

                // Trigger the animation
                setTimeout(() => {
                    gallery.classList.add('open');
                }, 10);
                
                // Rotate the arrow icon on the selected card
                arrowIcon.style.transform = 'rotate(180deg)';
            }

            function closeGallery() {
                if (!activeGallery) return;

                const card = activeGallery.previousElementSibling;
                if (card) {
                    const arrowIcon = card.querySelector('.arrow-icon');
                    arrowIcon.style.transform = 'rotate(0deg)';
                }

                // Remove the 'open' class to trigger the closing transition
                activeGallery.classList.remove('open');
                
                // Wait for the transition to finish before removing the element
                activeGallery.addEventListener('transitionend', function handler() {
                    activeGallery.remove();
                    activeGallery = null; // Clear the reference
                    activeGallery.removeEventListener('transitionend', handler);
                }, { once: true });
            }
        });

        // statue
         gsap.registerPlugin(ScrollTrigger, TextPlugin);

const animatedSection = document.querySelector(".animated-section");
const statueImg = document.querySelector(".statue-img");
const quoteText = document.querySelector(".quote-text");

if (animatedSection && statueImg && quoteText) {
const quote = "Lines create structures, but passion creates experiences — at The 9th Corner Inc., we don’t just build spaces; we shape emotions and memories, because a home or office is never just a layout, it’s a true reflection of one’s lifestyle, choices, and way of living.” <br> <b>– Rahuul Guptaa</b>";

// Floating Animation for the Statue (continuous)
gsap.to(statueImg, {
    y: "-=20",
    duration: 3,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true
});

// Glowing Background Animation (continuous)
gsap.to(".glow-bg", {
    scale: 1.1,
    opacity: 0.8,
    duration: 5,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true
});

// Timeline triggered by scrolling
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: animatedSection,
        start: "top center",
        // Increase the end value to give more scroll space for typing
        end: "+=50", // Increased from a previous value, giving 500px of scroll
        scrub: 7
    }
});

// Animation 1: Move the statue to the left
tl.to(statueImg, {
    x: "-100", // Move statue 100px to the left
    duration: 2,
    ease: "power2.out"
});

// Animation 2: Start typing the quote on the right
tl.to(quoteText, {
    text: quote, // Auto-type the quote
    opacity: 1, // Make the text visible
    duration: 3,
    ease: "none"
}, "<0.5"); // Starts this animation 0.5 seconds before the previous one ends

} // end of animatedSection guard

 document.addEventListener('DOMContentLoaded', () => {
        const arrowButton = document.getElementById('arrowButton');
        const overlay = document.getElementById('overlay');
        const closeBtn = document.getElementById('closeBtn');

        // GSAP animation for the pills
        gsap.from(".pill-button", {
            duration: 1,
            y: 50,
            opacity: 0,
            scale: 0.8,
            stagger: 0.2,
            ease: "power2.out"
        });

        // Function to open the overlay
        if (arrowButton) {
            arrowButton.addEventListener('click', () => {
                overlay.classList.add('visible');
            });
        }
        
        // Function to close the overlay
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('visible');
            });
        }

        // Close overlay with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('visible')) {
                overlay.classList.remove('visible');
            }
        });
    });


        

// video
       // Wait for the window to load before running the script
        window.onload = function() {
            // Register the GSAP ScrollTrigger plugin
            gsap.registerPlugin(ScrollTrigger);

            // Get references to the DOM elements
            const videoContainer = document.getElementById('video-container');
            const scrollLeftBtn = document.getElementById('scroll-left');
            const scrollRightBtn = document.getElementById('scroll-right');
            const cardItems = gsap.utils.toArray('.card-item'); // Use GSAP's utility to get an array of elements

            // Animate cards into view on scroll using GSAP
            gsap.set(cardItems, { opacity: 1, y: 50 }); // Set initial state of cards (invisible and slightly below)

            gsap.timeline({
                scrollTrigger: {
                    trigger: ".section-container", // The section that triggers the animation
                    start: "top 80%", // When the top of the section hits 80% of the viewport
                    toggleActions: "play none none none" // Play the animation once, then do nothing
                }
            })
            .to(cardItems, {
                opacity: 1, // Animate to full opacity
                y: 0, // Animate to original vertical position
                duration: 1.2, // Duration of the animation
                stagger: 0.1, // Stagger the animation of each card by 0.1 seconds
                ease: "power2.out"
            });

            // Function to handle smooth scrolling
            const scrollCarousel = (direction) => {
                // Recalculate the scroll amount on every click for maximum reliability
                const firstCard = videoContainer.querySelector('.card-item');
                if (!firstCard) {
                    console.error("No card items found to calculate scroll amount.");
                    return;
                }
                const cardWidth = firstCard.offsetWidth;
                const style = window.getComputedStyle(videoContainer);
                const gap = parseFloat(style.columnGap);
                const scrollAmount = cardWidth + gap;

                if (direction === 'left') {
                    videoContainer.scrollBy({
                        left: -scrollAmount,
                        behavior: 'smooth'
                    });
                } else if (direction === 'right') {
                    videoContainer.scrollBy({
                        left: scrollAmount,
                        behavior: 'smooth'
                    });
                }
            };

            // Add event listeners to the buttons
            if (scrollLeftBtn && scrollRightBtn) {
                scrollLeftBtn.addEventListener('click', () => {
                    scrollCarousel('left');
                });
                
                scrollRightBtn.addEventListener('click', () => {
                    scrollCarousel('right');
                });
            } else {
                // Scroll buttons not present on this page, skipping.
            }
        };

        // magazine

 // Duplicate the scroll track content to create a seamless loop
        const scrollTrack = document.querySelector('.scroll-track');
        if (scrollTrack) {
        const trackContent = scrollTrack.innerHTML;
        scrollTrack.innerHTML = trackContent + trackContent;
        }

         document.addEventListener("DOMContentLoaded", () => {
            gsap.registerPlugin(ScrollTrigger);

            if (document.querySelector('.design-section')) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".design-section",
                    start: "top bottom",
                    toggleActions: "play none play none",
                }
            });

            tl.from(".design-image", {
                duration: 1.2,
                opacity: 0,
                y: 50,
                scale: 0.9,
                ease: "power3.out"
            });
            
            tl.from(".design-list-item", {
                duration: 0.8,
                opacity: 0,
                y: 20,
                stagger: 0.2,
                ease: "power3.out"
            }, "-=0.8");
            } // end of design-section guard
        });

    